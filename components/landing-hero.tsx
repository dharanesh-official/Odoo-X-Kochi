
'use client'

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function LandingHero() {
    return (
        <section className="relative overflow-hidden py-20 md:py-32">
            {/* Background Gradients */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
                <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl ml-10" />
            </div>

            <div className="container flex max-w-[64rem] flex-col items-center gap-8 text-center px-4 mx-auto">


                <motion.h1
                    className="font-heading text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    Manage Recurring Revenue <br className="hidden sm:inline" />
                    <span className="text-primary">Like A Fortune 500</span>
                </motion.h1>

                <motion.p
                    className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    The automated subscription engine for modern SaaS. Handle billing, invoices, taxes, and customer lifecycles without writing code.
                </motion.p>

                <motion.div
                    className="flex flex-col sm:flex-row gap-4 pt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Link href="/auth/signup">
                        <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/25 transition-transform hover:scale-105 active:scale-95 duration-200">
                            Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>

                </motion.div>
            </div>
        </section>
    )
}
