import { createClient } from "@/utils/supabase/server"
import { getOrCreateCustomer } from "@/lib/customer-profile"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import {
    Receipt,
    CheckCircle2,
    Clock,
    AlertCircle,
    Eye,
    ArrowRight,
    Sparkles,
    ShieldCheck,
    ShoppingCart
} from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function CustomerInvoicesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect('/auth/login')

    const customer = await getOrCreateCustomer(supabase, user)
    const customerId = customer?.id

    let invoices: any[] = []

    if (customerId) {
        const { data } = await supabase
            .from('invoices')
            .select(`
                *,
                subscriptions (
                    id,
                    plans (name, interval)
                )
            `)
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false })

        invoices = data || []
    }

    // Calculations for KPI Cards
    const totalBilled = invoices.reduce((acc, inv) => acc + Number(inv.amount_due || 0), 0)
    const totalPaid = invoices.reduce((acc, inv) => acc + Number(inv.amount_paid || 0), 0)
    const pendingBalance = invoices
        .filter(i => i.status !== 'paid' && i.status !== 'cancelled')
        .reduce((acc, inv) => acc + Math.max(0, Number(inv.amount_due || 0) - Number(inv.amount_paid || 0)), 0)

    const hasPending = pendingBalance > 0

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
                        <Receipt className="h-7 w-7 text-primary" />
                        My Invoices
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        View itemized tax invoices, track payment status, and download records.
                    </p>
                </div>
                {hasPending && (
                    <Badge variant="outline" className="h-8 px-3 text-xs font-semibold bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1.5 self-start sm:self-auto">
                        <Clock className="h-3.5 w-3.5" />
                        Pending Balance: {formatCurrency(pendingBalance)}
                    </Badge>
                )}
            </div>

            {/* Metric KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="card-hover border-border shadow-2xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Total Invoiced
                        </CardTitle>
                        <Receipt className="h-4 w-4 text-brand-700" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold tracking-tight text-foreground">{formatCurrency(totalBilled)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Cumulative lifetime billings</p>
                    </CardContent>
                </Card>

                <Card className="card-hover border-brand-400/40 bg-brand-100/30 shadow-2xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-brand-900">
                            Total Settled
                        </CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-brand-700" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold tracking-tight text-brand-950">{formatCurrency(totalPaid)}</div>
                        <p className="text-xs text-brand-800/80 mt-1">Confirmed payments</p>
                    </CardContent>
                </Card>

                <Card className={`card-hover border-border shadow-2xs ${hasPending ? 'border-amber-300 bg-amber-50/40' : ''}`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Outstanding Due
                        </CardTitle>
                        <AlertCircle className={`h-4 w-4 ${hasPending ? 'text-amber-600' : 'text-muted-foreground'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold tracking-tight ${hasPending ? 'text-amber-800' : 'text-foreground'}`}>
                            {formatCurrency(pendingBalance)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {hasPending ? 'Requires payment settlement' : 'All invoices are up to date'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Invoices List / Empty State */}
            {invoices.length === 0 ? (
                <Card className="border-dashed border-2 py-12 px-6 text-center bg-card">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-800 ring-8 ring-brand-100/50 mb-4">
                        <Receipt className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">No Invoices Generated Yet</h3>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto mt-2 mb-6">
                        Once you activate a subscription, your itemized tax invoices, GST breakdowns, and payment receipts will be generated here automatically.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link href="/dashboard/subscriptions">
                            <Button className="gap-2 font-semibold shadow-xs bg-brand-700 hover:bg-brand-800 text-white">
                                <ShoppingCart className="h-4 w-4" />
                                Browse Subscriptions
                            </Button>
                        </Link>
                        <Link href="/dashboard/profile">
                            <Button variant="outline" className="gap-2 font-medium">
                                <ShieldCheck className="h-4 w-4" />
                                Verify Billing Profile
                            </Button>
                        </Link>
                    </div>
                </Card>
            ) : (
                <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/40 hover:bg-muted/40">
                                <TableHead className="font-semibold">Invoice #</TableHead>
                                <TableHead className="font-semibold">Plan Description</TableHead>
                                <TableHead className="font-semibold">Issued Date</TableHead>
                                <TableHead className="font-semibold">Due Date</TableHead>
                                <TableHead className="font-semibold">Amount</TableHead>
                                <TableHead className="font-semibold">Status</TableHead>
                                <TableHead className="text-right font-semibold">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.map((inv) => {
                                const isPaid = inv.status === 'paid'
                                const isCancelled = inv.status === 'cancelled'
                                const isOverdue = !isPaid && !isCancelled && inv.due_date && new Date(inv.due_date) < new Date()

                                return (
                                    <TableRow key={inv.id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-mono font-medium text-xs text-foreground">
                                            #{inv.id.slice(0, 8).toUpperCase()}
                                        </TableCell>
                                        <TableCell className="font-medium text-sm">
                                            {inv.subscriptions?.plans?.name || 'Recurring Service'}
                                            {inv.subscriptions?.plans?.interval && (
                                                <span className="text-xs text-muted-foreground block capitalize">
                                                    {inv.subscriptions?.plans?.interval} billing
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {new Date(inv.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {inv.due_date
                                                ? new Date(inv.due_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
                                                : '-'}
                                        </TableCell>
                                        <TableCell className="font-bold font-mono text-sm">
                                            {formatCurrency(inv.amount_due)}
                                        </TableCell>
                                        <TableCell>
                                            {isPaid ? (
                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 text-xs font-semibold">
                                                    <CheckCircle2 className="h-3 w-3" /> Paid
                                                </Badge>
                                            ) : isOverdue ? (
                                                <Badge variant="destructive" className="gap-1 text-xs font-semibold">
                                                    <AlertCircle className="h-3 w-3" /> Overdue
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 gap-1 text-xs font-semibold">
                                                    <Clock className="h-3 w-3" /> Pending
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/dashboard/invoices/${inv.id}`}>
                                                <Button variant="ghost" size="sm" className="gap-1.5 hover:text-primary font-medium">
                                                    <Eye className="h-4 w-4" />
                                                    View Details
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}
