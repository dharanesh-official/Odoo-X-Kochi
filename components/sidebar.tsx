import Link from "next/link"
import { Button } from "@/components/ui/button"
import { logout } from "@/app/auth/actions"
import { Zap, LogOut } from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { cn } from "@/lib/utils"
import { SidebarNav } from "./sidebar-nav"

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

                {/* Navigation Links Rendered via Client Component */}
                <div className="flex-1 overflow-y-auto px-3 py-3">
                    <SidebarNav role={role} subCount={subCount} />
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
