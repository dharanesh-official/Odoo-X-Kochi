'use client'

import { motion } from "framer-motion"
import { RefreshCw, BarChart3, ShieldCheck, Zap, Users, Receipt, CreditCard, SlidersHorizontal } from "lucide-react"

const capabilities = [
    {
        icon: RefreshCw,
        title: "Automated Recurring Engine",
        desc: "Schedule automated billing runs, generate draft or posted invoices, and advance subscription periods with idempotent cron tasks.",
        category: "Billing Automation"
    },
    {
        icon: Receipt,
        title: "Itemized Tax & Invoicing",
        desc: "Snapshot product line items, calculate percentage or fixed taxes, and issue professional print-ready GST invoices.",
        category: "Financial Accuracy"
    },
    {
        icon: CreditCard,
        title: "Instant Multi-Channel Settlement",
        desc: "Collect online payments via integrated Razorpay gateway or register manual bank transfers with automatic invoice clearing.",
        category: "Payments"
    },
    {
        icon: SlidersHorizontal,
        title: "Flexible Catalog & Tiers",
        desc: "Configure recurring intervals (daily, weekly, monthly, yearly), customize trial days, and apply dynamic discount structures.",
        category: "Product Management"
    },
    {
        icon: BarChart3,
        title: "Real-Time Revenue Analytics",
        desc: "Monitor active subscriber counts, recurring run history, invoice aging, and payment settlement rates directly from your command center.",
        category: "Operations"
    },
    {
        icon: ShieldCheck,
        title: "Role-Based Access & Audit Logs",
        desc: "Enforce strict separation between administrative controllers and customer self-service portals with immutable activity tracking.",
        category: "Security"
    }
]

export function FeaturesGrid() {
    return (
        <section id="features" className="py-20 md:py-28 bg-muted/30">
            <div className="container max-w-6xl px-4 md:px-8 mx-auto">
                {/* Section Header */}
                <div className="max-w-2xl mx-auto text-center space-y-3 mb-16">
                    <span className="text-xs font-bold tracking-wider uppercase text-brand-700 bg-brand-100/70 border border-brand-400/30 px-3 py-1 rounded-full inline-block">
                        Enterprise Capabilities
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-950">
                        Designed for Complete Billing Control
                    </h2>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                        Every feature is purpose-built to eliminate manual intervention, reduce churn, and maintain an audit-proof financial ledger.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {capabilities.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.35, delay: idx * 0.05 }}
                            className="flex flex-col justify-between rounded-xl border border-border/80 bg-card p-6 shadow-xs hover:border-brand-700/40 hover:shadow-sm transition-all duration-200"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="h-10 w-10 rounded-lg bg-brand-100 text-brand-800 flex items-center justify-center border border-brand-400/20">
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                        {item.category}
                                    </span>
                                </div>
                                <div className="space-y-1.5">
                                    <h3 className="font-bold text-base text-brand-950">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
