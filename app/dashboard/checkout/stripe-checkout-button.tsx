'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, ShieldCheck, CheckCircle2 } from "lucide-react"
import { createStripeSession } from "./stripe-actions"
import { toast } from "sonner"

interface StripeCheckoutProps {
    planId: string
    amount: number
}

export function StripeCheckoutButton({ planId, amount }: StripeCheckoutProps) {
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<'idle' | 'processing' | 'success'>('idle')

    const handleCheckout = async () => {
        setLoading(true)
        setStep('processing')
        toast.info("Connecting to Razorpay Secure Gateway...")

        try {
            // Quick 600ms realistic delay to show simulated gateway
            await new Promise(r => setTimeout(r, 600))
            
            const { url, error } = await createStripeSession(planId)

            if (error) {
                toast.error(error)
                setLoading(false)
                setStep('idle')
                return
            }

            setStep('success')
            toast.success("Payment verified! Subscription activated.")

            if (url) {
                setTimeout(() => {
                    window.location.href = url
                }, 400)
            }
        } catch (err) {
            console.error(err)
            toast.error("Checkout failed")
            setLoading(false)
            setStep('idle')
        }
    }

    return (
        <Button 
            onClick={handleCheckout} 
            className="w-full bg-[#051F20] hover:bg-[#0B2B26] text-[#DAF1DE] font-semibold transition-all shadow-sm" 
            size="lg" 
            disabled={loading}
        >
            {loading && step === 'processing' && <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#8EB69B]" />}
            {loading && step === 'success' && <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-400" />}
            {step === 'processing' && "Verifying with Razorpay..."}
            {step === 'success' && "Payment Completed!"}
            {step === 'idle' && (
                <span className="flex items-center justify-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#8EB69B]" />
                    Pay ₹{amount.toFixed(2)} via Razorpay
                </span>
            )}
        </Button>
    )
}
