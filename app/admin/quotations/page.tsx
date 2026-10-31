import { getQuotationTemplates, createQuotationTemplate } from "./actions"
export const dynamic = 'force-dynamic'
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
import { FileText, Plus, Package } from "lucide-react"

export default async function QuotationsPage() {
    const templates = await getQuotationTemplates()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quotation Templates</h1>
                    <p className="text-muted-foreground">Predefine service bundles and setups for quick sales.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-1 border rounded-lg p-6 bg-card shadow-sm h-fit">
                    <h3 className="text-lg font-semibold mb-4">New Template</h3>
                    <form action={async (formData) => {
                        'use server'
                        await createQuotationTemplate(formData);
                    }} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Template Name</Label>
                            <Input id="name" name="name" placeholder="E-commerce Starter Pack" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input id="description" name="description" placeholder="Standard setup for small retailers" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="validity_days">Validity (Days)</Label>
                            <Input id="validity_days" name="validity_days" type="number" defaultValue={15} required />
                        </div>
                        <Button type="submit" className="w-full">
                            <Plus className="mr-2 h-4 w-4" /> Create Template
                        </Button>
                    </form>
                </div>

                <div className="md:col-span-3 border rounded-lg bg-card shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead>Template Name</TableHead>
                                <TableHead>Validity</TableHead>
                                <TableHead>Included Items</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {templates.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        No quotation templates found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                templates.map((tmpl) => (
                                    <TableRow key={tmpl.id}>
                                        <TableCell className="font-medium align-top">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-blue-500" />
                                                <div className="flex flex-col">
                                                    <span>{tmpl.name}</span>
                                                    <span className="text-xs text-muted-foreground font-normal">{tmpl.description}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="align-top font-mono text-sm">{tmpl.validity_days} Days</TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                {tmpl.quotation_template_lines?.length > 0 ? (
                                                    tmpl.quotation_template_lines.map((line: any) => (
                                                        <div key={line.id} className="text-xs flex items-center gap-1 text-muted-foreground">
                                                            <Package className="h-3 w-3" />
                                                            {line.quantity}x {line.products?.name}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic">No items added yet</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right align-top">
                                            <Button variant="outline" size="sm">Manage Lines</Button>
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
