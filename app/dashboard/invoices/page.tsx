
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
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MousePointerClick, Eye, Printer } from "lucide-react"

export default async function CustomerInvoicesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>Please log in</div>

    const { data: customer } = await supabase.from('customers').select('id').eq('email', user.email || '').single()

    if (!customer) return <div>No invoicing profile found.</div>

    const { data: invoices } = await supabase
        .from('invoices')
        .select(`
      *,
      subscriptions (plans(name))
    `)
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false })

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">My Invoices</h1>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invoice #</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Issued</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No invoices found.
                                </TableCell>
                            </TableRow>
                        ) : (invoices?.map((inv: any) => (
                            <TableRow key={inv.id}>
                                <TableCell className="font-mono text-xs text-muted-foreground uppercase">{inv.id.slice(0, 8)}</TableCell>
                                <TableCell>
                                    {inv.subscriptions?.plans?.name || 'Manual Charge'}
                                </TableCell>
                                <TableCell className="font-medium">${Number(inv.amount_due).toFixed(2)}</TableCell>
                                <TableCell>{new Date(inv.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        inv.status === 'paid' ? 'default' :
                                            inv.status === 'confirmed' ? 'default' :
                                                inv.status === 'overdue' ? 'destructive' :
                                                    'secondary'
                                    } className={
                                        inv.status === 'paid' ? 'bg-green-600 hover:bg-green-700' :
                                            inv.status === 'confirmed' ? 'bg-blue-600 hover:bg-blue-700' :
                                                ''
                                    }>
                                        {inv.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2 justify-end">
                                        <Link href={`/dashboard/invoices/${inv.id}`} title="View Details">
                                            <Button variant="ghost" size="icon">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Link href={`/dashboard/invoices/${inv.id}`} title="Print Invoice">
                                            <Button variant="ghost" size="icon">
                                                <Printer className="h-4 w-4" />
                                            </Button>
                                        </Link>
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
