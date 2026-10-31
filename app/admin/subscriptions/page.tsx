
import { createClient } from "@/utils/supabase/server"
export const dynamic = 'force-dynamic'
import { revalidatePath } from "next/cache"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { updateSubscriptionStatus } from "./actions"

export default async function SubscriptionsPage() {
    const supabase = await createClient()

    const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select(`
      *,
      customers (name, email),
      plans (name, amount, interval, products(name))
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

    // Helper to safely calculate total
    const calculateTotal = (sub: any) => {
        const amount = Number(sub.plans?.amount || 0)
        const qty = Number(sub.quantity || 1)
        if (isNaN(amount) || isNaN(qty)) return 0
        return amount * qty
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Subscriptions</h1>
                <Link href="/admin/subscriptions/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Create Subscription
                    </Button>
                </Link>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Plan Details</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Billing Cycle</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!subscriptions || subscriptions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No subscriptions found. Create a quotation first.
                                </TableCell>
                            </TableRow>
                        ) : (subscriptions.map((sub: any) => (
                            <TableRow key={sub.id}>
                                <TableCell>
                                    <div className="font-medium">{sub.customers?.name || 'Unknown Helper'}</div>
                                    <div className="text-sm text-muted-foreground">{sub.customers?.email}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">{sub.plans?.products?.name || 'Unknown Product'}</div>
                                    <div className="text-sm text-muted-foreground">{sub.plans?.name || 'Unknown Plan'}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={
                                        sub.status === 'active' ? 'default' :
                                            sub.status === 'confirmed' ? 'default' :
                                                sub.status === 'closed' ? 'secondary' :
                                                    'outline'
                                    } className={
                                        sub.status === 'active' ? 'bg-green-600 hover:bg-green-700' :
                                            sub.status === 'confirmed' ? 'bg-blue-600 hover:bg-blue-700' :
                                                sub.status === 'closed' ? 'bg-gray-600 text-white hover:bg-gray-700' :
                                                    ''
                                    }>
                                        {sub.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm">
                                        {formatDate(sub.current_period_start)} - <br />
                                        {formatDate(sub.current_period_end)}
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">
                                    {formatCurrency(calculateTotal(sub))}
                                    <span className="text-xs text-muted-foreground block"> / {sub.plans?.interval || 'period'}</span>
                                    {(sub.quantity > 1) && (
                                        <span className="text-xs text-muted-foreground block">
                                            ({sub.quantity} x {formatCurrency(Number(sub.plans?.amount || 0))})
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        {sub.status === 'draft' && (
                                            <form action={updateSubscriptionStatus.bind(null, sub.id, 'quotation')}>
                                                <Button size="sm" variant="outline">Convert to Quotation</Button>
                                            </form>
                                        )}
                                        {sub.status === 'quotation' && (
                                            <form action={updateSubscriptionStatus.bind(null, sub.id, 'confirmed')}>
                                                <Button size="sm" variant="default">Confirm</Button>
                                            </form>
                                        )}
                                        {sub.status === 'confirmed' && (
                                            <form action={updateSubscriptionStatus.bind(null, sub.id, 'active')}>
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700">Activate</Button>
                                            </form>
                                        )}
                                        {sub.status === 'active' && (
                                            <form action={updateSubscriptionStatus.bind(null, sub.id, 'closed')}>
                                                <Button size="sm" variant="destructive">Close</Button>
                                            </form>
                                        )}
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
