'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SidebarItemProps {
    href: string
    icon: React.ComponentType<{ className?: string }>
    title: string
    badge?: number | string | null
}

export function SidebarItem({ href, icon: Icon, title, badge }: SidebarItemProps) {
    const pathname = usePathname()
    const isActive = pathname === href || (href !== '/dashboard' && href !== '/admin/dashboard' && pathname?.startsWith(href))

    return (
        <Link
            href={href}
            className={cn(
                "group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                isActive
                    ? "bg-primary/10 text-primary font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-0.5"
            )}
        >
            <div className="flex items-center gap-3">
                <Icon
                    className={cn(
                        "h-4 w-4 transition-transform duration-150 group-hover:scale-110",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}
                />
                <span>{title}</span>
            </div>
            {badge !== undefined && badge !== null && Number(badge) > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/15 px-1.5 text-[11px] font-semibold text-primary">
                    {badge}
                </span>
            )}
        </Link>
    )
}
