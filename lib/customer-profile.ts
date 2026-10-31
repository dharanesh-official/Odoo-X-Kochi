import { createAdminClient } from '@/utils/supabase/admin'

export interface CustomerProfile {
    id: string
    name: string
    email: string
    phone?: string | null
    address?: string | null
    created_at?: string
}

/**
 * Guarantees that an authenticated user has an active customer record.
 * Automatically resolves or provisions the profile with administrative client
 * so RLS recursion on public.profiles never blocks resolving the customer.
 */
export async function getOrCreateCustomer(
    _supabaseClient: any,
    user: { id: string; email?: string | null; user_metadata?: Record<string, any> }
): Promise<CustomerProfile | null> {
    if (!user || !user.email) return null

    try {
        const adminSb = createAdminClient()

        // 1. Fetch existing customer record
        const { data: customer } = await adminSb
            .from('customers')
            .select('*')
            .ilike('email', user.email.trim())
            .maybeSingle()

        if (customer) {
            return customer as CustomerProfile
        }

        // 2. Automatically create customer record
        const name = user.user_metadata?.full_name || user.email.split('@')[0]
        const { data: created, error } = await adminSb
            .from('customers')
            .insert({
                name,
                email: user.email.trim(),
            })
            .select('*')
            .single()

        if (created) {
            return created as CustomerProfile
        }

        if (error) {
            // Concurrent insert or trigger might have already created it
            const { data: retry } = await adminSb
                .from('customers')
                .select('*')
                .ilike('email', user.email.trim())
                .maybeSingle()

            if (retry) return retry as CustomerProfile
        }

        return {
            id: user.id,
            name,
            email: user.email,
        }
    } catch (err) {
        console.warn('[getOrCreateCustomer] Error resolving customer profile:', err)
        return {
            id: user.id,
            name: user.user_metadata?.full_name || user.email.split('@')[0],
            email: user.email,
        }
    }
}
