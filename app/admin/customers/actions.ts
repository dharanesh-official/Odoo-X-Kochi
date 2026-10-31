
'use server'

import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createCustomer(formData: FormData) {
    const { supabase } = await requireAdmin()

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const street = formData.get('street') as string
    const city = formData.get('city') as string
    const zip = formData.get('zip') as string
    const country = formData.get('country') as string

    // Simple validation
    if (!name || !email) {
        return redirect('/admin/customers/new?error=Name and email are required')
    }

    // Check if profile exists with this email to link automatically
    const { data: profile } = await supabase.from('profiles').select('id').eq('email', email).maybeSingle()

    const { error } = await supabase.from('customers').insert({
        profile_id: profile?.id || null, // Link if found
        name,
        email,
        phone,
        address: {
            street,
            city,
            zip,
            country
        }
    })

    if (error) {
        console.error('Create customer error:', error)
        // return { error: 'Could not create customer' } // Ideally handle duplicates
        return redirect('/admin/customers?error=Could not create customer (email exists?)')
    }

    revalidatePath('/admin/customers')
    redirect('/admin/customers')
}

export async function updateCustomer(id: string, formData: FormData) {
    const { supabase } = await requireAdmin()

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const street = formData.get('street') as string
    const city = formData.get('city') as string
    const zip = formData.get('zip') as string
    const country = formData.get('country') as string

    if (!name || !email) {
        return redirect(`/admin/customers/${id}/edit?error=Name and email are required`)
    }

    const { error } = await supabase.from('customers').update({
        name,
        email,
        phone,
        address: {
            street,
            city,
            zip,
            country
        }
    }).eq('id', id)

    if (error) {
        console.error('Update customer error:', error)
        return redirect(`/admin/customers/${id}/edit?error=Could not update customer`)
    }

    revalidatePath('/admin/customers')
    redirect('/admin/customers')
}

export async function deleteCustomer(id: string) {
    const { supabase } = await requireAdmin()
    const { error } = await supabase.from('customers').delete().eq('id', id)

    if (error) {
        console.error('Delete customer error:', error)
        // Check for FK constraint
        if (error.code === '23503') { // Foreign Key Violation
            return { error: 'Used in subscriptions/invoices' }
        }
        return { error: 'Could not delete customer' }
    }

    revalidatePath('/admin/customers')
    return { success: true }
}
