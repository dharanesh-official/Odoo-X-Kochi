'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

// Mock Payment Action for Demo Purposes
export async function simulatePayment(planId: string) {
    const supabase = await createClient()

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) {
        return { error: 'Please log in to subscribe' }
    }

    // 2. Get Plan
    const { data: plan } = await supabase.from('plans').select('*').eq('id', planId).single()
    if (!plan) return { error: 'Plan not found' }

    // 3. Get or Create Customer
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

        if (createError) return { error: 'Failed to create customer profile' }
        customer = newCustomer
    }

    // 4. Create Subscription (Active immediately for demo)
    const startDate = new Date().toISOString()
    const { data: subscription, error: subError } = await supabase.from('subscriptions').insert({
        customer_id: customer.id,
        plan_id: planId,
        status: 'active', // <--- DIRECT TO ACTIVE FOR DEMO
        start_date: startDate,
        currency: 'inr',
        quantity: 1,
        billing_address: 'Demo Payment Gateway',
    }).select().single()

    if (subError) return { error: 'Failed to create subscription' }

    // 5. Create Mock Payment Record
    await supabase.from('payments').insert({
        customer_id: customer.id,
        amount: plan.amount,
        payment_date: new Date().toISOString(),
        payment_method: 'demo_card',
        transaction_id: `demo_${Date.now()}`,
        status: 'posted'
    })

    revalidatePath('/dashboard')
    return { success: true }
}
