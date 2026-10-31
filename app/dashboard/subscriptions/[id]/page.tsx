import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, Clock, XCircle } from "lucide-react"

export default async function SubscriptionDetailsPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return <div>Please log in</div>

    // Get customer first for security check
    const { data: customer } = await supabase.from('customers').select('id').eq('email', user.email || '').single()
    if (!customer) return <div>Access Denied</div>

    const { data: subscription } = await supabase
        .from('subscriptions')
        .select(`
            *,
            plans (*, products(*)),
            invoices (*)
        `)
        .eq('id', id)
        .eq('customer_id', customer.id)
        .single()

    if (!subscription) {
        notFound()
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/subscriptions">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold tracking-tight">Subscription Details</h1>
                    <p className="text-muted-foreground text-sm">ID: {subscription.id}</p>
                </div>
                <div className="ml-auto">
                    <Badge variant={
                        subscription.status === 'active' ? 'default' : 'secondary'
                    } className="text-base px-4 py-1 capitalize">
                        {subscription.status}
                    </Badge>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Plan Info */}
                <div className="rounded-xl border bg-card text-card-foreground shadow max-w-2xl">
                    <div className="flex flex-col space-y-1.5 p-6 border-b">
                        <h3 className="font-semibold leading-none tracking-tight">Plan Information</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Product</p>
                                <p className="text-lg font-medium">{subscription.plans?.products?.name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Plan Name</p>
                                <p className="text-lg font-medium">{subscription.plans?.name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Price</p>
                                <p className="text-lg font-medium">₹{subscription.plans?.amount} / {subscription.plans?.interval}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                                <p className="text-lg font-medium">{new Date(subscription.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Timeline / Actions */}
                <div className="rounded-xl border bg-card text-card-foreground shadow max-w-2xl">
                    <div className="flex flex-col space-y-1.5 p-6 border-b">
                        <h3 className="font-semibold leading-none tracking-tight">Subscription Status</h3>
                    </div>
                    <div className="p-6">
                        <div className="border-l-2 border-muted ml-3 space-y-8 pl-6 relative">
                            {/* Mock Timeline */}
                            <div className="relative">
                                <div className={`absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 ${subscription.status === 'active' ? 'bg-green-500 border-green-500' : 'bg-muted border-muted-foreground'}`} />
                                <h4 className="font-medium">Active</h4>
                                <p className="text-sm text-muted-foreground">
                                    {subscription.status === 'active'
                                        ? "Your subscription is active and running."
                                        : "Subscription is not active yet."}
                                </p>
                            </div>
                            <div className="relative">
                                <div className={`absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 ${['trialing', 'active'].includes(subscription.status) ? 'bg-blue-500 border-blue-500' : 'bg-muted border-muted-foreground'}`} />
                                <h4 className="font-medium">Trial Started</h4>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(subscription.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 border-t pt-4">
                            <h4 className="text-sm font-medium mb-2">Actions</h4>
                            <div className="flex flex-col gap-2">
                                {subscription.status === 'active' || subscription.status === 'trialing' ? (
                                    <Button variant="destructive" className="w-full sm:w-auto">Cancel Subscription</Button>
                                ) : (
                                    <Link href={`/dashboard/checkout?plan=${subscription.plan_id}`}>
                                        <Button className="w-full sm:w-auto">Renew / Pay Now</Button>
                                    </Link>
                                )}

                                {(subscription.status === 'trialing' || subscription.plans?.name.toLowerCase().includes('trial')) && (
                                    <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-dashed">
                                        <div className="flex items-center gap-2 text-yellow-600">
                                            <Clock className="h-4 w-4" />
                                            <p className="text-sm font-medium">Enjoying the trial? Upgrade now!</p>
                                        </div>
                                        <Link href="/pricing?upgrade=true">
                                            <Button className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0">
                                                Upgrade to Pro Plan 🚀
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invoices List */}
            <div className="rounded-xl border bg-card text-card-foreground shadow">
                <div className="flex flex-col space-y-1.5 p-6 border-b">
                    <h3 className="font-semibold leading-none tracking-tight">Billing History</h3>
                </div>
                <div className="p-0">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                            <tr>
                                <th className="px-6 py-3">Invoice ID</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Amount</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {subscription.invoices && subscription.invoices.length > 0 ? (
                                subscription.invoices.map((inv: any) => (
                                    <tr key={inv.id}>
                                        <td className="px-6 py-4 font-mono">{inv.id.slice(0, 8)}</td>
                                        <td className="px-6 py-4">{new Date(inv.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">₹{inv.amount_due}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant={inv.status === 'paid' ? 'outline' : 'destructive'} className={inv.status === 'paid' ? 'text-green-600 border-green-600' : ''}>
                                                {inv.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No invoices generated for this subscription.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    )
}
