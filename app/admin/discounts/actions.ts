'use server'

import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/utils/supabase/admin'

export async function getDiscounts() {
    await requireAdmin()
    try {
        const adminSb = createAdminClient()
        const { data, error } = await adminSb
            .from('discounts')
            .select('*, products(name)')
            .order('created_at', { ascending: false })
        if (error) {
            console.error('Error fetching discounts:', error.message)
            return []
        }
        return data || []
    } catch (err: any) {
        console.error('getDiscounts error:', err?.message || err)
        return []
    }
}

export async function createDiscount(formData: FormData) {
    await requireAdmin()

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const type = formData.get('type') as 'percentage' | 'fixed'
    const value = Number(formData.get('value'))
    const min_amount = Number(formData.get('min_amount') || 0)
    const active = formData.get('active') === 'on'
    const valid_from = formData.get('valid_from') as string
    const valid_until = formData.get('valid_until') as string
    const product_id = formData.get('product_id') as string

    const adminSb = createAdminClient()
    const { error } = await adminSb.from('discounts').insert({
        name,
        description: description || null,
        type,
        value,
        min_amount,
        active,
        valid_from: valid_from || null,
        valid_until: valid_until || null,
        product_id: (product_id && product_id !== 'all') ? product_id : null
    }).select()

    if (error) {
        console.error('Create discount error:', error.message)
        const { redirect } = await import('next/navigation')
        return redirect(`/admin/discounts?error=${encodeURIComponent(error.message)}`)
    }

    revalidatePath('/admin/discounts')
    const { redirect } = await import('next/navigation')
    return redirect('/admin/discounts?success=1')
}

export async function toggleDiscountStatus(id: string, active: boolean) {
    await requireAdmin()
    try {
        const adminSb = createAdminClient()
        await adminSb.from('discounts').update({ active }).eq('id', id)
        revalidatePath('/admin/discounts')
    } catch (err: any) {
        console.error('toggleDiscountStatus error:', err?.message || err)
    }
}

export async function updateDiscount(id: string, formData: FormData) {
    await requireAdmin()

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const type = formData.get('type') as 'percentage' | 'fixed'
    const value = Number(formData.get('value'))
    const min_amount = Number(formData.get('min_amount') || 0)
    const active = formData.get('active') === 'on'
    const valid_from = formData.get('valid_from') as string
    const valid_until = formData.get('valid_until') as string
    const product_id = formData.get('product_id') as string

    try {
        const adminSb = createAdminClient()
        const { error } = await adminSb.from('discounts').update({
            name,
            description: description || null,
            type,
            value,
            min_amount,
            active,
            valid_from: valid_from || null,
            valid_until: valid_until || null,
            product_id: (product_id && product_id !== 'all') ? product_id : null
        }).eq('id', id)

        if (error) return { error: error.message }

        revalidatePath('/admin/discounts')
        return { success: true }
    } catch (err: any) {
        console.error('updateDiscount error:', err?.message || err)
        return { error: err?.message || 'Failed to update discount' }
    }
}

export async function deleteDiscount(id: string) {
    await requireAdmin()
    try {
        const adminSb = createAdminClient()
        const { error } = await adminSb.from('discounts').delete().eq('id', id)

        if (error) {
            if (error.code === '23503') return { error: 'Discount is linked to plans' }
            return { error: error.message }
        }

        revalidatePath('/admin/discounts')
        return { success: true }
    } catch (err: any) {
        console.error('deleteDiscount error:', err?.message || err)
        return { error: err?.message || 'Failed to delete discount' }
    }
}
