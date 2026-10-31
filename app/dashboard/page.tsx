
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"


export const dynamic = 'force-dynamic'

export default async function CustomerDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>Please log in</div>

    // Find customer profile linked to this user
    const { data: customer } = await supabase.from('customers').select('id, name').eq('email', user.email || '').single()

    let subscription = null
    let invoices: any[] = []

    if (customer) {
        // Find active subscription
        const { data: sub } = await supabase.from('subscriptions')
            .select(`
            *,
            plans (name, amount, interval, products(name))
        `)
            .eq('customer_id', customer.id)
            .in('status', ['active', 'trialing'])
            .maybeSingle()

        subscription = sub

        // Find invoices
        const { data: invs } = await supabase.from('invoices')
            .select('*')
            .eq('customer_id', customer.id)
            .order('created_at', { ascending: false })
            .limit(5)

        invoices = invs || []
    }

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center gap-4">
                <h1 className="text-lg font-semibold md:text-2xl">Overview</h1>
                <p className="text-muted-foreground text-sm flex items-center mt-1">Hello, {user.user_metadata?.full_name || user.email}</p>
            </div>

            {!customer ? (
                <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                        <CardTitle className="text-blue-700">Welcome to SubCheck!</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-blue-800">Complete your profile setup by subscribing to a plan.</p>
                        <a href="/pricing">
                            <Button className="w-full sm:w-auto">View Plans & Subscribe</Button>
                        </a>
                    </CardContent>
                </Card>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Current Subscription</CardTitle>
                        <CardDescription>
                            Your billing status.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {subscription ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Product</p>
                                    <p className="font-medium mt-1">{subscription.plans?.products?.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Plan</p>
                                    <p className="font-medium mt-1">{subscription.plans?.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Renewal</p>
                                    <p className="font-medium mt-1">{new Date(subscription.current_period_end).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Amount</p>
                                    <p className="font-medium mt-1">₹{subscription.plans?.amount} / {subscription.plans?.interval}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                                <p>No active subscription found.</p>
                                <a href="/pricing">
                                    <Button size="lg" className="mt-2">Subscribe Now</Button>
                                </a>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-2">
                        <Link href="/pricing" className="w-full">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700">Browse Plans</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Invoices</CardTitle>
                    <CardDescription>
                        Your latest billing history.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {invoices.length === 0 ? (
                        <div className="text-sm text-muted-foreground py-8 text-center">
                            No invoices found.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {invoices.map((inv: any) => (
                                <div key={inv.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-medium">Invoice #{inv.id.slice(0, 8)}</p>
                                        <span className="text-xs text-muted-foreground">{new Date(inv.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="font-mono text-sm">₹{Number(inv.amount_due).toFixed(2)}</p>
                                        <Badge variant={inv.status === 'paid' ? 'outline' : 'destructive'} className={inv.status === 'paid' ? 'text-green-600 border-green-600' : ''}>
                                            {inv.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div >
    )
}
