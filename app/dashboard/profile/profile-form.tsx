'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateCustomerProfile } from './actions'
import { Loader2, Check } from 'lucide-react'

export default function ProfileForm({ customer }: { customer: any }) {
    const [loading, setLoading] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSaved(false)

        try {
            const formData = new FormData(e.currentTarget)
            const result = await updateCustomerProfile(formData)
            if (result.error) {
                setError(result.error)
            } else {
                setSaved(true)
                setTimeout(() => setSaved(false), 3000)
            }
        } catch (err: any) {
            setError(err?.message || 'Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 text-sm rounded bg-rose-50 text-rose-700 border border-rose-200">
                    {error}
                </div>
            )}
            {saved && (
                <div className="p-3 text-sm rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-2">
                    <Check className="h-4 w-4" /> Profile updated successfully!
                </div>
            )}

            <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" value={customer.email} disabled className="bg-muted cursor-not-allowed" />
                <p className="text-xs text-muted-foreground">Email is tied to your login account and cannot be modified directly.</p>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" defaultValue={customer.name} required />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" defaultValue={customer.phone || ''} placeholder="+91 98765 43210" />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="address">Billing Address</Label>
                <Input id="address" name="address" defaultValue={customer.address || ''} placeholder="123 High Street, Kochi, Kerala" />
            </div>

            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
        </form>
    )
}
