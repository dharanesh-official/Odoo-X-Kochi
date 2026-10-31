'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { loginAdmin } from "../actions"
import { useSearchParams, useRouter } from "next/navigation"
import { useRef, useEffect, useState } from "react"
import { toast } from "sonner"
import { TriangleAlert, ShieldCheck, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

export default function AdminLoginForm() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const error = searchParams.get('error')
    const toastShownRef = useRef(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (error && !toastShownRef.current) {
            toastShownRef.current = true
            setLoading(false)
            toast.warning(error, {
                icon: <TriangleAlert className="h-5 w-5 mr-3 text-red-500" />,
                description: "Security credentials verification failed.",
                duration: 5000,
                id: "admin-login-error"
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
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 w-full"
        >
            <Card className="w-full border border-brand-800 bg-brand-900 text-brand-100 shadow-md">
                <CardHeader className="space-y-1 pb-4">
                    <div className="flex justify-center mb-2">
                        <div className="p-2.5 bg-brand-800/80 rounded-lg border border-brand-700/60 text-brand-400">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                    </div>
                    <CardTitle className="text-xl font-bold text-center tracking-tight text-white">Operations Console</CardTitle>
                    <CardDescription className="text-center text-brand-100/70 text-xs">
                        Restricted access for internal administrators and operators.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={loginAdmin} onSubmit={() => setLoading(true)} className="grid gap-4">
                        <div className="grid gap-2">
                            <label htmlFor="email" className="text-xs font-semibold text-brand-100">Operator Email</label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="operator@brightloop.com"
                                required
                                className="bg-brand-950/80 border-brand-800 text-brand-100 placeholder:text-brand-100/40 focus-visible:ring-brand-400 text-sm"
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <label htmlFor="password" className="text-xs font-semibold text-brand-100">Security Key / Password</label>
                            </div>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                placeholder="••••••••"
                                className="bg-brand-950/80 border-brand-800 text-brand-100 placeholder:text-brand-100/40 focus-visible:ring-brand-400 text-sm"
                            />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full font-semibold bg-brand-700 hover:bg-brand-600 text-white shadow-xs transition-all">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying session...
                                </>
                            ) : (
                                "Sign In to Operations"
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-xs text-brand-100/60">
                        <Link href="/auth/login" className="hover:text-white transition-colors">
                            &larr; Switch to Customer Portal
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
