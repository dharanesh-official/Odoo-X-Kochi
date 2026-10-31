'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import Stripe from 'stripe'
import { sendInvoiceEmail } from "@/lib/email"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2026-01-28.clover' as any,
})

export async function handleStripeSuccess(checkoutSessionId: string, subscriptionId: string) {
    const supabase = await createClient()

    try {
        if (checkoutSessionId === 'BYPASS_STRIPE_TEST') {
            console.log("Processing BYPASS payment success...")

            // Helper to get admin client if available to bypass RLS
            const getAdminClient = () => {
                if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
                    try {
                        const { createClient: createSupabaseClient } = require('@supabase/supabase-js')
                        return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY)
                    } catch (e) {
                        console.error("Could not load @supabase/supabase-js", e)
                        return null
                    }
                }
                return null
            }

            const adminDb = getAdminClient() || supabase

            // 0. Fetch Subscription details first (we need customer_id and amount)
            const { data: sub, error: fetchError } = await adminDb
                .from('subscriptions')
                .select('customer_id, plans(name, amount), customers(name, email)')
                .eq('id', subscriptionId)
                .single()

            if (fetchError || !sub) {
                console.error("Bypass Error: Could not fetch subscription", fetchError)
                return { error: "Could not verify subscription details." }
            }

            const planData = sub.plans as any
            const customerData = sub.customers as any
            const amount = Number((Array.isArray(planData) ? planData[0]?.amount : planData?.amount) || 0)
            const planName = (Array.isArray(planData) ? planData[0]?.name : planData?.name) || 'Subscription'

            // 1. Update Subscription directly
            const { error: updateError } = await adminDb
                .from('subscriptions')
                .update({
                    status: 'active'
                })
                .eq('id', subscriptionId)

            if (updateError) {
                console.error("Failed to update subscription (Bypass)", updateError)
                return { error: "Failed to activate subscription. " + updateError.message }
            }

            // 2. Create Invoice
            const { data: newInvoice, error: invError } = await adminDb
                .from('invoices')
                .insert({
                    customer_id: sub.customer_id,
                    subscription_id: subscriptionId,
                    amount_due: amount,
                    amount_paid: amount,
                    status: 'paid',
                    paid_at: new Date().toISOString(),
                    due_date: new Date().toISOString(),
                })
                .select()
                .single()

            if (invError) {
                console.error("Failed to generate invoice", invError)
            } else if (newInvoice) {
                await adminDb.from('invoice_items').insert({
                    invoice_id: newInvoice.id,
                    description: `${planName} Subscription`,
                    quantity: 1,
                    unit_price: amount,
                    discount_amount: 0,
                    tax_amount: 0,
                    subtotal: amount,
                    total: amount,
                })
            }

            // 3. Create Payment
            const transactionId = `BYPASS_${subscriptionId}`
            const existingPaymentCheck = await adminDb.from('payments').select('id').eq('transaction_id', transactionId).maybeSingle()

            if (!existingPaymentCheck.data) {
                await adminDb.from('payments').insert({
                    customer_id: sub.customer_id,
                    invoice_id: newInvoice?.id || null,
                    amount: amount,
                    payment_date: new Date().toISOString(),
                    payment_method: 'Manual/Bypass',
                    transaction_id: transactionId,
                    status: 'posted'
                })
            }

            // 4. Send Email
            if (newInvoice && customerData?.email) {
                await sendInvoiceEmail({
                    customerName: customerData.name || 'Valued Customer',
                    customerEmail: customerData.email,
                    invoiceId: newInvoice.id,
                    invoiceNumber: newInvoice.id.slice(0, 8).toUpperCase(),
                    amount: amount,
                    dueDate: newInvoice.due_date,
                    planName: planName,
                    quantity: 1, // Defaulting to 1 for now as subscription quantity wasn't fetched explicitly but typically 1
                    subtotal: amount,
                    tax: 0, // Simplified tax handling for bypass
                    total: amount,
                })
            }

            revalidatePath('/dashboard')
            return { success: true }
        }

        const session = await stripe.checkout.sessions.retrieve(checkoutSessionId)

        if (session.payment_status === 'paid') {
            // 1. Verify and Update Subscription
            const { error: updateError } = await supabase
                .from('subscriptions')
                .update({
                    status: 'active'
                })
                .eq('id', subscriptionId)

            if (updateError) {
                console.error("Failed to update subscription", updateError)
                return { error: "Payment received but internal update failed. Contact support." }
            }

            // 2. Create Invoice & Payment
            // Fetch necessary details
            const { data: sub } = await supabase.from('subscriptions')
                .select('customer_id, quantity, plans(name, amount), customers(name, email)')
                .eq('id', subscriptionId)
                .single()

            if (sub) {
                const planData = sub.plans as any
                const customerData = sub.customers as any
                const amount = Number((Array.isArray(planData) ? planData[0]?.amount : planData?.amount) || session.amount_total || 0)
                const planName = (Array.isArray(planData) ? planData[0]?.name : planData?.name) || 'Subscription'
                const quantity = sub.quantity || 1

                // Create Invoice
                const { data: newInvoice } = await supabase
                    .from('invoices')
                    .insert({
                        customer_id: sub.customer_id,
                        subscription_id: subscriptionId,
                        amount_due: amount, // Assuming amount is total
                        amount_paid: amount,
                        status: 'paid',
                        paid_at: new Date().toISOString(),
                        due_date: new Date().toISOString(),
                    })
                    .select()
                    .single()

                if (newInvoice) {
                    await supabase.from('invoice_items').insert({
                        invoice_id: newInvoice.id,
                        description: `${planName} Subscription`,
                        quantity: quantity,
                        unit_price: amount / quantity,
                        discount_amount: 0,
                        tax_amount: 0,
                        subtotal: amount,
                        total: amount,
                    })
                }

                // Create Payment
                const { data: existingPayment } = await supabase.from('payments').select('id').eq('transaction_id', session.payment_intent as string).maybeSingle()

                if (!existingPayment) {
                    await supabase.from('payments').insert({
                        customer_id: sub.customer_id,
                        invoice_id: newInvoice?.id || null,
                        amount: amount,
                        payment_date: new Date().toISOString(),
                        payment_method: 'stripe',
                        transaction_id: session.payment_intent as string,
                        status: 'posted'
                    })
                }

                // Send Email
                if (newInvoice && customerData?.email) {
                    const subtotal = amount // Simplified logic
                    const tax = 0 // Need proper tax calculation logic if applicable, currently assumed included or 0

                    await sendInvoiceEmail({
                        customerName: customerData.name || 'Valued Customer',
                        customerEmail: customerData.email,
                        invoiceId: newInvoice.id,
                        invoiceNumber: newInvoice.id.slice(0, 8).toUpperCase(),
                        amount: amount,
                        dueDate: newInvoice.due_date,
                        planName: planName,
                        quantity: quantity,
                        subtotal: subtotal,
                        tax: tax,
                        total: amount,
                    })
                }
            }

            revalidatePath('/dashboard')
            return { success: true }
        } else {
            return { error: 'Payment not successful' }
        }

    } catch (err: any) {
        console.error("Stripe Verification Error", err)
        return { error: "Verification failed: " + err.message }
    }
}
