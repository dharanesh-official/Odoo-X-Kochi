
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IndianRupee, Users, CreditCard, Activity } from "lucide-react"
import { createClient } from '@/utils/supabase/server'
export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
    const supabase = await createClient()

    // Fetch Revenue (Total of paid invoices)
    const { data: revenueData } = await supabase.from('invoices').select('amount_paid').eq('status', 'paid')
    const totalRevenue = revenueData?.reduce((acc, inv) => acc + Number(inv.amount_paid), 0) || 0

    // Fetch Subscription counts
    const { count: subscriptionCount } = await supabase.from('subscriptions').select('*', { count: 'exact', head: true })

    // Fetch Active Plans count
    const { count: activePlansCount } = await supabase.from('plans').select('*', { count: 'exact', head: true }).eq('active', true)

    // Fetch Recent Invoices
    const { data: recentInvoices } = await supabase
        .from('invoices')
        .select(`
            id,
            amount_due,
            status,
            customers (name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center gap-4">
                <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Real-time settlement data</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{subscriptionCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Active subscriptions across all plans</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activePlansCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Plans currently available for sale</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sales Records</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{revenueData?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">Total successful invoice payments</p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            Latest invoices and customer actions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentInvoices?.map((inv: any) => (
                                <div key={inv.id} className="flex items-center justify-between border-b pb-2">
                                    <div>
                                        <p className="text-sm font-medium">{inv.customers?.name}</p>
                                        <p className="text-xs text-muted-foreground">{inv.customers?.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-semibold">₹{Number(inv.amount_due).toLocaleString()}</div>
                                        <div className={`text-[10px] uppercase font-bold ${inv.status === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                                            {inv.status}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!recentInvoices || recentInvoices.length === 0) && (
                                <p className="text-center text-muted-foreground py-8">No recent activity found.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>System Performance</CardTitle>
                        <CardDescription>
                            Quick summary of operations.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Subscription Growth</span>
                                    <span className="font-medium">Stable</span>
                                </div>
                                <div className="h-2 w-full bg-secondary rounded-full">
                                    <div className="h-2 bg-primary rounded-full" style={{ width: '65%' }}></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Payment Success Rate</span>
                                    <span className="font-medium">98%</span>
                                </div>
                                <div className="h-2 w-full bg-secondary rounded-full">
                                    <div className="h-2 bg-green-500 rounded-full" style={{ width: '98%' }}></div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
