'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createSubscriptionAction(formData: FormData) {
    const supabase = await createClient()

    const planId = formData.get('plan_id') as string

    let redirectPath = '/dashboard/subscriptions?success=Subscription created'

    try {
        // 1. Get User
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || !user.email) {
            redirectPath = '/auth/login?error=Please log in to subscribe'
            // If we redirect here, we should just return/throw, but since we are in try/catch, 
            // we can set the path and break. However, 'redirect' internally throws an error 
            // so it must be handled carefully. Best to just return early with the redirect.
            return redirect(redirectPath)
        }

        // 2. Get or Create Customer
        let { data: customer } = await supabase
            .from('customers')
            .select('*')
            .eq('email', user.email)
            .single()

        if (!customer) {
            const name = user.user_metadata?.full_name || user.email.split('@')[0]
            const { data: newCustomer, error: createError } = await supabase
                .from('customers')
                .insert({
                    name: name,
                    email: user.email,
                    phone: user.phone || null,
                })
                .select()
                .single()

            if (createError) {
                console.error(createError)
                throw new Error("Failed to create customer")
            }
            customer = newCustomer
        }

        // Check if plan has trial
        const { data: plan } = await supabase.from('plans').select('trial_period_days').eq('id', planId).single()
        const status = (plan?.trial_period_days && plan.trial_period_days > 0) ? 'trialing' : 'active'

        const startDate = new Date()
        const { error: subError } = await supabase.from('subscriptions').insert({
            customer_id: customer.id,
            plan_id: planId,
            status: status,
            current_period_start: startDate.toISOString(),

        })

        if (subError) {
            console.error(subError)
            throw new Error(subError.message)
        }

    } catch (error: any) {
        if (error.message === 'NEXT_REDIRECT') throw error
        console.error("Subscription Error:", error)
        // Redirect with error
        redirectPath = `/dashboard/checkout?plan=${planId}&error=${encodeURIComponent(error.message || 'Unknown error')}`
    }

    revalidatePath('/dashboard')
    redirect(redirectPath)
}
