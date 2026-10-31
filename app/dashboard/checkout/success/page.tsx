'use client'

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { handleStripeSuccess } from "./actions"

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const sessionId = searchParams.get('session_id')
    const subscriptionId = searchParams.get('subscription_id')

    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
    const [message, setMessage] = useState('')

    useEffect(() => {
        if (!sessionId || !subscriptionId) {
            setStatus('error')
            setMessage("Invalid Request: Missing parameters")
            return
        }

        const verify = async () => {
            try {
                const result = await handleStripeSuccess(sessionId, subscriptionId)

                if (result.success) {
                    setStatus('success')
                } else {
                    setStatus('error')
                    setMessage(result.error || "Payment verification failed")
                }
            } catch (err) {
                console.error(err)
                setStatus('error')
                setMessage("An unexpected error occurred")
            }
        }

        verify()
    }, [sessionId, subscriptionId])

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50/50">
            <div className="mx-auto flex w-full max-w-[400px] flex-col justify-center space-y-6 text-center bg-white p-8 rounded-xl shadow-lg border">
                {status === 'verifying' && (
                    <>
                        <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
                        <h1 className="text-2xl font-bold tracking-tight">Verifying Payment...</h1>
                        <p className="text-muted-foreground">Please wait while we confirm your transaction securely.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle2 className="h-10 w-10 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-green-700">Payment Successful!</h1>
                        <p className="text-muted-foreground">Your subscription is now active.</p>
                        <div className="pt-4">
                            <Button className="w-full" size="lg" onClick={() => router.push('/dashboard')}>
                                Go to Dashboard
                            </Button>
                        </div>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                            <span className="text-3xl">❌</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-red-600">Verification Failed</h1>
                        <p className="text-muted-foreground">{message}</p>
                        <div className="pt-4 space-y-2">
                            <Button className="w-full" variant="outline" onClick={() => router.back()}>
                                Try Again
                            </Button>
                            <Button className="w-full" variant="ghost" onClick={() => router.push('/dashboard')}>
                                Go to Dashboard
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
