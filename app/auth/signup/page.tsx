import SignupForm from "./signup-form"
import { Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Layers } from "lucide-react"

export default function SignupPage() {
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

                <Suspense fallback={
                    <Card className="w-full border border-border shadow-xs">
                        <CardContent className="p-8 text-center text-muted-foreground text-sm">
                            Loading registration portal...
                        </CardContent>
                    </Card>
                }>
                    <SignupForm />
                </Suspense>
            </div>
        </div>
    )
}
