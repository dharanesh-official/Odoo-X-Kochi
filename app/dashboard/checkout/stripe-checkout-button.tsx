'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { createStripeSession } from "./stripe-actions"
import { toast } from "sonner"

interface StripeCheckoutProps {
    planId: string
    amount: number
}

export function StripeCheckoutButton({ planId, amount }: StripeCheckoutProps) {
    const [loading, setLoading] = useState(false)

    const handleCheckout = async () => {
        setLoading(true)
        try {
            const { url, error } = await createStripeSession(planId)

            if (error) {
                toast.error(error)
                setLoading(false)
                return
            }

            if (url) {
                window.location.href = url
            }
        } catch (err) {
            console.error(err)
            toast.error("Checkout failed")
            setLoading(false)
        }
    }

    return (
        <Button onClick={handleCheckout} className="w-full" size="lg" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Redirecting to Stripe..." : `Pay ₹${amount} via Stripe`}
        </Button>
    )
}
