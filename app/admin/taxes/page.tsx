import { getTaxes } from "./actions"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import TaxesForm from "./taxes-form"

export const dynamic = 'force-dynamic'

export default async function TaxesPage() {
    const taxes = await getTaxes()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tax Management</h1>
                    <p className="text-muted-foreground">Configure GST, VAT, and other service taxes.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <TaxesForm />

                <div className="md:col-span-2 border rounded-lg bg-card shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead>Tax Name</TableHead>
                                <TableHead>Rate (%)</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {taxes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-12 text-muted-foreground italic">
                                        No taxes configured. Start by adding one.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                taxes.map((tax) => (
                                    <TableRow key={tax.id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-medium">{tax.name}</TableCell>
                                        <TableCell className="font-mono">{tax.rate}%</TableCell>
                                        <TableCell>
                                            <Badge active={tax.active}>
                                                {tax.active ? "Active" : "Inactive"}
                                            </Badge>
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

function Badge({ children, active }: { children: React.ReactNode, active: boolean }) {
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${active
            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            : 'bg-slate-100 text-slate-800 border border-slate-200'
            }`}>
            {children}
        </span>
    )
}
