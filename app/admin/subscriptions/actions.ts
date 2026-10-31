'use server'

import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { sendInvoiceEmail } from '@/lib/email'

export async function createSubscription(formData: FormData) {
    const { supabase } = await requireAdmin()

    const customerId = formData.get('customer_id') as string
    const status = formData.get('status') as string || 'draft'
    const startDate = formData.get('start_date') ? new Date(formData.get('start_date') as string) : new Date()
    const paymentTerms = Number(formData.get('payment_terms') || 7)

    if (!customerId) {
        return redirect('/admin/subscriptions/new?error=Customer is required')
    }

    // Extract multi-line data
    const lines: { planId: string, quantity: number }[] = []
    const keys = Array.from(formData.keys())

    // Find all unique indices from lines[i].plan_id
    const indices = new Set<string>()
    keys.forEach(k => {
        const match = k.match(/lines\[(\d+)\]\.plan_id/)
        if (match) indices.add(match[1])
    })

    indices.forEach(i => {
        const planId = formData.get(`lines[${i}].plan_id`) as string
        const quantity = Number(formData.get(`lines[${i}].quantity`) || 1)
        if (planId) {
            lines.push({ planId, quantity })
        }
    })

    if (lines.length === 0) {
        // Fallback for single plan (old UI)
        const planId = formData.get('plan_id') as string
        const quantity = Number(formData.get('quantity') || 1)
        if (planId) lines.push({ planId, quantity })
    }

    if (lines.length === 0) {
        return redirect('/admin/subscriptions/new?error=At least one plan must be selected')
    }

    // 1. Create Subscription header
    // Use the first plan as the 'primary' for legacy compatibility if needed
    const primaryPlanId = lines[0].planId
    const { data: subscription, error: subError } = await supabase.from('subscriptions').insert({
        customer_id: customerId,
        plan_id: primaryPlanId,
        status,
        current_period_start: startDate.toISOString(),
        payment_terms: paymentTerms,
    }).select().single()

    if (subError) {
        console.error('Sub header error:', subError)
        return redirect('/admin/subscriptions/new?error=Could not create subscription')
    }

    // 2. Create Subscription Lines
    let subtotalAmount = 0
    for (const line of lines) {
        const { data: plan } = await supabase.from('plans').select('name, amount, product_id').eq('id', line.planId).single()
        if (plan) {
            const lineAmount = Number(plan.amount) * line.quantity
            subtotalAmount += lineAmount
            await supabase.from('subscription_lines').insert({
                subscription_id: subscription.id,
                product_id: plan.product_id,
                name: plan.name,
                quantity: line.quantity,
                unit_price: Number(plan.amount)
            })
        }
    }

    // 3. Handle Invoicing if active
    if (status === 'active' && subscription) {
        const { data: taxes } = await supabase.from('taxes').select('rate').eq('active', true)
        let totalTaxPercent = taxes?.reduce((acc, t) => acc + Number(t.rate), 0) || 0
        if (totalTaxPercent === 0 && (!taxes || taxes.length === 0)) totalTaxPercent = 18

        const taxAmount = subtotalAmount * (totalTaxPercent / 100)
        const totalAmount = subtotalAmount + taxAmount

        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + paymentTerms)

        const { data: invoice } = await supabase.from('invoices').insert({
            subscription_id: subscription.id,
            customer_id: customerId,
            amount_due: totalAmount,
            currency: 'inr',
            status: 'confirmed',
            due_date: dueDate.toISOString(),
        }).select().single()

        if (invoice) {
            // Snapshot line items into invoice_items table
            for (const line of lines) {
                const { data: plan } = await supabase.from('plans').select('name, amount, product_id, interval').eq('id', line.planId).single()
                if (plan) {
                    const lineSubtotal = Number(plan.amount) * line.quantity
                    const lineTax = lineSubtotal * (totalTaxPercent / 100)
                    await supabase.from('invoice_items').insert({
                        invoice_id: invoice.id,
                        product_id: plan.product_id,
                        plan_id: line.planId,
                        description: `${plan.name} (${plan.interval || 'Recurring'})`,
                        quantity: line.quantity,
                        unit_price: Number(plan.amount),
                        discount_amount: 0,
                        tax_amount: lineTax,
                        subtotal: lineSubtotal,
                        total: lineSubtotal + lineTax,
                    })
                }
            }

            const { data: customer } = await supabase.from('customers').select('name, email').eq('id', customerId).single()
            if (customer?.email) {
                await sendInvoiceEmail({
                    customerName: customer.name,
                    customerEmail: customer.email,
                    invoiceId: invoice.id,
                    invoiceNumber: invoice.id.slice(0, 8).toUpperCase(),
                    amount: totalAmount,
                    dueDate: dueDate.toISOString(),
                    planName: 'Multi-line Subscription',
                    quantity: 1,
                    subtotal: subtotalAmount,
                    tax: taxAmount,
                    total: totalAmount,
                })
            }
        }
    }

    revalidatePath('/admin/subscriptions')
    redirect('/admin/subscriptions')
}

