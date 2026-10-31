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
            setLoading(false) // Reset on error
            toast.warning(error, {
                icon: <TriangleAlert className="h-5 w-5 mr-3 text-red-500" />,
                description: "Security check failed.",
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
        >
            <Card className="w-full max-w-sm border-0 shadow-2xl bg-zinc-900/90 text-zinc-100 backdrop-blur-xl border-zinc-800">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-2">
                        <div className="p-3 bg-blue-600/20 rounded-full">
                            <ShieldCheck className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-center tracking-tight">Admin Console</CardTitle>
                    <CardDescription className="text-center text-zinc-400">
                        Secure access for administrators only.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={loginAdmin} onSubmit={() => setLoading(true)} className="grid gap-4">
                        <div className="grid gap-2">
                            <label htmlFor="email" className="text-sm font-medium leading-none text-zinc-300">Email</label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="admin@company.com"
                                required
                                className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-blue-500"
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <label htmlFor="password" className="text-sm font-medium leading-none text-zinc-300">Password</label>
                            </div>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                placeholder="••••••••"
                                className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-blue-500"
                            />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                "Authenticate"
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-xs text-zinc-500">
                        <Link href="/auth/login" className="hover:text-blue-400 transition-colors">
                            &larr; Return to Customer Portal
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
