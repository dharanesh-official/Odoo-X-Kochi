import { getDiscounts, createDiscount, deleteDiscount } from "./actions"
import ClientMessages from './client-messages'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Tag, Trash2 } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function DiscountsPage() {
    const discounts = await getDiscounts()

    // Fetch products for product-specific discounts
    const { createClient } = await import('@/utils/supabase/server')
    const supabase = await createClient()
    const { data: products } = await supabase.from('products').select('id, name').eq('active', true)

    async function handleCreate(formData: FormData) {
        'use server'
        await createDiscount(formData)
    }

    async function handleDelete(formData: FormData) {
        'use server'
        const id = formData.get('id') as string
        await deleteDiscount(id)
    }

    return (
        <div className="space-y-6">
            <ClientMessages />
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Discounts & Promos</h1>
                    <p className="text-muted-foreground">Manage promotional rules and fixed-amount discounts.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 border rounded-lg p-6 bg-card shadow-sm h-fit">
                    <h3 className="text-lg font-semibold mb-4 text-primary flex items-center gap-2">
                        <Tag className="h-5 w-5" />
                        Create Discount
                    </h3>
                    <form action={handleCreate} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Discount Name</Label>
                            <Input id="name" name="name" placeholder="Summer Sale" autoComplete="off" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input id="description" name="description" placeholder="Special festival offer" autoComplete="off" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="product_id">Apply To</Label>
                            <Select name="product_id" defaultValue="all">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Products (Global)</SelectItem>
                                    {products?.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="type">Type</Label>
                                <Select name="type" defaultValue="percentage">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                                        <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="value">Value</Label>
                                <Input id="value" name="value" type="number" step="0.01" placeholder="10" autoComplete="off" required />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="min_amount">Min Purchase (Optional)</Label>
                            <Input id="min_amount" name="min_amount" type="number" placeholder="500" autoComplete="off" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="valid_from">Valid From</Label>
                                <Input id="valid_from" name="valid_from" type="date" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="valid_until">Valid Until</Label>
                                <Input id="valid_until" name="valid_until" type="date" />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-muted/50 p-3 rounded-md border border-dashed">
                            <input type="checkbox" name="active" id="active" defaultChecked className="h-4 w-4 rounded border-gray-300 text-primary" />
                            <Label htmlFor="active" className="cursor-pointer">Active</Label>
                        </div>
                        <Button type="submit" className="w-full">
                            <Plus className="mr-2 h-4 w-4" /> Create Discount
                        </Button>
                    </form>
                </div>

                <div className="md:col-span-2 border rounded-lg bg-card shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead>Discount Name</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Applies To</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead>Valid Period</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {discounts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground italic">
                                        No discount rules created.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                discounts.map((d) => (
                                    <TableRow key={d.id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-medium">{d.name}</TableCell>
                                        <TableCell>
                                            <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                                {d.code || 'N/A'}
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            {d.products ? (
                                                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                    {d.products.name}
                                                </span>
                                            ) : (
                                                <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                                    Global
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{d.description || '-'}</TableCell>
                                        <TableCell>
                                            {d.type === 'percentage' ? `${d.value}%` : `₹${d.value}`}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {d.valid_from || d.valid_until ? (
                                                <>
                                                    {d.valid_from ? new Date(d.valid_from).toLocaleDateString() : 'Start'}
                                                    {' - '}
                                                    {d.valid_until ? new Date(d.valid_until).toLocaleDateString() : 'End'}
                                                </>
                                            ) : 'No limit'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={d.active ? "default" : "secondary"} className={d.active ? "bg-green-600" : ""}>
                                                {d.active ? "Active" : "Disabled"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <form action={handleDelete} className="inline">
                                                <input type="hidden" name="id" value={d.id} />
                                                <Button type="submit" variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </form>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
