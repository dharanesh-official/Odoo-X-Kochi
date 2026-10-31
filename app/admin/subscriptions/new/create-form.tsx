
'use client'

import { createSubscription } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { useState } from "react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import { Loader2, Plus, Trash2 } from "lucide-react"

export default function CreateSubscriptionForm({ customers, plans, templates }: { customers: any[], plans: any[], templates?: any[] }) {
    const [loading, setLoading] = useState(false)
    const [customerId, setCustomerId] = useState('')
    const [status, setStatus] = useState('draft')
    const [lines, setLines] = useState([{ id: '1', planId: '', quantity: 1 }])

    const selectedCustomer = customers.find(c => c.id === customerId)

    const addLine = () => setLines([...lines, { id: Math.random().toString(36).substr(2, 9), planId: '', quantity: 1 }])
    const removeLine = (id: string) => setLines(lines.filter(l => l.id !== id))
    const updateLine = (index: number, field: string, value: any) => {
        const newLines = [...lines]
        newLines[index] = { ...newLines[index], [field]: value }
        setLines(newLines)
    }

    const applyTemplate = (templateId: string) => {
        const template = templates?.find(t => t.id === templateId)
        if (!template) return

        const newLines = template.quotation_template_lines.map((tl: any) => {
            // Find the first active plan for this product
            const plan = plans.find(p => p.product_id === tl.product_id)
            return {
                planId: plan?.id || '',
                quantity: tl.quantity,
                id: Math.random().toString(36).substr(2, 9)
            }
        })
        setLines(newLines.length > 0 ? newLines : [{ id: Math.random().toString(36), planId: '', quantity: 1 }])
    }

    // Calculate Estimates
    const subtotal = lines.reduce((acc, line) => {
        const plan = plans.find(p => p.id === line.planId)
        return acc + (Number(plan?.amount || 0) * line.quantity)
    }, 0)
    const taxRate = 0.18 // Estimated GST 18% as per Indian Rules logic
    const taxAmount = subtotal * taxRate
    const totalAmount = subtotal + taxAmount

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        // Add lines data to formData or handle differently if needed
        // For simplicity, we'll assume the action can handle indexed fields or we'll pass it in
        await createSubscription(formData)
    }

    return (
        <form action={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mt-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 bg-card rounded-lg border shadow-sm">
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold tracking-tight">New Subscription</h1>
                            <p className="text-muted-foreground text-sm">Create a multi-line quotation or activate a subscription.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="customer">Customer</Label>
                                <input type="hidden" name="customer_id" value={customerId} />
                                <Select value={customerId} onValueChange={setCustomerId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a customer..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customers.length === 0 ? <SelectItem value="none" disabled>No customers found</SelectItem> : customers.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name} ({c.email})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2 border-t pt-4">
                                <Label htmlFor="template">Load from Quotation Template (Optional)</Label>
                                <Select onValueChange={applyTemplate}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a template to auto-fill..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {templates?.length === 0 ? <SelectItem value="none" disabled>No templates</SelectItem> : templates?.map(t => (
                                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-[10px] text-muted-foreground">Selecting a template will replace existing order lines.</p>
                            </div>

                            <div className="space-y-4 border-t pt-6">
                                <Label>Order Lines</Label>
                                {lines.map((line, index) => (
                                    <div key={line.id} className="grid grid-cols-12 gap-4 items-end bg-muted/30 p-3 rounded-md border border-dashed relative">
                                        <div className="col-span-6">
                                            <Label className="text-[10px] uppercase text-muted-foreground">Product / Plan</Label>
                                            <input type="hidden" name={`lines[${index}].plan_id`} value={line.planId} />
                                            <Select value={line.planId} onValueChange={(val) => updateLine(index, 'planId', val)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Plan" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {plans.map(p => (
                                                        <SelectItem key={p.id} value={p.id}>{p.products?.name} - {p.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="col-span-3">
                                            <Label className="text-[10px] uppercase text-muted-foreground">Quantity</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                className="bg-background"
                                                name={`lines[${index}].quantity`}
                                                value={line.quantity}
                                                onChange={(e) => updateLine(index, 'quantity', Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="col-span-2 text-right py-2">
                                            <div className="text-[10px] uppercase text-muted-foreground">Subtotal</div>
                                            <div className="font-medium text-sm">
                                                {formatCurrency(Number(plans.find(p => p.id === line.planId)?.amount || 0) * line.quantity)}
                                            </div>
                                        </div>
                                        <div className="col-span-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive h-9 w-9"
                                                onClick={() => removeLine(line.id)}
                                                disabled={lines.length === 1}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" className="w-full" onClick={addLine}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Product Line
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t pt-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="status">Initial Status</Label>
                                    <input type="hidden" name="status" value={status} />
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft (Quotation)</SelectItem>
                                            <SelectItem value="active">Active (Bill Now)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="start_date">Start Date</Label>
                                    <Input id="start_date" name="start_date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <Card className="sticky top-4">
                        <CardHeader>
                            <CardTitle>Total Summary</CardTitle>
                            <CardDescription>Consolidated billing details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Customer:</span>
                                <span className="font-medium truncate max-w-[150px]">{selectedCustomer?.name || '-'}</span>
                            </div>
                            <div className="border-t pt-2 mt-2 space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span>Untaxed Amount:</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-muted-foreground">
                                    <span>GST (18%):</span>
                                    <span>{formatCurrency(taxAmount)}</span>
                                </div>
                            </div>
                            <div className="border-t pt-4 flex justify-between items-center font-bold text-xl text-primary">
                                <span>Total:</span>
                                <span>{formatCurrency(totalAmount)}</span>
                            </div>
                            <div className="pt-4">
                                <Button type="submit" className="w-full" size="lg" disabled={!customerId || lines.some(l => !l.planId) || loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {status === 'active' ? 'Verify & Create' : 'Send Quotation'}
                                </Button>
                                <Link href="/admin/subscriptions">
                                    <Button variant="ghost" className="w-full mt-2" type="button">Discard</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    )
}
