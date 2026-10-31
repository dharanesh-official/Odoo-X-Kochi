
import Sidebar from "@/components/sidebar"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

import { AdminMobileHeader } from "@/components/admin-mobile-header"

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
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
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <Sidebar role="customer" />
            <div className="flex flex-col">
                <AdminMobileHeader>
                    <Sidebar role="customer" className="block w-full border-none" />
                </AdminMobileHeader>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
