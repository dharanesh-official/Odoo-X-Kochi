'use client'

import * as React from "react"
import Link from "next/link"
import { Layers, Menu, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"

export function Navbar() {
    const [isOpen, setIsOpen] = React.useState(false)

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur-md">
            <div className="container flex h-16 items-center px-4 md:px-8 justify-between max-w-7xl mx-auto">
                <div className="flex items-center gap-8">
                    <Link className="flex items-center space-x-2.5 group" href="/">
                        <div className="h-8 w-8 rounded-lg bg-brand-900 text-brand-100 flex items-center justify-center shadow-xs transition-colors group-hover:bg-brand-800">
                            <Layers className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-foreground text-base tracking-tight leading-none">
                                Brightloop
                            </span>
                            <span className="text-[10px] text-brand-700 font-semibold tracking-wider uppercase mt-0.5">
                                Subscriptions
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                        <Link className="text-muted-foreground transition-colors hover:text-foreground" href="#features">
                            Features
                        </Link>
                        <Link className="text-muted-foreground transition-colors hover:text-foreground" href="/pricing">
                            Pricing
                        </Link>
                        <Link className="text-muted-foreground transition-colors hover:text-foreground" href="#architecture">
                            Lifecycle
                        </Link>
                    </nav>
                </div>

                {/* Desktop Auth */}
                <div className="hidden md:flex items-center space-x-3">
                    <Link href="/auth/login">
                        <Button variant="ghost" size="sm" className="font-medium text-foreground hover:bg-brand-100/40">
                            Log In
                        </Button>
                    </Link>
                    <Link href="/pricing">
                        <Button size="sm" className="bg-brand-700 hover:bg-brand-800 text-white font-medium shadow-xs gap-1.5 transition-all">
                            <span>Get Started</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                    </Link>
                </div>

                {/* Mobile Menu */}
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden text-foreground">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] border-l border-border bg-background p-6">
                        <div className="flex flex-col gap-6 pt-4">
                            <div className="flex items-center space-x-2.5">
                                <div className="h-8 w-8 rounded-lg bg-brand-900 text-brand-100 flex items-center justify-center">
                                    <Layers className="h-4 w-4" />
                                </div>
                                <span className="font-bold text-foreground text-base">Brightloop</span>
                            </div>

                            <nav className="flex flex-col gap-3 text-sm font-medium">
                                <Link
                                    href="#features"
                                    className="py-2 text-foreground/80 hover:text-brand-700 transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Features
                                </Link>
                                <Link
                                    href="/pricing"
                                    className="py-2 text-foreground/80 hover:text-brand-700 transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Pricing
                                </Link>
                            </nav>

                            <div className="h-px bg-border my-2" />

                            <div className="flex flex-col gap-2.5">
                                <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                                    <Button variant="outline" className="w-full justify-center">
                                        Log In
                                    </Button>
                                </Link>
                                <Link href="/pricing" onClick={() => setIsOpen(false)}>
                                    <Button className="w-full justify-center bg-brand-700 hover:bg-brand-800 text-white">
                                        Get Started
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    )
}
