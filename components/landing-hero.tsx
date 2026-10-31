'use client'

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, CheckCircle2, ShieldCheck, RefreshCw, FileText } from "lucide-react"

export function LandingHero() {
    return (
        <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 border-b border-border/60">
            {/* Subtle brand tint gradient container */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_35%_at_50%_0%,rgba(218,241,222,0.45)_0%,rgba(255,255,255,0)_100%)] pointer-events-none" />

            <div className="container max-w-6xl px-4 md:px-8 mx-auto">
                <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
                    {/* Editorial Eyebrow Tag */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="inline-flex items-center gap-2 rounded-full border border-brand-400/40 bg-brand-100/60 px-3.5 py-1 text-xs font-semibold text-brand-900"
                    >
                        <ShieldCheck className="h-3.5 w-3.5 text-brand-700" />
                        <span>Production-Grade Subscription Infrastructure</span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-brand-950 leading-[1.12]"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        Manage Recurring Revenue with Absolute Precision
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        Brightloop automates product tiers, recurring invoice generation, dynamic tax compliance, and instant payment settlement through a unified operations engine.
                    </motion.p>

                    {/* CTA Actions */}
                    <motion.div
                        className="flex flex-col sm:flex-row items-center gap-3 pt-2"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <Link href="/pricing">
                            <Button size="lg" className="h-11 px-6 bg-brand-700 hover:bg-brand-800 text-white font-semibold shadow-xs gap-2 transition-all">
                                <span>Browse Plans & Pricing</span>
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/auth/login">
                            <Button variant="outline" size="lg" className="h-11 px-6 border-border text-foreground hover:bg-brand-100/40 font-medium">
                                Customer Portal Sign In
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Trust Badges */}
                    <motion.div
                        className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4 text-xs font-medium text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-brand-700" />
                            Automated Billing Cycles
                        </span>
                        <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-brand-700" />
                            Compliant Tax & GST Invoicing
                        </span>
                        <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-brand-700" />
                            Bank-Grade Settlement Receipts
                        </span>
                    </motion.div>
                </div>

                {/* Live Product Overview Mockup Card */}
                <motion.div
                    className="mt-14 rounded-xl border border-border/90 bg-card p-2 sm:p-4 shadow-sm"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <div className="rounded-lg border border-border/60 bg-muted/20 p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/70">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-md bg-brand-700 text-brand-100 flex items-center justify-center font-bold text-sm">
                                    BL
                                </div>
                                <div>
                                    <div className="font-bold text-foreground text-sm">Brightloop Enterprise Billing</div>
                                    <div className="text-xs text-muted-foreground">Automated Cycle &bull; Invoice Engine Active</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-brand-100 text-brand-900 border border-brand-400/40">
                                    <RefreshCw className="h-3 w-3 text-brand-700 animate-spin" style={{ animationDuration: '6s' }} />
                                    Synchronized
                                </span>
                            </div>
                        </div>

                        {/* Interactive UI Mockup Metrics */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                            <div className="p-4 rounded-lg bg-background border border-border/80">
                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Recurring Schedule
                                </div>
                                <div className="text-xl font-bold text-brand-950 mt-1">1st of Month</div>
                                <div className="text-xs text-brand-700 font-medium mt-1">Auto-advanced period</div>
                            </div>
                            <div className="p-4 rounded-lg bg-background border border-border/80">
                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Tax Compliance
                                </div>
                                <div className="text-xl font-bold text-brand-950 mt-1">18% GST Auto-Calculated</div>
                                <div className="text-xs text-muted-foreground mt-1">Itemized line snapshots</div>
                            </div>
                            <div className="p-4 rounded-lg bg-background border border-border/80">
                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Settlement Mechanism
                                </div>
                                <div className="text-xl font-bold text-brand-950 mt-1">Razorpay & Bank Wire</div>
                                <div className="text-xs text-brand-700 font-medium mt-1">Instant invoice reconciliation</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
