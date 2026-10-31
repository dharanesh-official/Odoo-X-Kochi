
import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { sendWelcomeEmail } from '@/utils/mail'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'
    const flow = searchParams.get('flow')

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            // Welcome Email Logic
            if (flow === 'signup' || flow === 'google-signup') {
                const { data: { user } } = await supabase.auth.getUser()
                if (user?.email) {
                    const createdAt = new Date(user.created_at).getTime()
                    const now = new Date().getTime()
                    // If created within last 2 minutes
                    if (now - createdAt < 120000) {
                        const name = user.user_metadata?.full_name || 'Friend'
                        sendWelcomeEmail(user.email, name).catch(e => console.error("Welcome Email Error:", e))
                    }
                }
            }

            return NextResponse.redirect(`${getURL()}${next}`)
        } else {
            // Redirect with error message from Supabase
            return NextResponse.redirect(`${getURL()}/auth/login?error=Could not authenticate user&error_description=${encodeURIComponent(error.message)}`)
        }
    }

    return NextResponse.redirect(`${getURL()}/auth/login?error=Could not authenticate user`)
}

const getURL = () => {
    let url =
        process.env.NEXT_PUBLIC_APP_URL ??
        process.env.NEXT_PUBLIC_VERCEL_URL ??
        'http://localhost:3000'
    url = url.includes('http') ? url : `https://${url}`
    return url
}
