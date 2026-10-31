'use client'

import { motion } from "framer-motion"
import { FileCheck, Sparkles, Receipt, CreditCard, RefreshCw, ArrowRight } from "lucide-react"

const lifecycleSteps = [
    {
        step: "01",
        title: "Quotation & Onboarding",
        icon: FileCheck,
        desc: "Configure products, discount vouchers, and taxes. Generate customized enterprise quotations for rapid client approval."
    },
    {
        step: "02",
        title: "Subscription Provisioning",
        icon: Sparkles,
        desc: "Automate contract creation with flexible billing intervals (Daily, Weekly, Monthly, Yearly) and optional zero-friction trials."
    },
    {
        step: "03",
        title: "Automated Invoicing",
        icon: Receipt,
        desc: "Cron-driven billing engine snapshots line items, applies exact GST rates, and issues computer-generated invoices with zero human error."
    },
    {
        step: "04",
        title: "Multi-Channel Settlement",
        icon: CreditCard,
        desc: "Seamless payment reconciliation via Razorpay online gateway or manual bank wire with immediate status clearance."
    },
    {
        step: "05",
        title: "Period Advancement",
        icon: RefreshCw,
        desc: "Idempotent schedule progression maintains continuous service delivery and dispatches automated renewal confirmations."
    }
]

export function LifecycleSection() {
    return (
        <section id="lifecycle" className="py-20 md:py-28 border-t border-border/80 bg-background scroll-mt-16">
            <div className="container max-w-6xl px-4 md:px-8 mx-auto">
                {/* Section Header */}
                <div className="max-w-2xl mx-auto text-center space-y-3 mb-16">
                    <span className="text-xs font-bold tracking-wider uppercase text-brand-700 bg-brand-100/70 border border-brand-400/30 px-3 py-1 rounded-full inline-block">
                        End-to-End Lifecycle
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-950">
                        The Brightloop Billing Lifecycle
                    </h2>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                        A unified operational journey designed to automate every touchpoint from initial customer quotation to recurring revenue collection.
                    </p>
                </div>

                {/* Steps Timeline / Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lifecycleSteps.map((s, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.35, delay: idx * 0.08 }}
                            className="rounded-xl border border-border/80 bg-card p-6 shadow-2xs hover:border-brand-700/50 hover:shadow-xs transition-all relative group flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-mono font-extrabold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-md border border-brand-400/30">
                                        STAGE {s.step}
                                    </span>
                                    <div className="h-9 w-9 rounded-lg bg-brand-100 text-brand-800 flex items-center justify-center border border-brand-400/30 group-hover:bg-brand-700 group-hover:text-white transition-colors">
                                        <s.icon className="h-4 w-4" />
                                    </div>
                                </div>
                                <h3 className="font-bold text-base text-brand-950 mb-2">
                                    {s.title}
                                </h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {s.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}

                    {/* Final CTA / Architecture Summary Tile */}
                    <div className="rounded-xl border border-brand-700/40 bg-brand-900 p-6 text-white shadow-xs flex flex-col justify-between">
                        <div>
                            <span className="text-xs font-mono font-extrabold text-brand-100 bg-brand-800 px-2 py-0.5 rounded-md border border-brand-700 inline-block mb-4">
                                RELIABILITY
                            </span>
                            <h3 className="font-bold text-base text-white mb-2">
                                Production-Ready Ledgers
                            </h3>
                            <p className="text-xs text-brand-100/80 leading-relaxed">
                                Built with strict idempotency keys, duplicate charge prevention, and auditable transaction logging for peace of mind.
                            </p>
                        </div>
                        <div className="pt-4 mt-4 border-t border-brand-800/80 flex items-center text-xs font-semibold text-brand-400">
                            <span>Fully Automated Pipeline</span>
                            <ArrowRight className="h-3.5 w-3.5 ml-2" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
