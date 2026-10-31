
'use client'

import { motion } from "framer-motion"
import { BarChart3, ShieldCheck, RefreshCw, Zap, Users, Globe } from "lucide-react"

const features = [
    {
        icon: RefreshCw,
        title: "Automated Billing",
        desc: "Scheulde recurring invoices and payments automatically.",
        color: "text-blue-500"
    },
    {
        icon: BarChart3,
        title: "Real-time Analytics",
        desc: "Track MRR, Churn, and ARPU instantly with live charts.",
        color: "text-green-500"
    },
    {
        icon: ShieldCheck,
        title: "Enterprise Security",
        desc: "Role-based access control and bank-grade encryption.",
        color: "text-purple-500"
    },
    {
        icon: Zap,
        title: "Instant Setup",
        desc: "Deploy in minutes with our one-click integration.",
        color: "text-yellow-500"
    },
    {
        icon: Users,
        title: "Team Collaboration",
        desc: "Invite your whole team with granular permissions.",
        color: "text-pink-500"
    },
    {
        icon: Globe,
        title: "Global Payments",
        desc: "Accept payments in 135+ currencies worldwide.",
        color: "text-cyan-500"
    }
]

export function FeaturesGrid() {
    return (
        <section id="features" className="container space-y-12 bg-slate-50/50 py-12 md:py-24 lg:py-32 dark:bg-transparent px-4 rounded-3xl mb-12 border relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" style={{ backgroundSize: '40px 40px' }} />

            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center relative z-10">
                <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                    Built for Growth. Engineered for Speed.
                </h2>
                <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                    Everything you need to manage your subscription business in one place.
                </p>
            </div>

            <div className="mx-auto grid justify-center gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl relative z-10">
                {features.map((feature, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        whileHover={{
                            y: -8,
                            scale: 1.02,
                            boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
                        }}
                        transition={{ duration: 0.2, delay: i * 0.1 }}
                        viewport={{ once: true }}
                        className="relative overflow-hidden rounded-xl border bg-background/50 backdrop-blur-sm p-6 transition-all duration-150 hover:border-primary hover:bg-muted/30 group cursor-pointer"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                        <div className="flex h-[180px] flex-col justify-between rounded-md relative z-10">
                            <div className={`p-3 w-fit rounded-lg bg-muted group-hover:bg-primary/20 
                                group-hover:scale-110 group-hover:rotate-3 transition-all duration-150 ease-out origin-left`}>
                                <feature.icon className={`h-8 w-8 ${feature.color}`} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-xl group-hover:text-primary transition-colors duration-200">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    )
}
