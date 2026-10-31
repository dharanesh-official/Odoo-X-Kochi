import { LandingHero } from '@/components/landing-hero'
import { FeaturesGrid } from '@/components/features-grid'
import { Navbar } from '@/components/navbar'
import Link from 'next/link'
import { Layers } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <LandingHero />
        <FeaturesGrid />
      </main>
      <footer className="border-t border-border/80 bg-muted/20 py-10 md:py-12">
        <div className="container max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md bg-brand-900 text-brand-100 flex items-center justify-center">
              <Layers className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-sm tracking-tight text-foreground">
              Brightloop Software
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/auth/login" className="hover:text-foreground transition-colors">
              Customer Portal
            </Link>
            <Link href="/auth/admin-login" className="hover:text-foreground transition-colors">
              Admin Console
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Brightloop. Engineered by <strong>Dharanesh and Team</strong>.
          </p>
        </div>
      </footer>
    </div>
  )
}
