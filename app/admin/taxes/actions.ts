'use server'

import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/utils/supabase/admin'

export async function createTax(formData: FormData) {
    await requireAdmin()
    try {
        const name = formData.get('name') as string
        const rate = Number(formData.get('rate'))
        const active = formData.get('active') === 'on'

        const adminSb = createAdminClient()
        const { error } = await adminSb.from('taxes').insert({
            name,
            rate,
            type: 'percent',
            active
        })
        if (error) {
            console.error('Error creating tax:', error.message)
            return { error: error.message }
        }
        revalidatePath('/admin/taxes')
        return { success: true }
    } catch (err: any) {
        console.error('createTax error:', err?.message || err)
        return { error: err?.message || 'Failed to create tax' }
    }
}

export async function getTaxes() {
    await requireAdmin()
    try {
        const adminSb = createAdminClient()
        const { data, error } = await adminSb.from('taxes').select('*').order('created_at', { ascending: false })
        if (error) {
            console.error('Error fetching taxes:', error.message)
            return []
        }
        return data || []
    } catch (err: any) {
        console.error('getTaxes error:', err?.message || err)
        return []
    }
}

export async function toggleTaxStatus(id: string, active: boolean) {
    await requireAdmin()
    try {
        const adminSb = createAdminClient()
        await adminSb.from('taxes').update({ active }).eq('id', id)
        revalidatePath('/admin/taxes')
    } catch (err: any) {
        console.error('toggleTaxStatus error:', err?.message || err)
    }
}

export async function deleteTax(id: string) {
    await requireAdmin()
    try {
        const adminSb = createAdminClient()
        const { error } = await adminSb.from('taxes').delete().eq('id', id)
        if (error) {
            console.error('Error deleting tax:', error.message)
            return { error: error.message }
        }
        revalidatePath('/admin/taxes')
        return { success: true }
    } catch (err: any) {
        console.error('deleteTax error:', err?.message || err)
        return { error: err?.message || 'Failed to delete tax' }
    }
}
