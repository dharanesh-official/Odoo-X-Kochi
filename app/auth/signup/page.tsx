
import SignupForm from "./signup-form"
import { Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"

export default function SignupPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden py-12 px-4">
            {/* Animated Background Blobs */}
            <div className="absolute inset-0 z-0">
                <div className="absolute -top-10 -left-10 w-96 h-96 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
                <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
            </div>

            <Suspense fallback={
                <Card className="w-full max-w-sm z-10 relative">
                    <CardContent className="p-8 text-center text-muted-foreground">
                        Loading signup form...
                    </CardContent>
                </Card>
            }>
                <SignupForm />
            </Suspense>
        </div>
    )
}
