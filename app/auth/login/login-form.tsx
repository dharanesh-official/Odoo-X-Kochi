'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { loginCustomer } from "../actions"
import { useSearchParams, useRouter } from "next/navigation"
import { useRef, useEffect, useState } from "react"
import { toast } from "sonner"
import { TriangleAlert, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

export default function LoginForm() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const error = searchParams.get('error')
    const toastShownRef = useRef(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (error && !toastShownRef.current) {
            toastShownRef.current = true
            setLoading(false) // Reset loading on error return

            toast.warning(error, {
                icon: <TriangleAlert className="h-5 w-5 mr-3 text-amber-500" />,
                description: "Please check your details.",
                duration: 5000,
                id: "login-error"
            })

            const newUrl = new URL(window.location.href)
            newUrl.searchParams.delete('error')
            router.replace(newUrl.pathname + newUrl.search)
        } else if (!error) {
            toastShownRef.current = false
        }
    }, [error, router])

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
        >
            <Card className="w-full max-w-sm border-0 shadow-2xl bg-background/80 backdrop-blur-xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center tracking-tight">Customer Portal</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email to login to your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={loginCustomer} onSubmit={() => setLoading(true)} className="grid gap-4">
                        <div className="grid gap-2">
                            <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
                            <Input id="email" name="email" type="email" placeholder="m@example.com" required className="bg-background/50" />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Password</label>
                                <Link href="/auth/forgot-password" className="ml-auto inline-block text-xs uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                            <Input id="password" name="password" type="password" required placeholder="********" className="bg-background/50" />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign in"
                            )}
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-muted" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <form action={async () => {
                        setLoading(true)
                        const { loginWithGoogle } = await import("../actions")
                        await loginWithGoogle()
                    }}>
                        <Button variant="outline" type="submit" disabled={loading} className="w-full hover:bg-muted/50 transition-colors">
                            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                            </svg>
                            {loading ? 'Redirecting...' : 'Google'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/auth/signup" className="underline underline-offset-4 hover:text-primary transition-colors font-medium">
                            Sign up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
