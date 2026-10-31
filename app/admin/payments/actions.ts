'use server'

import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createPayment(formData: FormData) {
    const { supabase } = await requireAdmin()

    const invoiceId = formData.get('invoice_id') as string | null
    const customerId = formData.get('customer_id') as string | null
    const amount = Number(formData.get('amount'))
    const method = formData.get('payment_method') as string
    const date = (formData.get('payment_date') as string) || new Date().toISOString().split('T')[0]
    const transactionId = (formData.get('transaction_id') as string) || null

    if (isNaN(amount) || amount <= 0) {
        return { error: 'Payment amount must be greater than zero' }
    }

    let invoice = null
    let targetCustomerId = customerId

    // If an invoice is referenced, fetch it to validate and prepare balance calculations
    if (invoiceId) {
        const { data: inv, error: invError } = await supabase
            .from('invoices')
            .select('id, customer_id, amount_due, amount_paid, status, paid_at')
            .eq('id', invoiceId)
            .single()

        if (invError || !inv) {
            return { error: 'Invoice not found' }
        }

        invoice = inv
        if (!targetCustomerId) {
            targetCustomerId = inv.customer_id
        }
    }

    const { error: paymentError } = await supabase.from('payments').insert({
        invoice_id: invoiceId || null,
        customer_id: targetCustomerId || null,
        amount,
        payment_method: method,
        payment_date: date,
        transaction_id: transactionId,
        status: 'posted'
    })

    if (paymentError) {
        console.error('Payment creation error:', paymentError)
        return { error: paymentError.message }
    }

    // Accumulate amount_paid and only transition status to paid when balance is zero
    if (invoiceId && invoice) {
        const currentAmountPaid = Number(invoice.amount_paid || 0)
        const amountDue = Number(invoice.amount_due || 0)
        const newAmountPaid = currentAmountPaid + amount
        const isFullyPaid = newAmountPaid >= amountDue

        const { error: invoiceUpdateError } = await supabase
            .from('invoices')
            .update({
                amount_paid: newAmountPaid,
                status: isFullyPaid ? 'paid' : invoice.status,
                paid_at: isFullyPaid ? (invoice.paid_at || new Date().toISOString()) : invoice.paid_at
            })
            .eq('id', invoiceId)

        if (invoiceUpdateError) {
            console.error('Invoice update error:', invoiceUpdateError)
            return { error: invoiceUpdateError.message }
        }

        revalidatePath(`/admin/invoices/${invoiceId}`)
        revalidatePath(`/dashboard/invoices/${invoiceId}`)
    }

    revalidatePath('/admin/payments')
    revalidatePath('/admin/invoices')
    return { success: true }
}

export async function getPayments() {
    const { supabase } = await requireAdmin()
    const { data: payments } = await supabase
        .from('payments')
        .select(`
            *,
            customers (name),
            invoices (invoice_number)
        `)
        .order('created_at', { ascending: false })
    return payments || []
}
