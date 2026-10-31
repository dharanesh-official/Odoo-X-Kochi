'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Percent, Loader2 } from "lucide-react"
import { createTax } from "./actions"
import { useState } from "react"
import { toast } from "sonner"

export default function TaxesForm() {
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        try {
            const result = await createTax(formData)
            if (result.success) {
                toast.success('Tax rule created')
                // Form will reset naturally if it's a server action, 
                // but since we are handling manually we might need something else 
                // or just let the revalidatePath handle the refresh.
            } else {
                toast.error(result.error || 'Failed to create tax')
            }
        } catch (error) {
            toast.error('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="md:col-span-1 border rounded-lg p-6 bg-card shadow-sm h-fit">
            <h3 className="text-lg font-semibold mb-4 text-primary flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Add New Tax
            </h3>
            <form action={handleSubmit} className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="name">Tax Name (e.g. GST 18%)</Label>
                    <Input id="name" name="name" placeholder="Service Tax" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="rate">Rate (%)</Label>
                    <Input id="rate" name="rate" type="number" step="0.01" placeholder="18.00" required />
                </div>
                <div className="flex items-center space-x-2 bg-muted/50 p-3 rounded-md border border-dashed">
                    <input type="checkbox" name="active" id="active" defaultChecked className="h-4 w-4 rounded border-gray-300 text-primary" />
                    <Label htmlFor="active" className="cursor-pointer">Active for Invoicing</Label>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    Create Tax Rule
                </Button>
            </form>
        </div>
    )
}
