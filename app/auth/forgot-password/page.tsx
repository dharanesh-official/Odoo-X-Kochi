'use client'

import { Suspense, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { createClient } from "@/utils/supabase/client"
import { Layers } from "lucide-react"

function ForgotPasswordContent() {
    const searchParams = useSearchParams()
    const [error, setError] = useState<string | null>(searchParams.get('error'))
    const [message, setMessage] = useState<string | null>(searchParams.get('message'))
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        setError(null)
        setMessage(null)
        const email = formData.get('email') as string
        const supabase = createClient()
        const origin = window.location.origin

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
        })

        if (error) {
            setError(error.message)
        } else {
            setMessage('A verification link has been dispatched to your email address.')
        }
        setLoading(false)
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 w-full max-w-sm"
        >
            <Card className="border border-border/90 shadow-sm bg-card rounded-xl">
                <CardHeader className="space-y-1 pb-4">
                    <CardTitle className="text-xl font-bold text-center tracking-tight text-brand-950">Password Recovery</CardTitle>
                    <CardDescription className="text-center text-xs">
                        Enter your registered email address to receive password instructions.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20">
                            {decodeURIComponent(error)}
                        </div>
                    )}
                    {message && (
                        <div className="mb-4 p-3 rounded-md bg-brand-100 text-brand-900 text-xs font-medium border border-brand-400/40">
                            {message}
                        </div>
                    )}
                    <form action={handleSubmit} className="grid gap-4">
                        <div className="grid gap-2">
                            <label htmlFor="email" className="text-xs font-semibold text-foreground">Email Address</label>
                            <Input id="email" name="email" type="email" placeholder="name@company.com" required className="bg-background text-sm" />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full font-semibold bg-brand-700 hover:bg-brand-800 text-white shadow-xs transition-all">
                            {loading ? 'Dispatching...' : 'Send Recovery Link'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-xs text-muted-foreground">
                        Remember your password?{" "}
                        <Link href="/auth/login" className="font-semibold text-brand-700 hover:text-brand-800 transition-colors">
                            Return to Sign In
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

export default function ForgotPasswordPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
            {/* Subtle brand radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_-10%,rgba(218,241,222,0.5),rgba(255,255,255,0))] pointer-events-none" />

            <div className="w-full max-w-sm space-y-6 relative z-10">
                <div className="text-center">
                    <Link href="/" className="inline-flex items-center gap-2 mb-2 group">
                        <div className="h-9 w-9 rounded-lg bg-brand-900 text-brand-100 flex items-center justify-center shadow-xs transition-colors group-hover:bg-brand-800">
                            <Layers className="h-5 w-5" />
                        </div>
                        <span className="font-extrabold text-xl tracking-tight text-brand-950">Brightloop</span>
                    </Link>
                </div>

                <Suspense fallback={<div className="text-center text-sm text-muted-foreground">Loading...</div>}>
                    <ForgotPasswordContent />
                </Suspense>
            </div>
        </div>
    )
}
