
'use server'

import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { sendInvoiceEmail } from '@/lib/email'

export async function markInvoicePaid(id: string) {
    const { supabase } = await requireAdmin()

    // Fetch the amount due first to set amount_paid fully
    const { data: inv } = await supabase.from('invoices').select('amount_due').eq('id', id).single()

    if (inv) {
        await supabase.from('invoices').update({
            status: 'paid',
            amount_paid: inv.amount_due,
            paid_at: new Date().toISOString()
        }).eq('id', id)
    }

    revalidatePath(`/admin/invoices/${id}`)
    revalidatePath('/admin/invoices')
}

export async function confirmInvoice(id: string) {
    const { supabase } = await requireAdmin()
    await supabase.from('invoices').update({ status: 'confirmed' }).eq('id', id)
    revalidatePath('/admin/invoices')
}

export async function sendInvoiceManually(invoiceId: string) {
    const { supabase } = await requireAdmin()

    // Fetch complete invoice data with customer and subscription details
    const { data: invoice } = await supabase
        .from('invoices')
        .select(`
            *,
            customers (name, email),
            subscriptions (
                quantity,
                plans (name, amount)
            )
        `)
        .eq('id', invoiceId)
        .single()

    if (!invoice || !invoice.customers?.email) {
        return { success: false, error: 'Invoice or customer email not found' }
    }

    // Calculate breakdown
    const quantity = invoice.subscriptions?.quantity || 1
    const planAmount = Number(invoice.subscriptions?.plans?.amount || 0)
    const subtotal = planAmount * quantity
    const total = Number(invoice.amount_due)
    const tax = total - subtotal

    try {
        const result = await sendInvoiceEmail({
            customerName: invoice.customers.name,
            customerEmail: invoice.customers.email,
            invoiceId: invoice.id,
            invoiceNumber: invoice.id.slice(0, 8).toUpperCase(),
            amount: total,
            dueDate: invoice.due_date,
            planName: invoice.subscriptions?.plans?.name || 'Service',
            quantity: quantity,
            subtotal: subtotal,
            tax: tax,
            total: total,
        })

        if (result.success) {
            // Update invoice status to 'sent' if it was 'draft'
            if (invoice.status === 'draft') {
                await supabase
                    .from('invoices')
                    .update({ status: 'sent' })
                    .eq('id', invoiceId)
            }

            revalidatePath(`/admin/invoices/${invoiceId}`)
            revalidatePath('/admin/invoices')
        }

        return result
    } catch (error) {
        console.error('Error sending invoice email:', error)
        return { success: false, error: String(error) }
    }
}

export async function cancelInvoice(id: string) {
    const { supabase } = await requireAdmin()
    const { error } = await supabase.from('invoices').update({ status: 'cancelled' }).eq('id', id)
    if (error) {
        console.error('Cancel invoice error:', error)
        return { error: error.message }
    }
    revalidatePath(`/admin/invoices/${id}`)
    revalidatePath('/admin/invoices')
    return { success: true }
}

export async function recordPayment(invoiceId: string, formData: FormData) {
    const { supabase } = await requireAdmin()
    const method = formData.get('method') as string
    const amount = Number(formData.get('amount'))
    const transactionId = formData.get('transaction_id') as string

    // 1. Get current invoice
    const { data: invoice } = await supabase.from('invoices').select('*').eq('id', invoiceId).single()
    if (!invoice) return { error: 'Invoice not found' }

    // 2. Insert payment record
    const { error: pError } = await supabase.from('payments').insert({
        invoice_id: invoiceId,
        customer_id: invoice.customer_id,
        amount: amount,
        payment_method: method,
        transaction_id: transactionId,
        status: 'posted',
        payment_date: new Date().toISOString().split('T')[0]
    })

    if (pError) return { error: pError.message }

    // 3. Update invoice amount_paid and status
    const newAmountPaid = Number(invoice.amount_paid || 0) + amount
    const newStatus = newAmountPaid >= Number(invoice.amount_due) ? 'paid' : invoice.status

    await supabase.from('invoices').update({
        amount_paid: newAmountPaid,
        status: newStatus,
        paid_at: newAmountPaid >= Number(invoice.amount_due) ? new Date().toISOString() : invoice.paid_at
    }).eq('id', invoiceId)

    revalidatePath(`/admin/invoices/${invoiceId}`)
    revalidatePath('/admin/invoices')
    return { success: true }
}
