import { getPayments } from "./actions"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Landmark, Calendar, User, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export const dynamic = 'force-dynamic'

export default async function PaymentsPage() {
    const payments = await getPayments()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Payment Tracking</h1>
                    <p className="text-muted-foreground">Monitor settlements and reconcile billing statements.</p>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-card p-4 rounded-lg border">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search transaction ID..." className="pl-9" />
                </div>
                <div className="text-sm text-muted-foreground">
                    Total Transactions: <span className="font-bold text-foreground">{payments.length}</span>
                </div>
            </div>

            <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[150px]">Date</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Reference</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                    No payments recorded.
                                </TableCell>
                            </TableRow>
                        ) : (
                            payments.map((p: any) => (
                                <TableRow key={p.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3 w-3 text-muted-foreground" />
                                            {new Date(p.payment_date).toLocaleDateString()}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 font-medium">
                                            <User className="h-3 w-3 text-muted-foreground" />
                                            {p.customers?.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs uppercase text-muted-foreground">
                                        {p.transaction_id || `PAY-${p.id.slice(0, 8)}`}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 capitalize">
                                            <Landmark className="h-3 w-3 text-muted-foreground" />
                                            {p.payment_method?.replace(/_/g, ' ')}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold text-emerald-600">
                                        {formatCurrency(p.amount)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                            {p.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
