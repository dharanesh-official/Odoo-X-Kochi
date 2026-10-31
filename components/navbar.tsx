'use client'

import * as React from "react"
import Link from "next/link"
import { Zap, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"

export function Navbar() {
    const [isOpen, setIsOpen] = React.useState(false)

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center px-4 md:px-6 justify-between">
                <div className="flex items-center gap-2">
                    <Link className="flex items-center space-x-2" href="/">
                        <div className="h-8 w-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                            <Zap className="h-5 w-5 text-white dark:text-black fill-current" />
                        </div>
                        <span className="font-bold sm:inline-block text-lg">
                            SubCheck
                        </span>
                    </Link>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                    <Link className="transition-colors hover:text-foreground/80 text-foreground/60" href="#features">Features</Link>
                    <Link className="transition-colors hover:text-foreground/80 text-foreground/60" href="/pricing">Pricing</Link>
                </nav>

                {/* Desktop Auth */}
                <div className="hidden md:flex items-center space-x-4">
                    <Link href="/auth/login">
                        <Button variant="ghost" size="sm">Log In</Button>
                    </Link>
                    <Link href="/auth/signup">
                        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md">Get Started</Button>
                    </Link>
                </div>

                {/* Mobile Menu Trigger */}
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden">
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">Toggle Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                        <div className="flex flex-col gap-6 py-6">
                            <div className="flex flex-col gap-2">
                                <Link href="#features" className="text-lg font-medium hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                                    Features
                                </Link>
                                <Link href="/pricing" className="text-lg font-medium hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                                    Pricing
                                </Link>
                            </div>
                            <div className="h-px bg-border" />
                            <div className="flex flex-col gap-3">
                                <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start text-lg">Log In</Button>
                                </Link>
                                <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md">Get Started</Button>
                                </Link>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    )
}
