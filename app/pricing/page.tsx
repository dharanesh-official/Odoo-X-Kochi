import { createClient } from "@/utils/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Check, ShieldCheck, ArrowRight, Zap } from "lucide-react"
import { Navbar } from "@/components/navbar"

export const dynamic = 'force-dynamic'

export default async function PricingPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const userClient = await createClient()
    const { upgrade } = await searchParams

    // Fetch public plans using admin client to avoid RLS recursion on plans table
    const { createAdminClient } = await import('@/utils/supabase/admin')
    const adminSb = createAdminClient()
    let { data: plans } = await adminSb
        .from('plans')
        .select('*, products(name, description)')
        .eq('active', true)
        .eq('visibility', 'public')
        .order('amount', { ascending: true })

    // If upgrading, filter out trial plans
    if (upgrade === 'true' && plans) {
        plans = plans.filter((p: any) =>
            !p.name.toLowerCase().includes('trial') &&
            p.amount > 0 &&
            p.trial_period_days === 0
        )
    }

    // Check if user is logged in
    const { data: { user } } = await userClient.auth.getUser()

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Navbar />

            <main className="flex-1 py-16 md:py-24">
                <div className="container px-4 md:px-8 max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-2xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-400/40 bg-brand-100/60 px-3 py-1 text-xs font-semibold text-brand-900">
                            <ShieldCheck className="h-3.5 w-3.5 text-brand-700" />
                            <span>Transparent Tier Architecture</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-brand-950">
                            Predictable Plans for Modern SaaS
                        </h1>
                        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                            Select the subscription tier suited for your operations. All plans include automated GST invoicing, period tracking, and payment receipts.
                        </p>
                    </div>

                    {/* Plan Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
                        {plans && plans.length > 0 ? (
                            plans.map((plan: any, idx: number) => {
                                const isFeatured = idx === 1 || plans.length === 1
                                return (
                                    <div
                                        key={plan.id}
                                        className={`flex flex-col rounded-xl border p-7 transition-all duration-200 ${
                                            isFeatured
                                                ? 'border-brand-700 bg-card shadow-md relative'
                                                : 'border-border bg-card shadow-2xs hover:border-brand-400/60'
                                        }`}
                                    >
                                        {isFeatured && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-700 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-xs">
                                                Most Popular
                                            </div>
                                        )}

                                        <div className="space-y-1.5 pb-4 border-b border-border/80">
                                            <h3 className="font-bold text-xl text-brand-950">{plan.name}</h3>
                                            <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
                                                {plan.products?.name || "Service Tier"}
                                            </p>
                                        </div>

                                        <div className="py-6">
                                            <div className="flex items-baseline text-4xl font-extrabold text-brand-950">
                                                ₹{Number(plan.amount).toLocaleString('en-IN')}
                                                <span className="ml-1.5 text-sm font-medium text-muted-foreground">
                                                    /{plan.interval}
                                                </span>
                                            </div>
                                            <p className="mt-3 text-xs text-muted-foreground min-h-[40px] leading-relaxed">
                                                {plan.products?.description || "Comprehensive recurring subscription features with full system access."}
                                            </p>
                                        </div>

                                        <div className="space-y-3 py-4 border-t border-border/60 flex-1">
                                            <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                                                <Check className="h-4 w-4 text-brand-700 shrink-0" />
                                                <span>Automated Cycle Invoicing</span>
                                            </div>
                                            <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                                                <Check className="h-4 w-4 text-brand-700 shrink-0" />
                                                <span>Instant Razorpay & Manual Settlements</span>
                                            </div>
                                            <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                                                <Check className="h-4 w-4 text-brand-700 shrink-0" />
                                                <span>Standard Customer Support</span>
                                            </div>
                                            {plan.trial_period_days > 0 && (
                                                <div className="flex items-center gap-2.5 text-xs text-brand-800 font-semibold bg-brand-100/50 p-2 rounded-md border border-brand-400/30">
                                                    <Check className="h-4 w-4 text-brand-700 shrink-0" />
                                                    <span>{plan.trial_period_days}-Day Zero-Commitment Trial</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-6 mt-auto">
                                            <Link
                                                href={user ? `/dashboard/checkout?plan=${plan.id}` : `/auth/signup?next=/dashboard/checkout&plan=${plan.id}`}
                                                className="block"
                                            >
                                                <Button
                                                    className={`w-full font-semibold transition-all ${
                                                        isFeatured
                                                            ? 'bg-brand-700 hover:bg-brand-800 text-white shadow-xs'
                                                            : 'bg-muted/80 hover:bg-brand-100/60 text-foreground border border-border'
                                                    }`}
                                                    size="lg"
                                                >
                                                    <span>{user ? "Subscribe Now" : "Get Started"}</span>
                                                    <ArrowRight className="h-4 w-4 ml-1.5" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="col-span-full text-center py-16 border border-dashed rounded-xl p-8">
                                <p className="text-base font-semibold text-muted-foreground">No public plans are active at the moment.</p>
                                <p className="text-xs text-muted-foreground mt-1">Please check back shortly or contact our sales team.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <footer className="border-t border-border/80 bg-muted/20 py-10 md:py-12">
                <div className="container max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2.5">
                        <span className="font-bold text-sm tracking-tight text-foreground">
                            Brightloop Software
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-muted-foreground">
                        <Link href="/#features" className="hover:text-foreground transition-colors">
                            Features
                        </Link>
                        <Link href="/pricing" className="hover:text-foreground transition-colors">
                            Pricing
                        </Link>
                        <Link href="/#lifecycle" className="hover:text-foreground transition-colors">
                            Lifecycle
                        </Link>
                        <Link href="/auth/login" className="hover:text-foreground transition-colors">
                            Customer Portal
                        </Link>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        &copy; {new Date().getFullYear()} Brightloop. Build by <strong>Dharanesh</strong>.
                    </p>
                </div>
            </footer>
        </div>
    )
}
