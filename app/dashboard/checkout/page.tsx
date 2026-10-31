
import { createClient } from "@/utils/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Tag } from "lucide-react"

import { redirect } from "next/navigation"
import { StripeCheckoutButton } from "./stripe-checkout-button"
import { createSubscriptionAction } from "./actions"

export const dynamic = 'force-dynamic'

export default async function CheckoutPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const planId = params.plan as string

    if (!planId) {
        redirect('/pricing')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect(`/auth/login?next=/dashboard/checkout&plan=${planId}`)
    }

    const { data: plan } = await supabase
        .from('plans')
        .select('*, products(*), discounts(*)')
        .eq('id', planId)
        .single()

    if (!plan) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold">Plan Not Found</h1>
                    <p className="text-muted-foreground">The plan you are looking for does not exist or is no longer available.</p>
                    <Button variant="outline" asChild>
                        <a href="/pricing">View All Plans</a>
                    </Button>
                </div>
            </div>
        )
    }



    return (
        <div className="container flex min-h-screen items-center justify-center py-12">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Confirm Subscription</CardTitle>
                    <CardDescription>Review your plan details before subscribing.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                        <div>
                            <h3 className="font-semibold">{plan.name}</h3>
                            <p className="text-sm text-muted-foreground">{plan.products?.name}</p>
                        </div>
                        <div className="text-right">
                            {plan.discounts && plan.discounts.active ? (
                                <>
                                    <div className="font-bold text-lg text-green-600">
                                        ₹{(plan.discounts.type === 'percentage'
                                            ? plan.amount * (1 - plan.discounts.value / 100)
                                            : Math.max(0, plan.amount - plan.discounts.value)).toFixed(2)}
                                    </div>
                                    <div className="text-xs text-muted-foreground line-through">₹{plan.amount}</div>
                                </>
                            ) : (
                                <div className="font-bold text-lg">₹{plan.amount}</div>
                            )}
                            <div className="text-xs text-muted-foreground capitalize">/ {plan.interval}</div>
                        </div>
                    </div>

                    {plan.discounts && plan.discounts.active && plan.discounts.description && (
                        <div className="p-3 bg-brand-100/60 border border-brand-400/40 rounded-lg">
                            <p className="text-xs font-semibold text-brand-900 flex items-center gap-2">
                                <Tag className="h-4 w-4 text-brand-700" />
                                {plan.discounts.description}
                            </p>
                        </div>
                    )}

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Start Date</span>
                            <span>Today</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Trial Period</span>
                            <span>{plan.trial_period_days > 0 ? `${plan.trial_period_days} Days` : 'None'}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t font-medium">
                            <span>Total Due Today</span>
                            <span>{plan.trial_period_days > 0 ? '₹0.00' : `₹${(plan.discounts && plan.discounts.active
                                ? (plan.discounts.type === 'percentage'
                                    ? plan.amount * (1 - plan.discounts.value / 100)
                                    : Math.max(0, plan.amount - plan.discounts.value))
                                : plan.amount).toFixed(2)}`}
                            </span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    {plan.trial_period_days > 0 ? (
                        <form action={createSubscriptionAction} className="w-full">
                            <input type="hidden" name="plan_id" value={plan.id} />
                            <Button type="submit" className="w-full" size="lg">
                                Start Free Trial ({plan.trial_period_days} Days)
                            </Button>
                        </form>
                    ) : (
                        <div className="w-full">
                            <StripeCheckoutButton
                                planId={plan.id}
                                amount={Number((plan.discounts && plan.discounts.active
                                    ? (plan.discounts.type === 'percentage'
                                        ? plan.amount * (1 - plan.discounts.value / 100)
                                        : Math.max(0, plan.amount - plan.discounts.value))
                                    : plan.amount).toFixed(2))}
                            />
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
