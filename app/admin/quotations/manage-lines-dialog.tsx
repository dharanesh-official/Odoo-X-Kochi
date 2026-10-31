'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { addTemplateLine, deleteTemplateLine, deleteQuotationTemplate } from './actions'
import { Trash2, Plus, Loader2 } from 'lucide-react'

interface Product {
    id: string
    name: string
}

interface TemplateLine {
    id: string
    quantity: number
    products?: { name: string } | null
}

interface QuotationTemplate {
    id: string
    name: string
    description?: string | null
    validity_days: number
    quotation_template_lines?: TemplateLine[]
}

interface ManageLinesDialogProps {
    template: QuotationTemplate
    products: Product[]
}

export function ManageLinesDialog({ template, products }: ManageLinesDialogProps) {
    const [open, setOpen] = useState(false)
    const [selectedProductId, setSelectedProductId] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [loading, setLoading] = useState(false)

    const handleAddLine = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedProductId) return
        setLoading(true)
        try {
            await addTemplateLine(template.id, selectedProductId, Number(quantity) || 1)
            setSelectedProductId('')
            setQuantity(1)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteLine = async (lineId: string) => {
        if (!confirm('Remove this product line?')) return
        setLoading(true)
        try {
            await deleteTemplateLine(lineId)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteTemplate = async () => {
        if (!confirm(`Are you sure you want to delete template "${template.name}"?`)) return
        setLoading(true)
        try {
            await deleteQuotationTemplate(template.id)
            setOpen(false)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">Manage Lines</Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Manage Template: {template.name}</DialogTitle>
                    <DialogDescription>
                        Configure bundled items and default quantities for this quotation template.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Items table */}
                    <div className="border rounded-md overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead>Product</TableHead>
                                    <TableHead className="w-24 text-center">Qty</TableHead>
                                    <TableHead className="w-16 text-right"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!template.quotation_template_lines || template.quotation_template_lines.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-4 text-muted-foreground text-sm">
                                            No items in this template yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    template.quotation_template_lines.map((line) => (
                                        <TableRow key={line.id}>
                                            <TableCell className="font-medium text-sm">
                                                {line.products?.name || 'Unknown Product'}
                                            </TableCell>
                                            <TableCell className="text-center font-mono text-sm">
                                                {line.quantity}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-rose-500 hover:text-rose-700"
                                                    disabled={loading}
                                                    onClick={() => handleDeleteLine(line.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Add Line Form */}
                    <form onSubmit={handleAddLine} className="flex items-end gap-3 pt-2 border-t">
                        <div className="flex-1 space-y-1">
                            <Label htmlFor="product-select" className="text-xs">Add Product</Label>
                            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                                <SelectTrigger id="product-select">
                                    <SelectValue placeholder="Choose a product..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-24 space-y-1">
                            <Label htmlFor="qty-input" className="text-xs">Quantity</Label>
                            <Input
                                id="qty-input"
                                type="number"
                                min={1}
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                required
                            />
                        </div>
                        <Button type="submit" disabled={!selectedProductId || loading} size="default">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                            Add
                        </Button>
                    </form>

                    <div className="flex justify-between items-center pt-4 border-t">
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            disabled={loading}
                            onClick={handleDeleteTemplate}
                        >
                            Delete Template
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setOpen(false)}
                        >
                            Done
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
