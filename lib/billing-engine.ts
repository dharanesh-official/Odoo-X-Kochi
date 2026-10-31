import { createClient } from "@supabase/supabase-js"
import { advanceSubscriptionPeriod } from "./financial"
import { sendInvoiceEmail } from "./email"
import { logAuditEvent } from "./audit"

export interface BillingRunResult {
    runId: string
    executedAt: string
    totalEvaluated: number
    invoicesGenerated: number
    skippedCount: number
    failedCount: number
    details: {
        subscriptionId: string
        invoiceId?: string
        status: 'billed' | 'skipped' | 'failed'
        message: string
        amount?: number
    }[]
}

/**
 * Creates an admin Supabase client using Service Role key to bypass RLS for background engine runs.
 */
function getAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !serviceKey) {
        throw new Error("Supabase credentials missing for Automated Billing Engine.")
    }
    return createClient(url, serviceKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    })
}

/**
 * Executes an automated recurring billing cycle run across all active subscriptions due for renewal.
 */
export async function executeBillingRun(): Promise<BillingRunResult> {
    const supabase = getAdminClient()
    const now = new Date()
    const runId = `run_${Date.now()}`

    const result: BillingRunResult = {
        runId,
        executedAt: now.toISOString(),
        totalEvaluated: 0,
        invoicesGenerated: 0,
        skippedCount: 0,
        failedCount: 0,
        details: [],
    }

    // 1. Query active subscriptions due for billing (current_period_end <= now)
    const { data: dueSubscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select(`
            *,
            customers (*),
            plans (*),
            subscription_lines (*)
        `)
        .eq('status', 'active')
        .lte('current_period_end', now.toISOString())

    if (subError) {
        console.error('Billing Engine - Failed to fetch due subscriptions:', subError)
        throw new Error(`Billing Engine Database Error: ${subError.message}`)
    }

    result.totalEvaluated = dueSubscriptions?.length || 0

    if (!dueSubscriptions || dueSubscriptions.length === 0) {
        return result
    }

    // Load active taxes
    const { data: activeTaxes } = await supabase.from('taxes').select('rate').eq('active', true)
    let totalTaxPercent = activeTaxes?.reduce((acc, t) => acc + Number(t.rate || 0), 0) || 0
    if (totalTaxPercent === 0) totalTaxPercent = 18 // Fallback standard GST

    for (const sub of dueSubscriptions) {
        try {
            const currentPeriodEnd = new Date(sub.current_period_end || sub.current_period_start || now)

            // 2. Idempotency Check: Verify if an invoice has already been generated for this subscription on or after current_period_end
            const { data: existingRecentInvoice } = await supabase
                .from('invoices')
                .select('id, created_at')
                .eq('subscription_id', sub.id)
                .gte('created_at', new Date(currentPeriodEnd.getTime() - 24 * 60 * 60 * 1000).toISOString())
                .neq('status', 'cancelled')
                .maybeSingle()

            if (existingRecentInvoice) {
                result.skippedCount++
                result.details.push({
                    subscriptionId: sub.id,
                    status: 'skipped',
                    message: `Invoice #${existingRecentInvoice.id.slice(0, 8)} already exists for this billing period.`,
                })
                continue
            }

            // 3. Compute Line Items and Subtotal
            const lines = sub.subscription_lines || []
            let subtotal = 0
            const itemsToSnapshot: {
                product_id?: string
                plan_id?: string
                description: string
                quantity: number
                unit_price: number
                discount_amount: number
                tax_amount: number
                subtotal: number
                total: number
            }[] = []

            if (lines.length > 0) {
                for (const line of lines) {
                    const lineSubtotal = Number(line.unit_price) * Number(line.quantity)
                    const lineTax = lineSubtotal * (totalTaxPercent / 100)
                    subtotal += lineSubtotal
                    itemsToSnapshot.push({
                        product_id: line.product_id,
                        description: line.name || 'Subscription Line Item',
                        quantity: line.quantity,
                        unit_price: Number(line.unit_price),
                        discount_amount: 0,
                        tax_amount: lineTax,
                        subtotal: lineSubtotal,
                        total: lineSubtotal + lineTax,
                    })
                }
            } else if (sub.plans) {
                const qty = Number(sub.quantity) || 1
                const unitPrice = Number(sub.plans.amount || 0)
                const lineSubtotal = unitPrice * qty
                const lineTax = lineSubtotal * (totalTaxPercent / 100)
                subtotal += lineSubtotal
                itemsToSnapshot.push({
                    product_id: sub.plans.product_id,
                    plan_id: sub.plan_id,
                    description: `${sub.plans.name} (${sub.plans.interval || 'Recurring'})`,
                    quantity: qty,
                    unit_price: unitPrice,
                    discount_amount: 0,
                    tax_amount: lineTax,
                    subtotal: lineSubtotal,
                    total: lineSubtotal + lineTax,
                })
            }

            if (itemsToSnapshot.length === 0) {
                result.skippedCount++
                result.details.push({
                    subscriptionId: sub.id,
                    status: 'skipped',
                    message: 'No order lines or plan amount associated with subscription.',
                })
                continue
            }

            const taxAmount = subtotal * (totalTaxPercent / 100)
            const totalAmount = subtotal + taxAmount

            const paymentTermsDays = Number(sub.payment_terms) || 15
            const dueDate = new Date(now.getTime() + paymentTermsDays * 24 * 60 * 60 * 1000)

            // 4. Create Invoice
            const { data: invoice, error: invError } = await supabase
                .from('invoices')
                .insert({
                    subscription_id: sub.id,
                    customer_id: sub.customer_id,
                    amount_due: totalAmount,
                    amount_paid: 0.00,
                    currency: sub.plans?.currency || 'inr',
                    status: 'confirmed',
                    due_date: dueDate.toISOString(),
                })
                .select()
                .single()

            if (invError || !invoice) {
                throw new Error(`Failed to insert invoice: ${invError?.message}`)
            }

            // 5. Snapshot Invoice Items
            for (const item of itemsToSnapshot) {
                await supabase.from('invoice_items').insert({
                    invoice_id: invoice.id,
                    product_id: item.product_id || null,
                    plan_id: item.plan_id || null,
                    description: item.description,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    discount_amount: item.discount_amount,
                    tax_amount: item.tax_amount,
                    subtotal: item.subtotal,
                    total: item.total,
                })
            }

            // 6. Advance Subscription Period
            const interval = (sub.plans?.interval || 'monthly') as any
            const newPeriodStart = currentPeriodEnd
            const newPeriodEnd = advanceSubscriptionPeriod(currentPeriodEnd, interval, 1)

            const { error: advanceError } = await supabase
                .from('subscriptions')
                .update({
                    current_period_start: newPeriodStart.toISOString(),
                    current_period_end: newPeriodEnd.toISOString(),
                })
                .eq('id', sub.id)

            if (advanceError) {
                console.warn(`Could not advance period for subscription ${sub.id}:`, advanceError)
            }

            // 7. Send notification email to customer
            if (sub.customers?.email) {
                await sendInvoiceEmail({
                    customerName: sub.customers.name || 'Valued Customer',
                    customerEmail: sub.customers.email,
                    invoiceId: invoice.id,
                    invoiceNumber: invoice.id.slice(0, 8).toUpperCase(),
                    amount: totalAmount,
                    dueDate: dueDate.toISOString(),
                    planName: sub.plans?.name || 'Recurring Subscription',
                    quantity: sub.quantity || 1,
                    subtotal,
                    tax: taxAmount,
                    total: totalAmount,
                }).catch((e) => console.warn('Email delivery skipped:', e))
            }

            await logAuditEvent({
                entityType: 'billing',
                entityId: sub.id,
                action: 'recurring_invoice_generated',
                performedBy: 'system/billing-engine',
                details: {
                    subscription_id: sub.id,
                    invoice_id: invoice.id,
                    amount: totalAmount,
                    period_end: newPeriodEnd.toISOString(),
                },
            })

            result.invoicesGenerated++
            result.details.push({
                subscriptionId: sub.id,
                invoiceId: invoice.id,
                status: 'billed',
                message: `Invoice generated successfully for cycle ending ${newPeriodEnd.toISOString().split('T')[0]}.`,
                amount: totalAmount,
            })
        } catch (err: any) {
            console.error(`Billing error for subscription ${sub.id}:`, err)
            result.failedCount++
            result.details.push({
                subscriptionId: sub.id,
                status: 'failed',
                message: err.message || 'Unknown processing error',
            })
        }
    }

    return result
}
