
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { logout } from "@/app/auth/actions"
import {
    Home,
    Package,
    ShoppingCart,
    Users,

    Settings,
    Wallet,
    LogOut,
    Zap,
    Briefcase,
    IndianRupee,
    FileText,
    Percent,
    Tag,
    BarChart3,
    Landmark,
    Receipt
} from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { NotificationButton } from "@/components/notification-button"

import { cn } from "@/lib/utils"

interface SidebarProps {
    role: 'admin' | 'customer'
    className?: string
}

export default async function Sidebar({ role, className }: SidebarProps) {
    const supabase = await createClient()
    let subCount = 0

    if (role === 'customer') {
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email) {
            const { data: customer } = await supabase.from('customers').select('id').eq('email', user.email).single()
            if (customer) {
                const { count } = await supabase
                    .from('subscriptions')
                    .select('*', { count: 'exact', head: true })
                    .eq('customer_id', customer.id)
                    .in('status', ['active', 'trialing', 'confirmed'])
                subCount = count || 0
            }
        }
    }

    return (
        <div className={cn("hidden border-r bg-muted/40 md:block w-[220px] lg:w-[280px]", className)}>
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <Zap className="h-6 w-6" />
                        <span className="">SubCheck</span>
                    </Link>
                    <NotificationButton />
                </div>
                <div className="flex-1">
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                        {role === 'admin' ? (
                            <>
                                <Link
                                    href="/admin/dashboard"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                                >
                                    <Home className="h-4 w-4" />
                                    Dashboard
                                </Link>
                                <Link
                                    href="/admin/subscriptions"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                                >
                                    <ShoppingCart className="h-4 w-4" />
                                    Subscriptions
                                </Link>
                                <Link
                                    href="/admin/products"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                                >
                                    <Package className="h-4 w-4" />
                                    Products
                                </Link>
                                <Link
                                    href="/admin/plans"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                                >
                                    <Briefcase className="h-4 w-4" />
                                    Plans
                                </Link>
                                <Link
                                    href="/admin/customers"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                                >
                                    <Users className="h-4 w-4" />
                                    Customers
                                </Link>
                                <Link
                                    href="/admin/payments"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                                >
                                    <IndianRupee className="h-4 w-4" />
                                    Payments
                                </Link>
                                <Link
                                    href="/admin/users"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                                >
                                    <Users className="h-4 w-4" />
                                    Internal Users
                                </Link>
                                <Link
                                    href="/admin/quotations"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                                >
                                    <FileText className="h-4 w-4" />
                                    Quotations
                                </Link>
                                <Link
                                    href="/admin/invoices"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                                >
                                    <Receipt className="h-4 w-4" />
                                    Invoices
                                </Link>
                                <Link
                                    href="/admin/taxes"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                                >
                                    <Percent className="h-4 w-4" />
                                    Taxes
                                </Link>
                                <Link
                                    href="/admin/discounts"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                                >
                                    <Tag className="h-4 w-4" />
                                    Discounts
                                </Link>
                                <Link
                                    href="/admin/reports"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                                >
                                    <BarChart3 className="h-4 w-4" />
                                    Reports
                                </Link>
                                <Link
                                    href="/admin/settings"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                                >
                                    <Settings className="h-4 w-4" />
                                    Settings
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                                >
                                    <Home className="h-4 w-4" />
                                    Overview
                                </Link>
                                <Link
                                    href="/dashboard/subscriptions"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                                >
                                    <ShoppingCart className="h-4 w-4" />
                                    My Subscriptions
                                    {subCount > 0 && (
                                        <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                                            {subCount}
                                        </Badge>
                                    )}
                                </Link>
                                <Link
                                    href="/dashboard/payments"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                                >
                                    <Landmark className="h-4 w-4" />
                                    Payments
                                </Link>
                                <Link
                                    href="/dashboard/invoices"
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                                >
                                    <Wallet className="h-4 w-4" />
                                    Invoices
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
                <div className="mt-auto p-4 border-t">
                    <form action={logout}>
                        <Button variant="secondary" className="w-full justify-start gap-2">
                            <LogOut className="h-4 w-4" /> Logout
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
