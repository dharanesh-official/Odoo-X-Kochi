
'use client'

import { createCustomer } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import Link from "next/link"

export default function CreateCustomerForm() {
    const [loading, setLoading] = useState(false)

    // Use simple form submission
    return (
        <div className="max-w-2xl mx-auto p-6 bg-card rounded-lg border shadow-sm mt-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">New Customer</h1>
                <p className="text-muted-foreground text-sm">Add a customer record manually.</p>
            </div>

            <form action={createCustomer} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" name="name" placeholder="John Doe" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" name="email" type="email" placeholder="john@company.com" required />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" placeholder="+1 (555) 000-0000" />
                </div>

                <div className="border-t pt-4 mt-4">
                    <h3 className="text-lg font-medium mb-4">Billing Address</h3>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="street">Street Address</Label>
                            <Input id="street" name="street" placeholder="123 Main St" />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="city">City</Label>
                                <Input id="city" name="city" placeholder="New York" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="zip">ZIP / Postal</Label>
                                <Input id="zip" name="zip" placeholder="10001" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="country">Country</Label>
                                <Input id="country" name="country" placeholder="USA" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-6">
                    <Link href="/admin/customers">
                        <Button variant="outline" type="button">Cancel</Button>
                    </Link>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Create Customer'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
