'use client'

import { Suspense, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { createClient } from "@/utils/supabase/client"

function ForgotPasswordContent() {
    const searchParams = useSearchParams()
    const [error, setError] = useState<string | null>(searchParams.get('error'))
    const [message, setMessage] = useState<string | null>(searchParams.get('message'))
    const [loading, setLoading] = useState(false)

    // Using Client-side handling to ensure PKCE cookies are set correctly
    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        setError(null)
        setMessage(null)
        const email = formData.get('email') as string
        const supabase = createClient()

        // Browser-side reliable origin
        const origin = window.location.origin

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
        })

        if (error) {
            setError(error.message)
        } else {
            setMessage('Check your email for the reset link.')
        }
        setLoading(false)
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 w-full max-w-sm"
        >
            <Card className="border-0 shadow-2xl bg-background/80 backdrop-blur-xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center tracking-tight">Recover Account</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email to receive a password reset link.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
                            {decodeURIComponent(error)}
                        </div>
                    )}
                    {message && (
                        <div className="mb-4 p-3 rounded-md bg-green-500/10 text-green-600 text-sm font-medium border border-green-500/20">
                            {message}
                        </div>
                    )}
                    <form action={handleSubmit} className="grid gap-4">
                        <div className="grid gap-2">
                            <label htmlFor="email" className="text-sm font-medium leading-none">Email</label>
                            <Input id="email" name="email" type="email" placeholder="m@example.com" required className="bg-background/50" />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        Remember your password?{" "}
                        <Link href="/auth/login" className="underline underline-offset-4 hover:text-primary transition-colors font-medium">
                            Back to login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

export default function ForgotPasswordPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden py-12 px-4">
            {/* Animated Background Blobs */}
            <div className="absolute inset-0 z-0">
                <div className="absolute -top-10 -left-10 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
                <div className="absolute top-0 -right-4 w-96 h-96 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
            </div>

            <Suspense fallback={<div>Loading...</div>}>
                <ForgotPasswordContent />
            </Suspense>
        </div>
    )
}
