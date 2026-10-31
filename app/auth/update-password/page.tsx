
'use client'

import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { updatePassword } from "../actions"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"

function UpdatePasswordContent() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 w-full max-w-sm"
        >
            <Card className="border-0 shadow-2xl bg-background/80 backdrop-blur-xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center tracking-tight">Set New Password</CardTitle>
                    <CardDescription className="text-center">
                        Enter your new password below.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
                            {decodeURIComponent(error)}
                        </div>
                    )}
                    <form action={updatePassword} className="grid gap-4">
                        <div className="grid gap-2">
                            <label htmlFor="password" className="text-sm font-medium leading-none">New Password</label>
                            <Input id="password" name="password" type="password" required className="bg-background/50" />
                        </div>
                        <Button type="submit" className="w-full font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                            Update Password
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    )
}

export default function UpdatePasswordPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden py-12 px-4">
            {/* Animated Background Blobs */}
            <div className="absolute inset-0 z-0">
                <div className="absolute -top-10 -left-10 w-96 h-96 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
                <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
            </div>

            <Suspense fallback={<div>Loading...</div>}>
                <UpdatePasswordContent />
            </Suspense>
        </div>
    )
}
