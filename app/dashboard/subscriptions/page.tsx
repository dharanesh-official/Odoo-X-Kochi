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
    ShoppingCart,
    Calendar,
    Zap,
    ExternalLink,
    CheckCircle2,
    Clock,
    XCircle,
    Plus
} from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function MySubscriptionsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect('/auth/login')

    const customer = await getOrCreateCustomer(supabase, user)
    const customerId = customer?.id

    let subscriptions: any[] = []

    if (customerId) {
        const { data } = await supabase
            .from('subscriptions')
            .select(`
                *,
                plans (
                    name,
                    amount,
                    interval,
                    products (name)
                )
            `)
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false })

        subscriptions = data || []
    }

    const activeCount = subscriptions.filter(s => s.status === 'active' || s.status === 'trialing').length
    const monthlyCommitment = subscriptions
        .filter(s => s.status === 'active' || s.status === 'trialing')
        .reduce((acc, s) => {
            const amount = Number(s.plans?.amount || 0)
            const qty = Number(s.quantity || 1)
            return acc + amount * qty
        }, 0)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
                        <ShoppingCart className="h-7 w-7 text-primary" />
                        My Subscriptions
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Manage your active subscription plans, renewal dates, and billing periods.
                    </p>
                </div>
                <Link href="/pricing">
                    <Button className="gap-2 shadow-xs font-semibold self-start sm:self-auto">
                        <Plus className="h-4 w-4" />
                        Subscribe to Plan
                    </Button>
                </Link>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="card-hover border-slate-200/80 shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Active Services
                        </CardTitle>
                        <Zap className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold tracking-tight text-foreground">{activeCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">Active subscriptions running</p>
                    </CardContent>
                </Card>

                <Card className="card-hover border-slate-200/80 shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Recurring Commitment
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold tracking-tight text-foreground">{formatCurrency(monthlyCommitment)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Current recurring cycle value</p>
                    </CardContent>
                </Card>

                <Card className="card-hover border-slate-200/80 shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Account Tier
                        </CardTitle>
                        <Badge variant="secondary" className="font-semibold text-xs capitalize bg-primary/10 text-primary">
                            {activeCount > 0 ? 'Subscriber' : 'Standard'}
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold tracking-tight text-foreground">
                            {activeCount > 0 ? 'Active Member' : 'No Active Plan'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {activeCount > 0 ? 'All subscriber benefits unlocked' : 'Subscribe to unlock all features'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Subscriptions Table / Empty State */}
            {subscriptions.length === 0 ? (
                <Card className="border-dashed border-2 py-12 px-6 text-center bg-card/50">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-8 ring-blue-50/50 mb-4">
                        <ShoppingCart className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">No Subscriptions Found</h3>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto mt-2 mb-6">
                        You do not have any active subscriptions yet. Explore our curated pricing plans and get started in seconds.
                    </p>
                    <Link href="/pricing">
                        <Button className="gap-2 font-medium shadow-sm">
                            <Plus className="h-4 w-4" />
                            Explore Pricing Plans
                        </Button>
                    </Link>
                </Card>
            ) : (
                <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/40 hover:bg-muted/40">
                                <TableHead className="font-semibold">Subscription #</TableHead>
                                <TableHead className="font-semibold">Product & Plan</TableHead>
                                <TableHead className="font-semibold">Billing Frequency</TableHead>
                                <TableHead className="font-semibold">Rate</TableHead>
                                <TableHead className="font-semibold">Status</TableHead>
                                <TableHead className="font-semibold">Current Period End</TableHead>
                                <TableHead className="text-right font-semibold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {subscriptions.map((sub) => {
                                const isActive = sub.status === 'active'
                                const isTrial = sub.status === 'trialing'
                                const isCancelled = sub.status === 'cancelled' || sub.status === 'closed'

                                return (
                                    <TableRow key={sub.id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-mono font-medium text-xs text-foreground">
                                            #{sub.id.slice(0, 8).toUpperCase()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-semibold text-sm text-foreground">
                                                {sub.plans?.products?.name || sub.plans?.name || 'Subscription'}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {sub.plans?.name} (x{sub.quantity || 1})
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs font-medium capitalize text-muted-foreground">
                                            {sub.plans?.interval || 'Monthly'}
                                        </TableCell>
                                        <TableCell className="font-bold font-mono text-sm">
                                            {formatCurrency(Number(sub.plans?.amount || 0) * Number(sub.quantity || 1))}
                                        </TableCell>
                                        <TableCell>
                                            {isActive ? (
                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 text-xs font-semibold">
                                                    <CheckCircle2 className="h-3 w-3" /> Active
                                                </Badge>
                                            ) : isTrial ? (
                                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 text-xs font-semibold">
                                                    <Clock className="h-3 w-3" /> Trial
                                                </Badge>
                                            ) : isCancelled ? (
                                                <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 gap-1 text-xs font-semibold">
                                                    <XCircle className="h-3 w-3" /> Cancelled
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="capitalize text-xs font-semibold">
                                                    {sub.status}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {sub.current_period_end
                                                ? new Date(sub.current_period_end).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
                                                : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/dashboard/subscriptions/${sub.id}`}>
                                                <Button variant="ghost" size="sm" className="gap-1.5 hover:text-primary font-medium">
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                    Manage
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
