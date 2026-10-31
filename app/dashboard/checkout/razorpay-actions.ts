'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import Razorpay from 'razorpay'

// Initialize Razorpay (Note: In production use env vars)
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
})

interface CreateOrderResponse {
    orderId?: string
    subscriptionId?: string
    amount: number
    currency: string
    keyId: string
    error?: string
}

export async function createOrder(planId: string): Promise<CreateOrderResponse> {
    const supabase = await createClient()

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) {
        return { error: 'Please log in to subscribe', amount: 0, currency: 'INR', keyId: '' }
    }

    // 2. Get Plan
    const { data: plan } = await supabase.from('plans').select('*').eq('id', planId).single()
    if (!plan) return { error: 'Plan not found', amount: 0, currency: 'INR', keyId: '' }

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

        if (createError) return { error: 'Failed to create customer profile', amount: 0, currency: 'INR', keyId: '' }
        customer = newCustomer
    }

    // 4. Create Subscription (Draft/Quotation)
    // Always start as 'quotation' before payment
    const startDate = new Date().toISOString()
    const { data: subscription, error: subError } = await supabase.from('subscriptions').insert({
        customer_id: customer.id,
        plan_id: planId,
        status: 'quotation', // Initial status
        start_date: startDate,
        currency: 'inr',
        quantity: 1,
        billing_address: 'Online Checkout',
    }).select().single()

    if (subError) return { error: 'Failed to create subscription', amount: 0, currency: 'INR', keyId: '' }

    // 5. Create Razorpay Order
    // Amount must be in paisa (INR * 100)
    const options = {
        amount: Math.round(plan.amount * 100),
        currency: "INR",
        receipt: subscription.id,
        notes: {
            plan_name: plan.name,
            customer_email: user.email
        }
    }

    try {
        const order = await razorpay.orders.create(options)
        return {
            orderId: order.id,
            subscriptionId: subscription.id,
            amount: options.amount,
            currency: options.currency,
            keyId: process.env.RAZORPAY_KEY_ID || ''
        }
    } catch (error) {
        console.error("Razorpay Error:", error)
        return { error: 'Payment gateway initialization failed', amount: 0, currency: 'INR', keyId: '' }
    }
}

export async function verifyPayment(
    subscriptionId: string,
    razorpayPaymentId: string,
    razorpayOrderId: string,
    razorpaySignature: string
) {
    const supabase = await createClient()

    // verify signature
    const crypto = require('crypto')
    const secret = process.env.RAZORPAY_KEY_SECRET || ''

    const generated_signature = crypto
        .createHmac('sha256', secret)
        .update(razorpayOrderId + "|" + razorpayPaymentId)
        .digest('hex')

    if (generated_signature !== razorpaySignature) {
        return { error: 'Invalid payment signature' }
    }

    // Update Subscription Status -> Active
    // Also change form quotation -> confirmed -> active logically, but we just set active here
    const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ status: 'active' })
        .eq('id', subscriptionId)

    if (updateError) {
        console.error("Update Sub Error:", updateError)
        return { error: 'Payment verified but subscription update failed' }
    }

    // Determine amount from Razorpay or Plan? Fetch plan amount for record
    // For simplicity, we assume verification means full amount paid.
    // Fetch subscription to get customer_id
    const { data: sub } = await supabase.from('subscriptions').select('customer_id, plan_id, plans(amount)').eq('id', subscriptionId).single()

    // Create Payment Record
    if (sub) {
        await supabase.from('payments').insert({
            customer_id: sub.customer_id,
            amount: (Array.isArray(sub.plans) ? sub.plans[0]?.amount : sub.plans?.amount) || 0,
            payment_date: new Date().toISOString(),
            payment_method: 'razorpay',
            transaction_id: razorpayPaymentId,
            status: 'posted'
        })
    }

    revalidatePath('/dashboard')
    return { success: true }
}
