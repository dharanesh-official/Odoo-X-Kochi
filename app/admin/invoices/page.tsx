import { createClient } from "@/utils/supabase/server"
export const dynamic = 'force-dynamic'
import { Button } from "@/components/ui/button"
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
import { sendInvoiceManually, cancelInvoice, confirmInvoice, markInvoicePaid } from "./actions"
import SendInvoiceButton from "./send-button"
import PrintInvoiceButton from "./print-button"
import Link from "next/link"
import { XCircle, Eye } from "lucide-react"

export default async function InvoicesPage() {
    const supabase = await createClient()

    const { data: invoices } = await supabase
        .from('invoices')
        .select(`
      *,
      customers (name, email),
      subscriptions (plan_id, quantity, plans(name))
    `)
        .order('created_at', { ascending: false })

    // Helper to safely format dates
    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-'
        try {
            return new Date(dateString).toLocaleDateString()
        } catch (e) {
            return 'Invalid Date'
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
                <Button disabled variant="outline">
                    Auto-Generated
                </Button>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invoice ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[150px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!invoices || invoices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No invoices found. Activate a subscription to generate one.
                                </TableCell>
                            </TableRow>
                        ) : (invoices.map((inv: any) => (
                            <TableRow key={inv.id}>
                                <TableCell className="font-mono text-xs text-muted-foreground uppercase">
                                    {inv.id?.slice(0, 8) || 'N/A'}
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">{inv.customers?.name || 'Unknown Customer'}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {inv.subscriptions?.plans?.name || 'Manual Charge'}
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">
                                    {formatCurrency(Number(inv.amount_due || 0))}
                                </TableCell>
                                <TableCell>{formatDate(inv.due_date)}</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        inv.status === 'paid' ? 'default' :
                                            inv.status === 'confirmed' ? 'default' :
                                                inv.status === 'sent' ? 'default' :
                                                    inv.status === 'overdue' ? 'destructive' :
                                                        'secondary'
                                    } className={
                                        inv.status === 'paid' ? 'bg-green-600 hover:bg-green-700' :
                                            inv.status === 'confirmed' ? 'bg-blue-600 hover:bg-blue-700' :
                                                inv.status === 'sent' ? 'bg-purple-600 hover:bg-purple-700' :
                                                    ''
                                    }>
                                        {inv.status || 'draft'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        {inv.status === 'draft' && (
                                            <form action={confirmInvoice.bind(null, inv.id)}>
                                                <Button size="sm" variant="default">Confirm</Button>
                                            </form>
                                        )}
                                        {(inv.status === 'confirmed' || inv.status === 'sent') && (
                                            <form action={markInvoicePaid.bind(null, inv.id)}>
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700">Mark Paid</Button>
                                            </form>
                                        )}
                                        <Link href={`/admin/invoices/${inv.id}`}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" title="View Details">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <SendInvoiceButton invoiceId={inv.id} customerEmail={inv.customers?.email} />
                                        {inv.status !== 'cancelled' && inv.status !== 'paid' && (
                                            <form action={async () => {
                                                'use server'
                                                await cancelInvoice(inv.id)
                                            }}>
                                                <Button variant="ghost" size="icon" className="text-destructive h-8 w-8">
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                            </form>
                                        )}
                                        <PrintInvoiceButton invoiceId={inv.id} />
                                    </div>
                                </TableCell>
                            </TableRow>
                        )))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
