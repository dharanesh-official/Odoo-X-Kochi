import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export class AuthError extends Error {
    constructor(message: string = 'Forbidden: Admin privileges required') {
        super(message)
        this.name = 'AuthError'
    }
}

/**
 * Validates that the current request is authenticated and belongs to an admin.
 * Throws AuthError if unauthenticated or unauthorized.
 * Returns the authenticated user profile and initialized Supabase admin client.
 */
export async function requireAdmin() {
    const userClient = await createClient()

    const {
        data: { user },
        error: userError,
    } = await userClient.auth.getUser()

    if (userError || !user) {
        throw new AuthError('Unauthorized: Please log in to proceed')
    }

    const adminClient = createAdminClient()

    const { data: profile } = await adminClient
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('id', user.id)
        .maybeSingle()

    const role = profile?.role || (user as any).app_metadata?.role || (user as any).user_metadata?.role

    if (role !== 'admin') {
        throw new AuthError('Forbidden: Admin privileges required')
    }

    return { user, profile, supabase: adminClient, userClient, admin: adminClient }
}
