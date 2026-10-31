
'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { signup } from "../actions"
import { useSearchParams, useRouter } from "next/navigation"
import { useRef, useEffect, useState } from "react"
import { toast } from "sonner"
import { TriangleAlert, Check, X } from "lucide-react"
import { motion } from "framer-motion"

export default function SignupForm() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const error = searchParams.get('error')
    const toastShownRef = useRef(false)
    const [password, setPassword] = useState('')

    const passwordRequirements = {
        length: password.length > 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]|_/.test(password),
    }

    const isPasswordValid = Object.values(passwordRequirements).every(Boolean)

    useEffect(() => {
        if (error && !toastShownRef.current) {
            toastShownRef.current = true

            toast.warning(error, {
                icon: <TriangleAlert className="h-5 w-5 mr-3 text-amber-500" />,
                description: "Review current fields and try again.",
                duration: 5000,
                id: "signup-error"
            })

            const newUrl = new URL(window.location.href)
            newUrl.searchParams.delete('error')
            router.replace(newUrl.pathname + newUrl.search)
        } else if (!error) {
            toastShownRef.current = false
        }
    }, [error, router])

    const [loading, setLoading] = useState(false)

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        const result = await signup(formData).catch(() => null)
        // If signup redirects, loading stays true until page change.
        // If correct, user is redirected. If error is returned via URL param,
        // the useEffect above flips it off.
        if (!result) setLoading(false)
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
                    <CardTitle className="text-2xl font-bold text-center tracking-tight">Create an account</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email below to start up for your free trial.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label htmlFor="first-name" className="text-sm font-medium leading-none">First name</label>
                                <Input id="first-name" name="first-name" placeholder="Max" required className="bg-background/50" />
                            </div>
                            <div className="grid gap-2">
                                <label htmlFor="last-name" className="text-sm font-medium leading-none">Last name</label>
                                <Input id="last-name" name="last-name" placeholder="Robinson" required className="bg-background/50" />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="email" className="text-sm font-medium leading-none">Email</label>
                            <Input id="email" name="email" type="email" placeholder="m@example.com" required className="bg-background/50" />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="password" className="text-sm font-medium leading-none">Password</label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="bg-background/50"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {password && (
                                <div className="text-xs space-y-1 mt-2">
                                    <div className={`flex items-center gap-2 ${passwordRequirements.length ? 'text-green-600' : 'text-muted-foreground'}`}>
                                        {passwordRequirements.length ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                        <span>At least 8 characters</span>
                                    </div>
                                    <div className={`flex items-center gap-2 ${passwordRequirements.uppercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                                        {passwordRequirements.uppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                        <span>One uppercase letter</span>
                                    </div>
                                    <div className={`flex items-center gap-2 ${passwordRequirements.lowercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                                        {passwordRequirements.lowercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                        <span>One lowercase letter</span>
                                    </div>
                                    <div className={`flex items-center gap-2 ${passwordRequirements.special ? 'text-green-600' : 'text-muted-foreground'}`}>
                                        {passwordRequirements.special ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                        <span>One special character</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <Button
                            type="submit"
                            className="w-full font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            disabled={(!isPasswordValid && password.length > 0) || loading}
                        >
                            {loading ? 'Creating account...' : 'Create account'}
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
                        const { loginWithGoogle } = await import("../actions")
                        await loginWithGoogle()
                    }}>
                        <Button variant="outline" type="submit" className="w-full hover:bg-muted/50 transition-colors">
                            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                            </svg>
                            Google
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="underline underline-offset-4 hover:text-primary transition-colors font-medium">
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
