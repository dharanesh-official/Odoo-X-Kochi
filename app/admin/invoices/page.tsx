import { createAdminClient } from "@/utils/supabase/admin"
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
import { cancelInvoice, confirmInvoice, markInvoicePaid } from "./actions"
import SendInvoiceButton from "./send-button"
import PrintInvoiceButton from "./print-button"
import Link from "next/link"
import { XCircle, Eye, AlertCircle, Clock, CheckCircle2 } from "lucide-react"

export default async function InvoicesPage({
    searchParams,
}: {
    searchParams?: Promise<{ status?: string }>
}) {
    const params = searchParams ? await searchParams : {}
    const activeTab = params.status || 'all'
    const supabase = createAdminClient()

    const { data: rawInvoices } = await supabase
        .from('invoices')
        .select(`
            *,
            customers (name, email),
            subscriptions (plan_id, quantity, plans(name))
        `)
        .order('created_at', { ascending: false })

    const now = new Date()

    const invoices = (rawInvoices || []).map((inv: any) => {
        const isOverdue =
            inv.status !== 'paid' &&
            inv.status !== 'cancelled' &&
            inv.due_date &&
            new Date(inv.due_date) < now

        let daysOverdue = 0
        if (isOverdue && inv.due_date) {
            const diffTime = Math.abs(now.getTime() - new Date(inv.due_date).getTime())
            daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        }

        const balanceDue = Number(inv.amount_due || 0) - Number(inv.amount_paid || 0)

        return {
            ...inv,
            isOverdue,
            daysOverdue,
            balanceDue,
        }
    })

    // Filter by tab
    const filteredInvoices = invoices.filter((inv) => {
        if (activeTab === 'all') return true
        if (activeTab === 'paid') return inv.status === 'paid'
        if (activeTab === 'pending') return inv.status === 'confirmed' || inv.status === 'sent' || inv.status === 'draft'
        if (activeTab === 'overdue') return inv.isOverdue
        if (activeTab === 'cancelled') return inv.status === 'cancelled'
        return true
    })

    // Metrics
    const totalInvoiced = invoices.reduce((acc, i) => acc + Number(i.amount_due || 0), 0)
    const totalPaid = invoices.reduce((acc, i) => acc + Number(i.amount_paid || 0), 0)
    const totalOverdue = invoices.filter((i) => i.isOverdue).length
    const totalOutstanding = invoices
        .filter((i) => i.status !== 'paid' && i.status !== 'cancelled')
        .reduce((acc, i) => acc + Math.max(0, i.balanceDue), 0)

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
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Invoice Management</h1>
                    <p className="text-muted-foreground">Track billing cycles, settlements, and overdue collections.</p>
                </div>
            </div>

            {/* Metrics Header */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-card rounded-lg border shadow-sm">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Total Invoiced</p>
                    <p className="text-2xl font-bold mt-1">{formatCurrency(totalInvoiced)}</p>
                </div>
                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                    <p className="text-xs font-medium text-emerald-800 uppercase flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Total Collected
                    </p>
                    <p className="text-2xl font-bold text-emerald-900 mt-1">{formatCurrency(totalPaid)}</p>
                </div>
                <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-lg">
                    <p className="text-xs font-medium text-amber-800 uppercase flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> Outstanding Balance
                    </p>
                    <p className="text-2xl font-bold text-amber-900 mt-1">{formatCurrency(totalOutstanding)}</p>
                </div>
                <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-lg">
                    <p className="text-xs font-medium text-rose-800 uppercase flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 text-rose-600" /> Overdue Invoices
                    </p>
                    <p className="text-2xl font-bold text-rose-900 mt-1">{totalOverdue}</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b pb-2">
                {[
                    { label: 'All Invoices', val: 'all', count: invoices.length },
                    { label: 'Pending / Confirmed', val: 'pending', count: invoices.filter(i => i.status === 'confirmed' || i.status === 'sent' || i.status === 'draft').length },
                    { label: 'Overdue', val: 'overdue', count: totalOverdue },
                    { label: 'Paid', val: 'paid', count: invoices.filter(i => i.status === 'paid').length },
                    { label: 'Cancelled', val: 'cancelled', count: invoices.filter(i => i.status === 'cancelled').length },
                ].map((tab) => (
                    <Link key={tab.val} href={`/admin/invoices?status=${tab.val}`}>
                        <Button
                            variant={activeTab === tab.val ? 'default' : 'ghost'}
                            size="sm"
                            className="text-xs rounded-full"
                        >
                            {tab.label} ({tab.count})
                        </Button>
                    </Link>
                ))}
            </div>

            <div className="rounded-md border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead>Invoice ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Balance Due</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[160px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredInvoices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-28 text-center text-muted-foreground">
                                    No invoices matching this filter.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredInvoices.map((inv: any) => (
                                <TableRow key={inv.id} className={inv.isOverdue ? 'bg-rose-50/20' : ''}>
                                    <TableCell className="font-mono text-xs text-muted-foreground uppercase font-medium">
                                        #{inv.id?.slice(0, 8) || 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-foreground">{inv.customers?.name || 'Unknown Customer'}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {inv.subscriptions?.plans?.name || 'Subscription Line'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {formatCurrency(Number(inv.amount_due || 0))}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {inv.balanceDue > 0 ? (
                                            <span className="text-amber-700 font-semibold">{formatCurrency(inv.balanceDue)}</span>
                                        ) : (
                                            <span className="text-emerald-700 font-semibold">Settled</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div>{formatDate(inv.due_date)}</div>
                                        {inv.isOverdue && (
                                            <div className="text-xs font-semibold text-rose-600 flex items-center gap-1 mt-0.5">
                                                <AlertCircle className="h-3 w-3" />
                                                {inv.daysOverdue}d overdue
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 items-start">
                                            <Badge
                                                variant="outline"
                                                className={
                                                    inv.status === 'paid'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : inv.status === 'confirmed'
                                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                        : inv.status === 'sent'
                                                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                        : inv.status === 'cancelled'
                                                        ? 'bg-slate-100 text-slate-500'
                                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                                }
                                            >
                                                {inv.status || 'draft'}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            {inv.status === 'draft' && (
                                                <form action={confirmInvoice.bind(null, inv.id)}>
                                                    <Button size="sm" variant="default" className="h-8 text-xs">Confirm</Button>
                                                </form>
                                            )}
                                            {(inv.status === 'confirmed' || inv.status === 'sent') && (
                                                <form action={markInvoicePaid.bind(null, inv.id)}>
                                                    <Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700">Mark Paid</Button>
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
                                                    <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" title="Cancel Invoice">
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                </form>
                                            )}
                                            <PrintInvoiceButton invoiceId={inv.id} />
                                        </div>
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
