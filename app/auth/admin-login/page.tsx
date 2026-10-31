
import AdminLoginForm from "./login-form"
import { Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"

export default function AdminLoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
            {/* Animated Background - Admin Theme (Darker/Blue-ish?) */}
            <div className="absolute inset-0 z-0 bg-slate-950">
                <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob" />
                <div className="absolute top-0 -right-4 w-96 h-96 bg-indigo-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob animation-delay-2000" />
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob animation-delay-4000" />
            </div>

            <Suspense fallback={
                <Card className="w-full max-w-sm z-10 relative">
                    <CardContent className="p-8 text-center text-muted-foreground">
                        Loading admin portal...
                    </CardContent>
                </Card>
            }>
                <AdminLoginForm />
            </Suspense>
        </div>
    )
}
