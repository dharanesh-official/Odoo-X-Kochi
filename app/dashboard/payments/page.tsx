
import { createClient } from "@/utils/supabase/server"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Calendar, Landmark } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function CustomerPaymentsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>Please log in</div>

    const { data: customer } = await supabase.from('customers').select('id, name').eq('email', user.email || '').single()

    let payments: any[] = []

    if (customer) {
        const { data } = await supabase.from('payments')
            .select(`
            *,
            invoices (invoice_number)
        `)
            .eq('customer_id', customer.id)
            .order('payment_date', { ascending: false })

        payments = data || []
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Reference</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!payments || payments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No payment history found.
                                </TableCell>
                            </TableRow>
                        ) : (payments.map((p: any) => (
                            <TableRow key={p.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        {new Date(p.payment_date).toLocaleDateString()}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {p.transaction_id || '-'}
                                </TableCell>
                                <TableCell className="capitalize">
                                    <div className="flex items-center gap-2">
                                        <Landmark className="h-4 w-4 text-muted-foreground" />
                                        {p.payment_method?.replace(/_/g, ' ')}
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">
                                    {formatCurrency(p.amount)}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                        {p.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        )))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
