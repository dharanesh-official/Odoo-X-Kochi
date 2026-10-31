
import Sidebar from "@/components/sidebar"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { AdminMobileHeader } from "@/components/admin-mobile-header"
import { DashboardHeader } from "@/components/dashboard-header"

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect("/auth/login")
    }

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[230px_1fr] lg:grid-cols-[260px_1fr] bg-slate-50/50">
            <Sidebar role="admin" />
            <div className="flex flex-col min-w-0">
                <AdminMobileHeader>
                    <Sidebar role="admin" className="block w-full border-none" />
                </AdminMobileHeader>
                <DashboardHeader user={user} role="admin" />
                <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in-50 duration-200">
                    {children}
                </main>
            </div>
        </div>
    )
}
