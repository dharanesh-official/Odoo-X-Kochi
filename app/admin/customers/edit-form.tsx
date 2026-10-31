'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateCustomer } from "./actions"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function EditCustomerForm({ customer }: { customer: any }) {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')

    // Bind ID to action
    const updateWithId = updateCustomer.bind(null, customer.id)

    const address = customer.address || {}

    return (
        <div className="max-w-2xl mx-auto">
            <form action={updateWithId}>
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Customer</CardTitle>
                        <CardDescription>Update customer details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                                {decodeURIComponent(error)}
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" required defaultValue={customer.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" required defaultValue={customer.email} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" name="phone" type="tel" defaultValue={customer.phone} />
                        </div>

                        <div className="grid gap-2 pt-2">
                            <Label>Address</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <Input name="street" placeholder="Street Address" defaultValue={address.street} />
                                </div>
                                <Input name="city" placeholder="City" defaultValue={address.city} />
                                <Input name="zip" placeholder="ZIP Code" defaultValue={address.zip} />
                                <div className="col-span-2">
                                    <Input name="country" placeholder="Country" defaultValue={address.country} />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <Link href="/admin/customers">
                                <Button type="button" variant="outline">Cancel</Button>
                            </Link>
                            <Button type="submit">Update Customer</Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    )
}
