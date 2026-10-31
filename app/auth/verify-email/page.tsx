
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { MailCheck } from "lucide-react"
import Link from "next/link"

export default function VerifyEmailPage() {
    return (
        <div className="flex h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            <MailCheck className="h-8 w-8" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Check your email</CardTitle>
                    <CardDescription className="text-base pt-2">
                        We've sent a confirmation link to your inbox. <br />
                        Please verify your email to access your account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pb-8">
                    <div className="text-sm text-muted-foreground mb-6">
                        Didn't receive the email? Check your spam folder or try again.
                    </div>
                    <div className="flex justify-center gap-4">
                        <Link href="/auth/login">
                            <Button variant="outline">Back to Login</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
