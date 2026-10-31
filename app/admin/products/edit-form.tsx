
'use client'

import { updateProduct } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { Loader2 } from "lucide-react"

export default function EditProductForm({ product }: { product: any }) {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')

    const [loading, setLoading] = useState(false)
    const [type, setType] = useState(product.type || 'service')

    const updateWithId = updateProduct.bind(null, product.id)

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        await updateWithId(formData)
    }

    const attribute = product.product_attributes?.[0]
    const attributeName = attribute?.name || ''
    const attributeValues = attribute?.product_attribute_values?.map((v: any) => v.value).join(', ') || ''
    const extraPrice = attribute?.product_attribute_values?.[0]?.price_extra || 0

    return (
        <div className="max-w-2xl mx-auto p-6 bg-card rounded-lg border shadow-sm mt-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
                <p className="text-muted-foreground text-sm">Update product details.</p>
            </div>

            <form action={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                        {decodeURIComponent(error)}
                    </div>
                )}

                <div className="grid gap-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input id="name" name="name" defaultValue={product.name} required className="max-w-md" />
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-md">
                    <div className="grid gap-2">
                        <Label htmlFor="sales_price">Sales Price (INR)</Label>
                        <Input id="sales_price" name="sales_price" defaultValue={product.sales_price || 0} type="number" step="0.01" min="0" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="cost_price">Cost Price (INR)</Label>
                        <Input id="cost_price" name="cost_price" defaultValue={product.cost_price || 0} type="number" step="0.01" min="0" />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" defaultValue={product.description} className="min-h-[100px]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div className="grid gap-2">
                        <Label>Product Type</Label>
                        <input type="hidden" name="type" value={type} />
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="service">Service</SelectItem>
                                <SelectItem value="consumable">Consumable</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center space-x-2 pb-2">
                        <input
                            type="checkbox"
                            name="active"
                            id="active"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            defaultChecked={product.active}
                        />
                        <Label htmlFor="active" className="font-medium cursor-pointer">Active Status</Label>
                    </div>
                </div>

                <div className="space-y-4 border-t pt-6">
                    <Label className="text-lg font-semibold">Product Attributes</Label>
                    <p className="text-xs text-muted-foreground">Define variants like Size or Color for this product.</p>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="attr_name">Attribute Name</Label>
                            <Input id="attr_name" name="attribute_name" defaultValue={attributeName} placeholder="e.g. Color" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="attr_values">Values</Label>
                            <Input id="attr_values" name="attribute_values" defaultValue={attributeValues} placeholder="Red, Blue" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="extra_price">Extra Price (₹)</Label>
                            <Input id="extra_price" name="extra_price" type="number" step="0.01" defaultValue={extraPrice} placeholder="50.00" />
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-6">
                    <Link href="/admin/products">
                        <Button variant="outline" type="button">Cancel</Button>
                    </Link>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? 'Saving...' : 'Update Product'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
