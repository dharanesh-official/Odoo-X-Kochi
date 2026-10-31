
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { sendWelcomeEmail, sendConfirmationEmail, sendPasswordResetEmail } from '@/lib/email'

function getAdminClient() {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
        return createSupabaseAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            { auth: { autoRefreshToken: false, persistSession: false } }
        )
    }
    return null
}

// Basic login redirection
export async function login(formData: FormData) {
    // Legacy support for basic login
    return loginCustomer(formData)
}

export async function loginAdmin(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // 1. Authenticate
    const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error("Login Error:", error.message)
        let message = error.message
        if (error.message === 'Invalid login credentials') {
            message = 'Invalid email or password.'
        }
        return redirect(`/auth/admin-login?error=${encodeURIComponent(message)}`)
    }

    const user = authData?.user
    if (!user) return redirect('/auth/admin-login')

    // 2. Check Roles via AdminClient and Auth metadata to avoid RLS blocking or session cookie lag
    const adminClient = getAdminClient()
    let role = user.app_metadata?.role || user.user_metadata?.role

    if (!role || role !== 'admin') {
        const queryClient = adminClient || supabase
        const { data: profile } = await queryClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle()
        if (profile?.role) {
            role = profile.role
        }
    }

    if (role !== 'admin') {
        await supabase.auth.signOut()
        return redirect(`/auth/admin-login?error=${encodeURIComponent('Access Denied. Admin privileges required.')}`)
    }

    revalidatePath('/', 'layout')
    redirect('/admin/dashboard')
}

export async function loginCustomer(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // 1. Authenticate
    const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error("Login Error:", error.message)
        let message = error.message
        if (error.message === 'Invalid login credentials') {
            message = 'Invalid email or password.'
        }
        return redirect(`/auth/login?error=${encodeURIComponent(message)}`)
    }

    const user = authData?.user
    if (!user) return redirect('/auth/login')

    // 2. Check Roles
    const adminClient = getAdminClient()
    let role = user.app_metadata?.role || user.user_metadata?.role

    if (!role) {
        const queryClient = adminClient || supabase
        const { data: profile } = await queryClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle()
        role = profile?.role || 'customer'
    }

    if (role === 'admin') {
        await supabase.auth.signOut()
        return redirect(`/auth/login?error=${encodeURIComponent('Admins must use the Admin Portal.')}`)
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()
    const origin = (await headers()).get('origin')

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const firstName = formData.get('first-name') as string
    const lastName = formData.get('last-name') as string

    // Password validation
    if (password.length <= 8) {
        return redirect(`/auth/signup?error=${encodeURIComponent('Password must be longer than 8 characters')}`)
    }
    if (!/[A-Z]/.test(password)) {
        return redirect(`/auth/signup?error=${encodeURIComponent('Password must contain at least one uppercase letter')}`)
    }
    if (!/[a-z]/.test(password)) {
        return redirect(`/auth/signup?error=${encodeURIComponent('Password must contain at least one lowercase letter')}`)
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return redirect(`/auth/signup?error=${encodeURIComponent('Password must contain at least one special character')}`)
    }

    const fullName = `${firstName} ${lastName}`.trim()

    // 1. Try sending verification via Gmail SMTP using Supabase Admin link generator
    const supabaseAdmin = getAdminClient()
    if (supabaseAdmin) {
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'signup',
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: 'customer'
                },
                redirectTo: `${origin}/auth/callback?flow=signup`
            }
        })

        if (linkError) {
            console.error("Admin Signup Error:", linkError.message)
            return redirect(`/auth/signup?error=${encodeURIComponent(linkError.message)}`)
        }

        const confirmationUrl = linkData?.properties?.action_link
        if (confirmationUrl) {
            await sendConfirmationEmail({
                email,
                name: fullName,
                confirmationUrl
            })
        }

        // Auto-create customer record
        try {
            await supabaseAdmin.from('customers').insert({
                name: fullName,
                email: email,
            })
        } catch {
            // Ignore if already created or trigger handles it
        }

        revalidatePath('/', 'layout')
        return redirect('/auth/verify-email')
    }

    // 2. Fallback to client signup if admin key is not available
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                role: 'customer' // Default role
            },
            emailRedirectTo: `${origin}/auth/callback?flow=signup`
        },
    })

    if (error) {
        console.error("Signup Error:", error.message)
        return redirect(`/auth/signup?error=${encodeURIComponent(error.message)}`)
    }

    // If email confirmation is disabled, user is signed in immediately
    if (data.session) {
        // Automatically create a customer record
        const { error: customerError } = await supabase
            .from('customers')
            .insert({
                name: fullName,
                email: email,
            })
            .select() // Ensure we don't need the return value but select avoids error

        if (customerError) {
            console.error("Auto Customer Creation Error:", customerError)
        }

        sendWelcomeEmail(email, fullName).catch(e => console.error(e))
        revalidatePath('/', 'layout')
        redirect('/dashboard')
    }

    revalidatePath('/', 'layout')
    redirect('/auth/verify-email')
}

export async function loginWithGoogle() {
    const supabase = await createClient()
    const origin = (await headers()).get('origin')

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${origin}/auth/callback?flow=google-signup`,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        },
    })

    if (error) {
        console.error(error)
        redirect('/auth/login?error=Could not authenticate with Google')
    }

    if (data.url) {
        redirect(data.url)
    }
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/')
}

export async function forgotPassword(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string
    // Robust URL resolution for Vercel/Prod
    let origin = process.env.NEXT_PUBLIC_APP_URL ??
        process.env.NEXT_PUBLIC_VERCEL_URL ??
        'http://localhost:3000'
    origin = origin.includes('http') ? origin : `https://${origin}`
    origin = origin.endsWith('/') ? origin.slice(0, -1) : origin

    // 1. Try sending password reset via Gmail SMTP using Admin link generator
    const supabaseAdmin = getAdminClient()
    if (supabaseAdmin) {
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'recovery',
            email,
            options: {
                redirectTo: `${origin}/auth/callback?next=/auth/update-password`
            }
        })

        if (!linkError && linkData?.properties?.action_link) {
            const userName = linkData.user?.user_metadata?.full_name || 'Valued User'
            await sendPasswordResetEmail({
                email,
                name: userName,
                resetUrl: linkData.properties.action_link
            })
        } else if (linkError) {
            console.warn("Password reset link generation notice:", linkError.message)
        }

        return redirect('/auth/forgot-password?message=Check your email for the reset link')
    }

    // 2. Fallback to client reset request if admin key is not available
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
    })

    if (error) {
        console.error("Forgot Password Error:", error.message)
        return redirect(`/auth/forgot-password?error=${encodeURIComponent(error.message)}`)
    }

    return redirect('/auth/forgot-password?message=Check your email for the reset link')
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient()
    const password = formData.get('password') as string

    const { error } = await supabase.auth.updateUser({
        password: password
    })

    if (error) {
        return redirect(`/auth/update-password?error=${encodeURIComponent(error.message)}`)
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}
