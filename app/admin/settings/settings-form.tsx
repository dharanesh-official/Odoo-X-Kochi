'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { updateSettings } from "./actions"
import { useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function SettingsForm({ settings }: { settings: any }) {
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        try {
            const result = await updateSettings(formData)
            if (result.success) {
                toast.success('Settings updated successfully')
            } else {
                toast.error(result.error || 'Failed to update settings')
            }
        } catch (error) {
            toast.error('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form action={handleSubmit} className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Business Configuration</CardTitle>
                    <CardDescription>Company branding and base currency.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="company_name">Company Name</Label>
                        <Input
                            id="company_name"
                            name="company_name"
                            defaultValue={settings.company_name || 'SubCheck Inc.'}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="default_currency">Default Currency</Label>
                        <Input
                            id="default_currency"
                            name="default_currency"
                            defaultValue={settings.default_currency || 'inr'}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Automation & Notifications</CardTitle>
                    <CardDescription>Configure background task behaviors.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="auto_invoice" className="flex flex-col space-y-1">
                            <span className="text-base">Automatic Invoicing</span>
                            <span className="font-normal text-xs text-muted-foreground">
                                Generate invoices automatically when a subscription is activated.
                            </span>
                        </Label>
                        <input
                            type="checkbox"
                            id="auto_invoice"
                            name="auto_invoice"
                            defaultChecked={settings.auto_invoice === 'true'}
                            className="h-5 w-5"
                        />
                    </div>

                    <div className="flex items-center justify-between space-x-2 border-t pt-4">
                        <Label htmlFor="send_welcome_email" className="flex flex-col space-y-1">
                            <span className="text-base">Customer Onboarding Emails</span>
                            <span className="font-normal text-xs text-muted-foreground">
                                Send a welcome email when a new customer profile is created.
                            </span>
                        </Label>
                        <input
                            type="checkbox"
                            id="send_welcome_email"
                            name="send_welcome_email"
                            defaultChecked={settings.send_welcome_email === 'true'}
                            className="h-5 w-5"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button variant="outline" type="reset" disabled={loading}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>
        </form>
    )
}
