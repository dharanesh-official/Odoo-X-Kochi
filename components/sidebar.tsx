import Link from "next/link"
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
    Receipt,
    ShieldCheck,
    User
} from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { cn } from "@/lib/utils"
import { SidebarItem } from "./sidebar-item"

interface SidebarProps {
    role: 'admin' | 'customer'
    className?: string
}

export default async function Sidebar({ role, className }: SidebarProps) {
    const supabase = await createClient()
    let subCount = 0
    let userEmail: string | null = null
    let userName: string | null = null

    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email) {
        userEmail = user.email
        userName = user.user_metadata?.full_name || user.email.split('@')[0]
        if (role === 'customer') {
            const { data: customer } = await supabase.from('customers').select('id').eq('email', user.email).maybeSingle()
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
        <aside className={cn("hidden border-r bg-card/60 backdrop-blur-xs md:flex md:flex-col w-[230px] lg:w-[260px]", className)}>
            <div className="flex h-full max-h-screen flex-col gap-2">
                {/* Brand Header */}
                <div className="flex h-16 items-center border-b px-5 lg:px-6">
                    <Link href="/" className="flex items-center gap-2.5 font-bold text-base tracking-tight group">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
                            <Zap className="h-4 w-4 fill-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-extrabold text-foreground tracking-tight leading-none">SubCheck</span>
                            <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mt-0.5">
                                {role === 'admin' ? 'Admin Portal' : 'Customer Hub'}
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto px-3 py-3">
                    <nav className="space-y-4">
                        {role === 'admin' ? (
                            <>
                                <div>
                                    <div className="px-3 pb-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
                                        Core Operations
                                    </div>
                                    <div className="space-y-1">
                                        <SidebarItem href="/admin/dashboard" icon={Home} title="Dashboard" />
                                        <SidebarItem href="/admin/subscriptions" icon={ShoppingCart} title="Subscriptions" />
                                        <SidebarItem href="/admin/invoices" icon={Receipt} title="Invoices" />
                                        <SidebarItem href="/admin/payments" icon={IndianRupee} title="Payments" />
                                        <SidebarItem href="/admin/quotations" icon={FileText} title="Quotations" />
                                    </div>
                                </div>

                                <div>
                                    <div className="px-3 pb-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
                                        Catalog & Pricing
                                    </div>
                                    <div className="space-y-1">
                                        <SidebarItem href="/admin/products" icon={Package} title="Products" />
                                        <SidebarItem href="/admin/plans" icon={Briefcase} title="Plans" />
                                        <SidebarItem href="/admin/discounts" icon={Tag} title="Discounts" />
                                        <SidebarItem href="/admin/taxes" icon={Percent} title="Taxes" />
                                    </div>
                                </div>

                                <div>
                                    <div className="px-3 pb-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
                                        Users & Analytics
                                    </div>
                                    <div className="space-y-1">
                                        <SidebarItem href="/admin/customers" icon={Users} title="Customers" />
                                        <SidebarItem href="/admin/users" icon={Users} title="Internal Staff" />
                                        <SidebarItem href="/admin/reports" icon={BarChart3} title="Reports" />
                                        <SidebarItem href="/admin/audit-logs" icon={ShieldCheck} title="Audit Logs" />
                                        <SidebarItem href="/admin/settings" icon={Settings} title="Settings" />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <div className="px-3 pb-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
                                        Overview
                                    </div>
                                    <div className="space-y-1">
                                        <SidebarItem href="/dashboard" icon={Home} title="Overview" />
                                        <SidebarItem
                                            href="/dashboard/subscriptions"
                                            icon={ShoppingCart}
                                            title="My Subscriptions"
                                            badge={subCount > 0 ? subCount : null}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="px-3 pb-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
                                        Financial Records
                                    </div>
                                    <div className="space-y-1">
                                        <SidebarItem href="/dashboard/invoices" icon={Receipt} title="Invoices" />
                                        <SidebarItem href="/dashboard/payments" icon={Wallet} title="Payments" />
                                    </div>
                                </div>

                                <div>
                                    <div className="px-3 pb-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
                                        Account
                                    </div>
                                    <div className="space-y-1">
                                        <SidebarItem href="/dashboard/profile" icon={User} title="My Profile" />
                                    </div>
                                </div>
                            </>
                        )}
                    </nav>
                </div>

                {/* User Info & Logout Footer */}
                <div className="mt-auto border-t p-3 bg-muted/20">
                    <div className="flex items-center justify-between rounded-lg p-2 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                                {userName?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex flex-col overflow-hidden text-left">
                                <span className="truncate text-xs font-semibold text-foreground leading-tight">{userName || 'Account'}</span>
                                <span className="truncate text-[10px] text-muted-foreground leading-tight">{userEmail}</span>
                            </div>
                        </div>
                        <form action={logout}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
                                title="Sign out"
                            >
                                <LogOut className="h-3.5 w-3.5" />
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </aside>
    )
}
