
import { createClient } from "@/utils/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Check } from "lucide-react"
import { Navbar } from "@/components/navbar"

export const dynamic = 'force-dynamic'

export default async function PricingPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const supabase = await createClient()
    const { upgrade } = await searchParams

    // Fetch public plans
    let { data: plans } = await supabase
        .from('plans')
        .select('*, products(name, description)')
        .eq('active', true)
        .eq('visibility', 'public')
        .order('amount', { ascending: true })

    // If upgrading, filter out trial plans (plans with 'trial' in name or 0 amount or specific logic)
    if (upgrade === 'true' && plans) {
        plans = plans.filter((p: any) =>
            !p.name.toLowerCase().includes('trial') &&
            p.amount > 0 &&
            p.trial_period_days === 0 // Ensure no trial period
        )
    }

    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />

            <main className="flex-1 py-12 md:py-24 lg:py-32 bg-slate-50 dark:bg-slate-950">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Simple, Transparent Pricing</h1>
                            <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                                Choose the plan that's right for you. No hidden fees. Cancel anytime.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 max-w-7xl mx-auto">
                        {plans && plans.length > 0 ? (
                            plans.map((plan: any) => (
                                <div key={plan.id} className="flex flex-col p-6 bg-card text-card-foreground rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                                    <div className="space-y-2">
                                        <h3 className="font-bold text-2xl">{plan.name}</h3>
                                        <p className="text-sm text-muted-foreground">{plan.products?.name}</p>
                                    </div>
                                    <div className="mt-4 flex items-baseline text-3xl font-bold">
                                        ₹{plan.amount}
                                        <span className="ml-1 text-base font-normal text-muted-foreground">/{plan.interval}</span>
                                    </div>
                                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 min-h-[50px]">
                                        {plan.products?.description || "Get access to all premium features."}
                                    </p>

                                    <div className="mt-6 space-y-3 flex-1">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Check className="h-4 w-4 text-green-500" />
                                            <span>Full Access</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Check className="h-4 w-4 text-green-500" />
                                            <span>Email Support</span>
                                        </div>
                                        {plan.trial_period_days > 0 && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Check className="h-4 w-4 text-green-500" />
                                                <span>{plan.trial_period_days}-day Free Trial</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-8">
                                        <Link href={user ? `/dashboard/checkout?plan=${plan.id}` : `/auth/signup?next=/dashboard/checkout&plan=${plan.id}`}>
                                            <Button className="w-full" size="lg">
                                                {user ? "Subscribe Now" : "Get Started"}
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <p className="text-xl text-muted-foreground">No public plans available at the moment.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
