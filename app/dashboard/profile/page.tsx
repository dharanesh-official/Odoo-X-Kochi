import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import ProfileForm from "./profile-form"
import { User, ShoppingCart, Receipt, Landmark } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

import { getOrCreateCustomer } from "@/lib/customer-profile"

export const dynamic = 'force-dynamic'

export default async function CustomerProfilePage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) {
        redirect('/auth/login')
    }

    const customer = await getOrCreateCustomer(supabase, user)

    if (!customer) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                No customer profile found for this account.
            </div>
        )
    }

    // Fetch basic stats
    const [subsRes, invoicesRes, paymentsRes] = await Promise.all([
        supabase.from('subscriptions').select('id, status').eq('customer_id', customer.id),
        supabase.from('invoices').select('id, amount_due, status').eq('customer_id', customer.id),
        supabase.from('payments').select('id, amount, status').eq('customer_id', customer.id)
    ])

    const activeSubs = subsRes.data?.filter(s => s.status === 'active' || s.status === 'trialing').length || 0
    const totalInvoiced = invoicesRes.data?.reduce((acc, inv) => acc + Number(inv.amount_due || 0), 0) || 0
    const totalPaid = paymentsRes.data?.filter(p => p.status === 'posted').reduce((acc, p) => acc + Number(p.amount || 0), 0) || 0

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <User className="h-7 w-7 text-primary" />
                    My Profile
                </h1>
                <p className="text-muted-foreground">
                    Manage your personal details, contact information, and view account activity.
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeSubs}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalInvoiced)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                        <Landmark className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">{formatCurrency(totalPaid)}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Profile Form Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Account Details</CardTitle>
                    <CardDescription>
                        Keep your contact details up to date for invoices and subscription notices.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ProfileForm customer={customer} />
                </CardContent>
            </Card>
        </div>
    )
}
