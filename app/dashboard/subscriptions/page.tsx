import { createClient } from "@/utils/supabase/server"
export const dynamic = 'force-dynamic'
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

export default async function MySubscriptionsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>Please log in</div>

    const { data: customer } = await supabase.from('customers').select('id').eq('email', user.email || '').single()

    if (!customer) return (
        <div className="flex items-center justify-center h-full p-8 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
            No customer profile found. Contact support.
        </div>
    )

    const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select(`
            *,
            plans (name, amount, interval)
        `)
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false })

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">My Subscriptions</h1>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Subscription #</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Next Billing</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!subscriptions || subscriptions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No subscriptions found.
                                </TableCell>
                            </TableRow>
                        ) : (subscriptions.map((sub: any) => (
                            <TableRow key={sub.id}>
                                <TableCell className="font-mono text-xs text-muted-foreground uppercase">{sub.id.slice(0, 8)}</TableCell>
                                <TableCell className="font-medium">
                                    {sub.plans?.name}
                                </TableCell>
                                <TableCell>${sub.plans?.amount} / {sub.plans?.interval}</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        sub.status === 'active' ? 'default' :
                                            sub.status === 'confirmed' ? 'default' :
                                                sub.status === 'draft' || sub.status === 'quotation' ? 'outline' :
                                                    'secondary'
                                    } className={
                                        sub.status === 'active' ? 'bg-green-600 hover:bg-green-700' :
                                            sub.status === 'confirmed' ? 'bg-blue-600 hover:bg-blue-700' :
                                                ''
                                    }>
                                        {sub.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : '-'}
                                </TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="sm" asChild>
                                        <a href={`/dashboard/subscriptions/${sub.id}`}>View</a>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
