
'use client'

import { updatePlan } from "../../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"

export default function EditPlanForm({ plan, discounts }: { plan: any, discounts: any[] }) {
    const [loading, setLoading] = useState(false)
    const [interval, setInterval] = useState(plan.interval)
    const [discountId, setDiscountId] = useState(plan.discount_id || 'none')

    const updateWithId = updatePlan.bind(null, plan.id)

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        try {
            await updateWithId(formData)
        } catch (error) {
            console.error(error)
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-6 bg-card rounded-lg border shadow-sm mt-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">Edit Plan</h1>
                <p className="text-muted-foreground text-sm">Update plan details.</p>
            </div>

            <form action={handleSubmit} className="space-y-6">
                <div className="grid gap-2">
                    <Label>Base Product</Label>
                    <SortOfReadOnlyInput value={plan.products?.name || 'Unknown Product'} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="name">Plan Name</Label>
                    <Input id="name" name="name" defaultValue={plan.name} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="amount">Price (INR)</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                            <Input id="amount" name="amount" type="number" step="0.01" min="0" defaultValue={plan.amount} className="pl-7" required />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="discount">Discount (Optional)</Label>
                        <input type="hidden" name="discount_id" value={discountId} />
                        <Select value={discountId} onValueChange={setDiscountId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a discount..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No Discount</SelectItem>
                                {discounts
                                    .filter(d => !d.product_id || d.product_id === plan.product_id)
                                    .map(d => (
                                        <SelectItem key={d.id} value={d.id}>
                                            {d.name} ({d.type === 'percentage' ? `${d.value}%` : `₹${d.value}`})
                                            {d.product_id ? ' - Product Specific' : ' - Global'}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="interval">Billing Interval</Label>
                        <input type="hidden" name="interval" value={interval} />
                        <Select value={interval} onValueChange={setInterval}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select interval" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 items-end">
                    <div className="grid gap-2">
                        <Label htmlFor="min_quantity">Minimum Quantity</Label>
                        <Input id="min_quantity" name="min_quantity" type="number" min="1" defaultValue={plan.min_quantity || 1} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="trial">Trial Days</Label>
                        <Input id="trial" name="trial_period_days" type="number" min="0" defaultValue={plan.trial_period_days || 0} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="start_date">Start Date</Label>
                        <Input id="start_date" name="start_date" type="date" defaultValue={plan.start_date} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="end_date">End Date</Label>
                        <Input id="end_date" name="end_date" type="date" defaultValue={plan.end_date} />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label>Visibility</Label>
                    <RadioGroup defaultValue={plan.visibility || "private"} name="visibility" className="flex gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="public" id="public" />
                            <Label htmlFor="public" className="font-normal">Public (Visible to all users)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="private" id="private" />
                            <Label htmlFor="private" className="font-normal">Private (Admin/Invite only)</Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="space-y-3 pt-2">
                    <Label>Plan Options</Label>
                    <div className="grid grid-cols-2 gap-4 border p-4 rounded-md">
                        <div className="flex items-center space-x-2">
                            <input type="checkbox" name="active" id="active" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" defaultChecked={plan.active} />
                            <Label htmlFor="active" className="font-medium cursor-pointer">Active Status</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input type="checkbox" name="auto_close" id="auto_close" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" defaultChecked={plan.auto_close} />
                            <Label htmlFor="auto_close" className="font-medium cursor-pointer">Auto-close</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input type="checkbox" name="closable" id="closable" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" defaultChecked={plan.closable} />
                            <Label htmlFor="closable" className="font-medium cursor-pointer">Closable</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input type="checkbox" name="pausable" id="pausable" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" defaultChecked={plan.pausable} />
                            <Label htmlFor="pausable" className="font-medium cursor-pointer">Pausable</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input type="checkbox" name="renewable" id="renewable" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" defaultChecked={plan.renewable} />
                            <Label htmlFor="renewable" className="font-medium cursor-pointer">Renewable</Label>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-6">
                    <Link href="/admin/plans">
                        <Button variant="outline" type="button">Cancel</Button>
                    </Link>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? 'Saving...' : 'Update Plan'}
                    </Button>
                </div>
            </form>
        </div>
    )
}

function SortOfReadOnlyInput({ value }: { value: string }) {
    return (
        <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
            {value}
        </div>
    )
}
