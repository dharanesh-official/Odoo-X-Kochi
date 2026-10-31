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
    Wallet,
    CheckCircle2,
    CreditCard,
    Receipt,
    Clock,
    Plus
} from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function CustomerPaymentsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect('/auth/login')

    const { createAdminClient } = await import('@/utils/supabase/admin')
    const adminSb = createAdminClient()

    const customer = await getOrCreateCustomer(adminSb, user)
    const customerId = customer?.id

    let payments: any[] = []

    if (customerId) {
        const { data } = await adminSb
            .from('payments')
            .select(`
                *,
                invoices (
                    id,
                    amount_due
                )
            `)
            .eq('customer_id', customerId)
            .order('payment_date', { ascending: false })

        payments = data || []
    }

    const totalSettled = payments
        .filter(p => p.status === 'posted')
        .reduce((acc, p) => acc + Number(p.amount || 0), 0)

    const lastPayment = payments[0]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
                        <Wallet className="h-7 w-7 text-primary" />
                        Payment History
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Review your successful settlements, transaction references, and payment receipts.
                    </p>
                </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="card-hover border-brand-400/40 bg-brand-100/30 shadow-2xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-brand-900">
                            Total Settled
                        </CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-brand-700" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold tracking-tight text-brand-950">{formatCurrency(totalSettled)}</div>
                        <p className="text-xs text-brand-800/80 mt-1">Confirmed payments completed</p>
                    </CardContent>
                </Card>

                <Card className="card-hover border-border shadow-2xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Transactions Count
                        </CardTitle>
                        <CreditCard className="h-4 w-4 text-brand-700" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold tracking-tight text-foreground">{payments.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total recorded receipts</p>
                    </CardContent>
                </Card>

                <Card className="card-hover border-border shadow-2xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Last Payment
                        </CardTitle>
                        <Clock className="h-4 w-4 text-brand-800" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-base font-bold tracking-tight text-foreground">
                            {lastPayment
                                ? new Date(lastPayment.payment_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
                                : 'No payments yet'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {lastPayment ? formatCurrency(lastPayment.amount) : 'Make your first subscription'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Payments Table / Empty State */}
            {payments.length === 0 ? (
                <Card className="border-dashed border-2 py-12 px-6 text-center bg-card">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-800 ring-8 ring-brand-100/50 mb-4">
                        <Wallet className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">No Payments Recorded Yet</h3>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto mt-2 mb-6">
                        When invoices are settled online via Razorpay, Stripe, or bank transfer, your transaction records will appear here automatically.
                    </p>
                    <div className="flex justify-center gap-3">
                        <Link href="/dashboard/invoices">
                            <Button variant="outline" className="gap-2 font-medium">
                                <Receipt className="h-4 w-4" />
                                View Invoices
                            </Button>
                        </Link>
                        <Link href="/pricing">
                            <Button className="gap-2 font-semibold shadow-xs bg-brand-700 hover:bg-brand-800 text-white">
                                <Plus className="h-4 w-4" />
                                Subscribe to a Plan
                            </Button>
                        </Link>
                    </div>
                </Card>
            ) : (
                <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/40 hover:bg-muted/40">
                                <TableHead className="font-semibold">Payment Date</TableHead>
                                <TableHead className="font-semibold">Transaction Ref</TableHead>
                                <TableHead className="font-semibold">Method</TableHead>
                                <TableHead className="font-semibold">Invoice Ref</TableHead>
                                <TableHead className="font-semibold">Amount</TableHead>
                                <TableHead className="text-right font-semibold">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.map((p) => (
                                <TableRow key={p.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="text-xs font-medium text-foreground">
                                        {new Date(p.payment_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        {p.transaction_id || p.id.slice(0, 12)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize text-xs font-medium bg-slate-50">
                                            {p.payment_method || 'Online'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {p.invoice_id ? (
                                            <Link href={`/dashboard/invoices/${p.invoice_id}`} className="font-mono text-xs text-primary hover:underline font-semibold">
                                                #{p.invoice_id.slice(0, 8).toUpperCase()}
                                            </Link>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-bold font-mono text-sm text-foreground">
                                        {formatCurrency(p.amount)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 text-xs font-semibold">
                                            <CheckCircle2 className="h-3 w-3" />
                                            {p.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}
