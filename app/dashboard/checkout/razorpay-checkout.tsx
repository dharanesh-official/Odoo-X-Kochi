'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { createOrder, verifyPayment } from "./razorpay-actions"
import { simulatePayment } from "./demo-actions"
import { toast } from "sonner"

// Declare Razorpay on window interface
declare global {
    interface Window {
        Razorpay: any
    }
}

interface RazorpayCheckoutProps {
    planId: string
    planAmount: number
    userEmail?: string
    userName?: string
}

export function RazorpayCheckout({ planId, planAmount, userEmail, userName }: RazorpayCheckoutProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        // Load Razorpay script dynamically
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        document.body.appendChild(script)
        return () => {
            document.body.removeChild(script)
        }
    }, [])

    const handleSubscribe = async () => {
        setLoading(true)

        if (!window.Razorpay) {
            toast.error("Razorpay SDK not loaded. Please verify your internet connection.")
            setLoading(false)
            return
        }

        try {
            // 🚨 DEMO MODE: IF RAZORPAY KEYS ARE MISSING, USE DEMO MODE
            // Or un-comment below to force demo mode for presentation
            const FORCE_DEMO_MODE = true

            if (FORCE_DEMO_MODE) {
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 2000))

                const result = await simulatePayment(planId)
                if (result.success) {
                    toast.success("Payment Successful (Demo Mode)")
                    router.push('/dashboard?success=true')
                } else {
                    toast.error(result.error)
                }
                setLoading(false)
                return
            }

            // 1. Create Order
            const data = await createOrder(planId)

            if (data.error || !data.orderId) {
                // Fallback to Demo if keys missing
                if (data.error === 'Payment gateway initialization failed' || !data.keyId) {
                    toast.info("Razorpay keys missing. Using Demo Payment.")
                    await new Promise(resolve => setTimeout(resolve, 1500))
                    const result = await simulatePayment(planId)
                    if (result.success) {
                        toast.success("Payment Successful (Demo Mode)")
                        router.push('/dashboard?success=true')
                    }
                    setLoading(false)
                    return
                }

                toast.error(data.error || "Failed to initiate payment")
                setLoading(false)
                return
            }

            // 2. Open Razorpay
            const options = {
                key: data.keyId,
                amount: data.amount,
                currency: data.currency,
                name: "SubCheck",
                description: "Subscription Payment",
                order_id: data.orderId,
                handler: async function (response: any) {
                    // 3. Verify Payment
                    toast.loading("Verifying payment...")
                    const result = await verifyPayment(
                        data.subscriptionId!,
                        response.razorpay_payment_id,
                        response.razorpay_order_id,
                        response.razorpay_signature
                    )

                    if (result.success) {
                        toast.dismiss()
                        toast.success("Subscription Active!")
                        router.push('/dashboard?success=true')
                    } else {
                        toast.dismiss()
                        toast.error(result.error || "Payment verification failed")
                    }
                },
                prefill: {
                    name: userName,
                    email: userEmail,
                },
                theme: {
                    color: "#3399cc"
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false)
                    }
                }
            }

            const rzp = new window.Razorpay(options)
            rzp.open()

        } catch (error) {
            console.error(error)
            toast.error("An error occurred")
            setLoading(false)
        }
    }

    return (
        <Button onClick={handleSubscribe} className="w-full" size="lg" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Processing..." : `Pay ₹${planAmount} & Subscribe`}
        </Button>
    )
}