export async function updateSubscriptionStatus(id: string, newStatus: string) {
    const { supabase } = await requireAdmin()

    // 1. Update status
    const { error: updateError } = await supabase.from('subscriptions').update({ status: newStatus }).eq('id', id)

    if (updateError) {
        console.error('Error updating subscription status:', updateError)
        return
    }

    // 2. Generate Invoice if status is active
    if (newStatus === 'active') {
        const { data: subscription } = await supabase.from('subscriptions').select('*').eq('id', id).single()

        if (subscription) {
            // Calculate subtotal
            let subtotalAmount = 0

            // Try to fetch lines
            const { data: lines } = await supabase.from('subscription_lines').select('*').eq('subscription_id', id)

            if (lines && lines.length > 0) {
                subtotalAmount = lines.reduce((acc, line) => acc + (Number(line.unit_price) * Number(line.quantity)), 0)
            } else {
                // Fallback for subscriptions without lines (legacy or simple)
                const { data: plan } = await supabase.from('plans').select('amount').eq('id', subscription.plan_id).single()
                if (plan) {
                    subtotalAmount = Number(plan.amount) * (subscription.quantity || 1)
                }
            }

            // Calculate Taxes
            const { data: taxes } = await supabase.from('taxes').select('rate').eq('active', true)
            let totalTaxPercent = taxes?.reduce((acc, t) => acc + Number(t.rate), 0) || 0

            // Default tax if none found (optional safeguard)
            if (totalTaxPercent === 0 && (!taxes || taxes.length === 0)) totalTaxPercent = 18

            const taxAmount = subtotalAmount * (totalTaxPercent / 100)
            const totalAmount = subtotalAmount + taxAmount

            const dueDate = new Date()
            dueDate.setDate(dueDate.getDate() + (subscription.payment_terms || 7))

            // Create Invoice
            const { data: invoice, error: invoiceError } = await supabase.from('invoices').insert({
                subscription_id: subscription.id,
                customer_id: subscription.customer_id,
                amount_due: totalAmount,
                currency: 'inr',
                status: 'confirmed',
                due_date: dueDate.toISOString(),
            }).select().single()

            if (invoice) {
                // Snapshot invoice line items
                if (lines && lines.length > 0) {
                    for (const line of lines) {
                        const lineSubtotal = Number(line.unit_price) * Number(line.quantity)
                        const lineTax = lineSubtotal * (totalTaxPercent / 100)
                        await supabase.from('invoice_items').insert({
                            invoice_id: invoice.id,
                            product_id: line.product_id,
                            description: line.name || 'Subscription Line',
                            quantity: line.quantity,
                            unit_price: Number(line.unit_price),
                            discount_amount: 0,
                            tax_amount: lineTax,
                            subtotal: lineSubtotal,
                            total: lineSubtotal + lineTax,
                        })
                    }
                } else if (subscription.plan_id) {
                    const { data: plan } = await supabase.from('plans').select('name, amount, product_id, interval').eq('id', subscription.plan_id).single()
                    if (plan) {
                        const qty = subscription.quantity || 1
                        const lineSubtotal = Number(plan.amount) * qty
                        const lineTax = lineSubtotal * (totalTaxPercent / 100)
                        await supabase.from('invoice_items').insert({
                            invoice_id: invoice.id,
                            product_id: plan.product_id,
                            plan_id: subscription.plan_id,
                            description: `${plan.name} (${plan.interval || 'Recurring'})`,
                            quantity: qty,
                            unit_price: Number(plan.amount),
                            discount_amount: 0,
                            tax_amount: lineTax,
                            subtotal: lineSubtotal,
                            total: lineSubtotal + lineTax,
                        })
                    }
                }

                // Send Email
                const { data: customer } = await supabase.from('customers').select('name, email').eq('id', subscription.customer_id).single()
                if (customer?.email) {
                    await sendInvoiceEmail({
                        customerName: customer.name,
                        customerEmail: customer.email,
                        invoiceId: invoice.id,
                        invoiceNumber: invoice.id.slice(0, 8).toUpperCase(),
                        amount: totalAmount,
                        dueDate: dueDate.toISOString(),
                        planName: 'Subscription Activation',
                        quantity: 1,
                        subtotal: subtotalAmount,
                        tax: taxAmount,
                        total: totalAmount,
                    })
                }
            } else {
                console.error('Error creating invoice on activation:', invoiceError)
            }
        }
    }

    revalidatePath('/admin/subscriptions')
}
