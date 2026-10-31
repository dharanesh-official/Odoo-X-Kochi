import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Check if accessing admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!user) {
            // Not logged in, redirect to login
            const url = request.nextUrl.clone()
            url.pathname = '/auth/login'
            url.searchParams.set('error', 'Please login to access admin panel')
            return NextResponse.redirect(url)
        }

        // Get user profile to check role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') {
            // Not an admin, redirect to dashboard
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            url.searchParams.set('error', 'Access denied. Admin privileges required.')
            return NextResponse.redirect(url)
        }
    }

    // Check if accessing dashboard (requires any authenticated user)
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        if (!user) {
            const url = request.nextUrl.clone()
            url.pathname = '/auth/login'
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/dashboard/:path*',
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
