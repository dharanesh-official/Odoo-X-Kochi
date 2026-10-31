import { createClient } from '@/utils/supabase/server'

export class AuthError extends Error {
    constructor(message: string = 'Forbidden: Admin privileges required') {
        super(message)
        this.name = 'AuthError'
    }
}

/**
 * Validates that the current request is authenticated and belongs to an admin.
 * Throws AuthError if unauthenticated or unauthorized.
 * Returns the authenticated user profile and initialized Supabase server client.
 */
export async function requireAdmin() {
    const supabase = await createClient()

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
        throw new AuthError('Unauthorized: Please log in to proceed')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('id', user.id)
        .maybeSingle()

    const role = profile?.role || (user as any).app_metadata?.role || (user as any).user_metadata?.role

    if (role !== 'admin') {
        throw new AuthError('Forbidden: Admin privileges required')
    }

    return { user, profile, supabase }
}
