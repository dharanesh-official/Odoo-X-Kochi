'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    Home,
    Package,
    ShoppingCart,
    Users,
    Settings,
    Wallet,
    Briefcase,
    IndianRupee,
    FileText,
    Percent,
    Tag,
    BarChart3,
    Receipt,
    ShieldCheck,
    User
} from 'lucide-react'

interface NavLinkProps {
    href: string
    icon: React.ComponentType<{ className?: string }>
    title: string
    badge?: number | string | null
}

function NavLink({ href, icon: Icon, title, badge }: NavLinkProps) {
    const pathname = usePathname()
    const isActive = pathname === href || (href !== '/dashboard' && href !== '/admin/dashboard' && pathname?.startsWith(href))

    return (
        <Link
            href={href}
            className={cn(
                "group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-all duration-150",
                isActive
                    ? "bg-brand-100 text-brand-950 font-semibold border-l-2 border-brand-700 pl-2.5 shadow-2xs"
                    : "text-muted-foreground hover:bg-brand-100/40 hover:text-foreground"
            )}
        >
            <div className="flex items-center gap-2.5">
                <Icon
                    className={cn(
                        "h-4 w-4 transition-colors duration-150",
                        isActive ? "text-brand-800" : "text-muted-foreground group-hover:text-foreground"
                    )}
                />
                <span>{title}</span>
            </div>
            {badge !== undefined && badge !== null && Number(badge) > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-700 px-1.5 text-[11px] font-bold text-white">
                    {badge}
                </span>
            )}
        </Link>
    )
}

interface SidebarNavProps {
    role: 'admin' | 'customer'
    subCount?: number
}

export function SidebarNav({ role, subCount = 0 }: SidebarNavProps) {
    return (
        <nav className="space-y-4">
            {role === 'admin' ? (
                <>
                    <div>
                        <div className="px-3 pb-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
                            Core Operations
                        </div>
                        <div className="space-y-1">
                            <NavLink href="/admin/dashboard" icon={Home} title="Dashboard" />
                            <NavLink href="/admin/subscriptions" icon={ShoppingCart} title="Subscriptions" />
                            <NavLink href="/admin/invoices" icon={Receipt} title="Invoices" />
                            <NavLink href="/admin/payments" icon={IndianRupee} title="Payments" />
                            <NavLink href="/admin/quotations" icon={FileText} title="Quotations" />
                        </div>
                    </div>

                    <div>
                        <div className="px-3 pb-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
                            Catalog & Pricing
                        </div>
                        <div className="space-y-1">
                            <NavLink href="/admin/products" icon={Package} title="Products" />
                            <NavLink href="/admin/plans" icon={Briefcase} title="Plans" />
                            <NavLink href="/admin/discounts" icon={Tag} title="Discounts" />
                            <NavLink href="/admin/taxes" icon={Percent} title="Taxes" />
                        </div>
                    </div>

                    <div>
                        <div className="px-3 pb-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
                            Users & Analytics
                        </div>
                        <div className="space-y-1">
                            <NavLink href="/admin/customers" icon={Users} title="Customers" />
                            <NavLink href="/admin/users" icon={Users} title="Internal Staff" />
                            <NavLink href="/admin/reports" icon={BarChart3} title="Reports" />
                            <NavLink href="/admin/audit-logs" icon={ShieldCheck} title="Audit Logs" />
                            <NavLink href="/admin/settings" icon={Settings} title="Settings" />
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
                            <NavLink href="/dashboard" icon={Home} title="Overview" />
                            <NavLink
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
                            <NavLink href="/dashboard/invoices" icon={Receipt} title="Invoices" />
                            <NavLink href="/dashboard/payments" icon={Wallet} title="Payments" />
                        </div>
                    </div>

                    <div>
                        <div className="px-3 pb-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
                            Account
                        </div>
                        <div className="space-y-1">
                            <NavLink href="/dashboard/profile" icon={User} title="My Profile" />
                        </div>
                    </div>
                </>
            )}
        </nav>
    )
}
