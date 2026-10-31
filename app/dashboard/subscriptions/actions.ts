'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function cancelCustomerSubscription(subscriptionId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'Unauthorized: Please log in.' }
    }

    // Find customer profile linked to user email
    const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', user.email || '')
        .single()

    if (!customer) {
        return { success: false, error: 'Customer profile not found.' }
    }

    // Verify subscription ownership
    const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('id, status, customer_id')
        .eq('id', subscriptionId)
        .eq('customer_id', customer.id)
        .single()

    if (subError || !subscription) {
        return { success: false, error: 'Subscription not found or access denied.' }
    }

    if (subscription.status === 'cancelled') {
        return { success: false, error: 'Subscription is already cancelled.' }
    }

    // Update status to cancelled
    const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', subscriptionId)

    if (updateError) {
        console.error('Cancellation error:', updateError)
        return { success: false, error: updateError.message }
    }

    revalidatePath(`/dashboard/subscriptions/${subscriptionId}`)
    revalidatePath('/dashboard/subscriptions')
    revalidatePath('/admin/subscriptions')

    return { success: true }
}
