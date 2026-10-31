'use server'

import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"
import { getOrCreateCustomer } from "@/lib/customer-profile"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createSubscriptionAction(formData: FormData) {
    const userClient = await createClient()
    const planId = formData.get('plan_id') as string

    let redirectPath = '/dashboard/subscriptions?success=Subscription created'

    try {
        // 1. Authenticate user
        const { data: { user } } = await userClient.auth.getUser()
        if (!user || !user.email) {
            return redirect('/auth/login?error=Please log in to subscribe')
        }

        const adminSb = createAdminClient()

        // 2. Get or create customer via administrative client
        const customer = await getOrCreateCustomer(adminSb, user)
        if (!customer) {
            throw new Error("Failed to resolve customer profile")
        }

        // 3. Check plan details
        const { data: plan, error: planErr } = await adminSb
            .from('plans')
            .select('trial_period_days')
            .eq('id', planId)
            .single()

        if (planErr || !plan) {
            throw new Error("Selected pricing plan could not be found")
        }

        const status = (plan.trial_period_days && plan.trial_period_days > 0) ? 'trialing' : 'active'
        const startDate = new Date()

        // 4. Provision subscription
        const { error: subError } = await adminSb.from('subscriptions').insert({
            customer_id: customer.id,
            plan_id: planId,
            status: status,
            quantity: 1,
            current_period_start: startDate.toISOString(),
            current_period_end: new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })

        if (subError) {
            console.error('Subscription provision error:', subError.message)
            throw new Error(subError.message)
        }

    } catch (error: any) {
        if (error?.message === 'NEXT_REDIRECT' || error?.digest?.startsWith('NEXT_REDIRECT')) {
            throw error
        }
        console.error("Subscription Error:", error?.message || error)
        redirectPath = `/dashboard/checkout?plan=${planId}&error=${encodeURIComponent(error.message || 'Unknown error')}`
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/subscriptions')
    redirect(redirectPath)
}
