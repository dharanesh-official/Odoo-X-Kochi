
'use server'

import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPlan(formData: FormData) {
    const { supabase } = await requireAdmin()

    const productId = formData.get('product_id') as string
    const name = formData.get('name') as string
    const amount = Number(formData.get('amount'))
    const interval = formData.get('interval') as string
    const trialPeriod = Number(formData.get('trial_period_days') || 0)
    const minQuantity = Number(formData.get('min_quantity') || 1)
    const active = formData.get('active') === 'on'
    const autoClose = formData.get('auto_close') === 'on'
    const closable = formData.get('closable') === 'on'
    const pausable = formData.get('pausable') === 'on'
    const renewable = formData.get('renewable') === 'on'
    const visibility = formData.get('visibility') as string || 'private'
    const startDate = formData.get('start_date') as string
    const endDate = formData.get('end_date') as string
    const discountId = formData.get('discount_id') as string
    const discount_id = (discountId && discountId !== 'none') ? discountId : null

    if (!productId || !name || isNaN(amount)) {
        return redirect('/admin/plans/new?error=Missing required fields')
    }

    const { error } = await supabase.from('plans').insert({
        product_id: productId,
        name,
        amount,
        interval, // Ensure this matches DB enum strictly
        trial_period_days: trialPeriod,
        min_quantity: minQuantity,
        active,
        auto_close: autoClose,
        closable,
        pausable,
        renewable,
        visibility,
        start_date: startDate || null,
        end_date: endDate || null,
        currency: 'inr',
        discount_id
    })

    if (error) {
        console.error('Create plan error:', error)
        return redirect('/admin/plans/new?error=Could not create plan')
    }

    revalidatePath('/admin/plans')
    redirect('/admin/plans')
}

export async function updatePlan(id: string, formData: FormData) {
    const { supabase } = await requireAdmin()

    const name = formData.get('name') as string
    const amount = Number(formData.get('amount'))
    const interval = formData.get('interval') as string
    const trialPeriod = Number(formData.get('trial_period_days') || 0)
    const minQuantity = Number(formData.get('min_quantity') || 1)
    const active = formData.get('active') === 'on'
    const autoClose = formData.get('auto_close') === 'on'
    const closable = formData.get('closable') === 'on'
    const pausable = formData.get('pausable') === 'on'
    const renewable = formData.get('renewable') === 'on'
    const visibility = formData.get('visibility') as string || 'private'
    const startDate = formData.get('start_date') as string
    const endDate = formData.get('end_date') as string
    const discountId = formData.get('discount_id') as string
    const discount_id = (discountId && discountId !== 'none') ? discountId : null

    const { data: updated, error } = await supabase.from('plans').update({
        name,
        amount,
        interval,
        trial_period_days: trialPeriod,
        min_quantity: minQuantity,
        active,
        auto_close: autoClose,
        closable,
        pausable,
        renewable,
        visibility,
        start_date: startDate || null,
        end_date: endDate || null,
        discount_id
    }).eq('id', id).select()

    if (error || !updated || updated.length === 0) {
        console.error('Update plan error:', error || 'No permission/ID not found')
        return redirect('/admin/plans?error=Update failed. Check permissions.')
    }

    revalidatePath('/admin/plans')
    redirect('/admin/plans')
}

export async function deletePlan(id: string) {
    const { supabase } = await requireAdmin()

    const { error } = await supabase.from('plans').delete().eq('id', id)

    if (error) {
        console.error('Delete plan error:', error)
        if (error.code === '23503') return { error: 'Plan is used in subscriptions' }
        return { error: 'Could not delete plan' }
    }

    revalidatePath('/admin/plans')
    return { success: true }
}
