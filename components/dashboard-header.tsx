import Link from 'next/link'
import { NotificationButton } from '@/components/notification-button'
import { logout } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, LogOut, Sparkles } from 'lucide-react'

interface DashboardHeaderProps {
    user: {
        email?: string | null
        user_metadata?: {
            full_name?: string
        }
    }
    role?: 'customer' | 'admin'
}

export function DashboardHeader({ user, role = 'customer' }: DashboardHeaderProps) {
    const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
    const initials = fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
            <div className="flex items-center gap-3">
                <Badge
                    variant="secondary"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 font-medium bg-emerald-50 text-emerald-700 border-emerald-200"
                >
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                    {role === 'admin' ? 'Admin Portal' : 'Customer Portal'}
                </Badge>
                <div className="hidden md:flex items-center text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">SubCheck</span>
                    <span className="mx-2">/</span>
                    <span className="capitalize">{role === 'admin' ? 'Management' : 'Self-Service'}</span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <NotificationButton />

                <div className="flex items-center gap-2 pl-2 border-l">
                    <Link
                        href={role === 'admin' ? '/admin/settings' : '/dashboard/profile'}
                        className="flex items-center gap-2.5 rounded-full p-1 pr-3 hover:bg-muted/80 transition-colors"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 font-semibold text-xs text-white shadow-sm">
                            {initials}
                        </div>
                        <div className="hidden md:flex flex-col text-left">
                            <span className="text-xs font-semibold leading-tight text-foreground">{fullName}</span>
                            <span className="text-[11px] text-muted-foreground leading-tight truncate max-w-[120px]">
                                {user.email}
                            </span>
                        </div>
                    </Link>

                    <form action={logout}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
                            title="Sign out"
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </header>
    )
}
