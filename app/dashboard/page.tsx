import { createClient } from "@/utils/supabase/server"
import { getOrCreateCustomer } from "@/lib/customer-profile"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import {
    ShoppingCart,
    Receipt,
    Wallet,
    Calendar,
    Sparkles,
    ArrowRight,
    CheckCircle2,
    Clock,
    AlertCircle,
    User,
    ExternalLink
} from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function CustomerDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div className="p-8 text-center text-muted-foreground">Please log in to access the dashboard.</div>

    const customer = await getOrCreateCustomer(supabase, user)
    const customerId = customer?.id
    const fullName = user.user_metadata?.full_name || customer?.name || user.email?.split('@')[0] || 'Member'

    let subscription: any = null
    let invoices: any[] = []
    let payments: any[] = []

    if (customerId) {
        const [subRes, invsRes, payRes] = await Promise.all([
            supabase
                .from('subscriptions')
                .select(`
                    *,
                    plans (name, amount, interval, products(name))
                `)
                .eq('customer_id', customerId)
                .in('status', ['active', 'trialing'])
                .order('created_at', { ascending: false })
                .maybeSingle(),
            supabase
                .from('invoices')
                .select('*')
                .eq('customer_id', customerId)
                .order('created_at', { ascending: false })
                .limit(5),
            supabase
                .from('payments')
                .select('*')
                .eq('customer_id', customerId)
        ])

        subscription = subRes.data
        invoices = invsRes.data || []
        payments = payRes.data || []
    }

    const totalSettled = payments
        .filter(p => p.status === 'posted')
        .reduce((acc, p) => acc + Number(p.amount || 0), 0)

    const pendingBalance = invoices
        .filter(i => i.status !== 'paid' && i.status !== 'cancelled')
        .reduce((acc, inv) => acc + Math.max(0, Number(inv.amount_due || 0) - Number(inv.amount_paid || 0)), 0)

    return (
        <div className="space-y-6">
            {/* Hero Welcome Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-md">
                <div className="relative z-10 max-w-2xl">
                    <Badge variant="secondary" className="mb-3 bg-white/10 text-white border-white/20 hover:bg-white/20 gap-1.5 px-3 py-1 text-xs">
                        <Sparkles className="h-3.5 w-3.5 text-blue-300" />
                        Customer Self-Service Hub
                    </Badge>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        Welcome back, {fullName}! 👋
                    </h1>
                    <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
                        Here is the live operational overview of your active subscriptions, billing renewals, and settled payments.
                    </p>
                </div>
                {/* Decorative background glow */}
                <div className="absolute right-0 top-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
                <div className="absolute right-32 bottom-0 -mb-12 h-48 w-48 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />
            </div>

            {/* Quick KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="card-hover border-slate-200/80 shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Subscription
                        </CardTitle>
                        <ShoppingCart className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold tracking-tight text-foreground truncate">
                            {subscription ? subscription.plans?.name : 'No Active Plan'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 capitalize">
                            {subscription ? `${subscription.status} status` : 'Subscribe to activate'}
                        </p>
                    </CardContent>
                </Card>

                <Card className="card-hover border-slate-200/80 shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Next Billing
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold tracking-tight text-foreground">
                            {subscription?.current_period_end
                                ? new Date(subscription.current_period_end).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
                                : '-'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 capitalize">
                            {subscription ? `${subscription.plans?.interval || 'monthly'} renewal` : 'Cycle inactive'}
                        </p>
                    </CardContent>
                </Card>

                <Card className="card-hover border-emerald-100 bg-emerald-50/20 shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                            Total Settled
                        </CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold tracking-tight text-emerald-900">{formatCurrency(totalSettled)}</div>
                        <p className="text-xs text-emerald-700/80 mt-1">Confirmed payments</p>
                    </CardContent>
                </Card>

                <Card className={`card-hover border-slate-200/80 shadow-xs ${pendingBalance > 0 ? 'border-amber-200 bg-amber-50/20' : ''}`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Pending Due
                        </CardTitle>
                        <AlertCircle className={`h-4 w-4 ${pendingBalance > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-xl font-bold tracking-tight ${pendingBalance > 0 ? 'text-amber-700' : 'text-foreground'}`}>
                            {formatCurrency(pendingBalance)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {pendingBalance > 0 ? 'Awaiting settlement' : 'Account current'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Interactive Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Active Subscription Spotlight */}
                <Card className="md:col-span-2 shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Subscription Details</CardTitle>
                            <CardDescription>Your current operational plan and billing terms.</CardDescription>
                        </div>
                        {subscription && (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Active
                            </Badge>
                        )}
                    </CardHeader>
                    <CardContent>
                        {subscription ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-muted/30 border border-slate-100">
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase font-semibold">Product</p>
                                        <p className="font-bold text-sm text-foreground mt-1">{subscription.plans?.products?.name || 'Service'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase font-semibold">Plan Name</p>
                                        <p className="font-bold text-sm text-foreground mt-1">{subscription.plans?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase font-semibold">Renewal Date</p>
                                        <p className="font-bold text-sm text-foreground mt-1">
                                            {new Date(subscription.current_period_end).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase font-semibold">Amount</p>
                                        <p className="font-bold font-mono text-sm text-foreground mt-1">
                                            {formatCurrency(Number(subscription.plans?.amount || 0) * Number(subscription.quantity || 1))} / {subscription.plans?.interval}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <Link href={`/dashboard/subscriptions/${subscription.id}`}>
                                        <Button variant="default" size="sm" className="gap-2 shadow-xs">
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            Manage Subscription
                                        </Button>
                                    </Link>
                                    <Link href="/pricing">
                                        <Button variant="outline" size="sm" className="gap-2">
                                            Upgrade or Switch Tier
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 px-4 text-center border border-dashed rounded-xl bg-slate-50/50">
                                <ShoppingCart className="h-10 w-10 text-muted-foreground/50 mb-3" />
                                <h4 className="font-bold text-base text-foreground">No Active Subscription</h4>
                                <p className="text-muted-foreground text-xs max-w-sm mt-1 mb-4">
                                    Subscribe to one of our premium software plans to start tracking invoices, managing members, and automating billing.
                                </p>
                                <Link href="/pricing">
                                    <Button size="sm" className="gap-2 shadow-sm font-semibold">
                                        <Sparkles className="h-4 w-4" />
                                        Explore Subscription Plans
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions Card */}
                <Card className="shadow-xs">
                    <CardHeader>
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                        <CardDescription>Shortcut to key self-service features.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2.5">
                        <Link href="/dashboard/invoices" className="block">
                            <Button variant="outline" className="w-full justify-between font-medium group hover:bg-muted/80">
                                <span className="flex items-center gap-2">
                                    <Receipt className="h-4 w-4 text-blue-600" />
                                    View All Invoices
                                </span>
                                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                        <Link href="/dashboard/payments" className="block">
                            <Button variant="outline" className="w-full justify-between font-medium group hover:bg-muted/80">
                                <span className="flex items-center gap-2">
                                    <Wallet className="h-4 w-4 text-emerald-600" />
                                    Payment Receipts
                                </span>
                                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                        <Link href="/dashboard/profile" className="block">
                            <Button variant="outline" className="w-full justify-between font-medium group hover:bg-muted/80">
                                <span className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-indigo-600" />
                                    Billing & Profile Info
                                </span>
                                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                        <Link href="/pricing" className="block pt-2 border-t">
                            <Button className="w-full justify-between font-semibold shadow-xs">
                                <span className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" />
                                    Browse Product Catalog
                                </span>
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Invoices Card */}
            <Card className="shadow-xs overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">Recent Invoices</CardTitle>
                        <CardDescription>Your latest billing and tax documentation.</CardDescription>
                    </div>
                    <Link href="/dashboard/invoices">
                        <Button variant="ghost" size="sm" className="gap-1.5 text-xs font-semibold text-primary">
                            View All <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    {invoices.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground border border-dashed rounded-lg">
                            No billing records generated yet.
                        </div>
                    ) : (
                        <div className="divide-y border rounded-lg overflow-hidden">
                            {invoices.map((inv) => (
                                <div key={inv.id} className="flex items-center justify-between p-3.5 hover:bg-muted/30 transition-colors">
                                    <div>
                                        <Link href={`/dashboard/invoices/${inv.id}`} className="font-mono text-xs font-bold text-primary hover:underline">
                                            #{inv.id.slice(0, 8).toUpperCase()}
                                        </Link>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {new Date(inv.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono font-bold text-sm text-foreground">
                                            {formatCurrency(inv.amount_due)}
                                        </span>
                                        <Badge
                                            variant={inv.status === 'paid' ? 'outline' : 'secondary'}
                                            className={inv.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-xs' : 'bg-amber-50 text-amber-700 border-amber-200 text-xs'}
                                        >
                                            {inv.status}
                                        </Badge>
                                        <Link href={`/dashboard/invoices/${inv.id}`}>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
