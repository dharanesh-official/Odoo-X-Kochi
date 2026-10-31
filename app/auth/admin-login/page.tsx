import AdminLoginForm from "./login-form"
import { Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ShieldAlert } from "lucide-react"

export default function AdminLoginPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-brand-950 px-4 py-12 relative overflow-hidden text-brand-100">
            {/* Subtle administrative accent border container */}
            <div className="w-full max-w-sm space-y-6 relative z-10">
                <div className="text-center">
                    <Link href="/" className="inline-flex items-center gap-2 mb-2 group">
                        <div className="h-9 w-9 rounded-lg bg-brand-800 text-brand-400 flex items-center justify-center border border-brand-700 shadow-xs">
                            <ShieldAlert className="h-5 w-5" />
                        </div>
                        <span className="font-extrabold text-xl tracking-tight text-white">Brightloop Admin</span>
                    </Link>
                </div>

                <Suspense fallback={
                    <Card className="w-full border border-brand-800 bg-brand-900 shadow-xs">
                        <CardContent className="p-8 text-center text-brand-400 text-sm">
                            Loading administrative console...
                        </CardContent>
                    </Card>
                }>
                    <AdminLoginForm />
                </Suspense>
            </div>
        </div>
    )
}
