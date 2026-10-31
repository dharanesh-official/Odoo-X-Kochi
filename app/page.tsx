
import { LandingHero } from '@/components/landing-hero'
import { FeaturesGrid } from '@/components/features-grid'
import { Navbar } from '@/components/navbar'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <LandingHero />
        <FeaturesGrid />
      </main>
      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by <strong>Dharanesh and Team</strong>.
          </p>
        </div>
      </footer>
    </div>
  )
}
