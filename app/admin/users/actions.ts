'use server'

import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/utils/supabase/admin'

export async function getUsers() {
    await requireAdmin()
    try {
        const adminSb = createAdminClient()
        const { data: users, error } = await adminSb
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching users from profiles:', error.message)
            return []
        }
        return users || []
    } catch (err: any) {
        console.error('getUsers error:', err?.message || err)
        return []
    }
}

export async function updateUserRole(userId: string, role: 'admin' | 'internal' | 'customer') {
    await requireAdmin()
    try {
        const adminSb = createAdminClient()
        const { error } = await adminSb
            .from('profiles')
            .update({ role })
            .eq('id', userId)

        if (error) {
            console.error('Error updating role:', error.message)
            return { error: error.message }
        }

        // Also update Supabase auth metadata to ensure JWT synchronization
        await adminSb.auth.admin.updateUserById(userId, {
            user_metadata: { role },
            app_metadata: { role }
        }).catch((e) => console.warn('Could not sync auth metadata for user:', userId, e?.message))

        revalidatePath('/admin/users')
        return { success: true }
    } catch (err: any) {
        console.error('updateUserRole exception:', err?.message || err)
        return { error: err?.message || 'Failed to update user role' }
    }
}

export async function createInternalUser(email: string, fullName: string, role: 'admin' | 'internal') {
    await requireAdmin()
    return { error: "User must sign up first; Admin can then promote to Internal/Admin role." }
}

export async function promoteByEmail(email: string, role: 'admin' | 'internal') {
    await requireAdmin()
    try {
        const adminSb = createAdminClient()
        const { data: profile, error: findError } = await adminSb
            .from('profiles')
            .select('id')
            .ilike('email', email.trim())
            .maybeSingle()

        if (findError || !profile) {
            return { error: 'No registered user found with this email. They must sign up first.' }
        }

        const { error: updateError } = await adminSb
            .from('profiles')
            .update({ role })
            .eq('id', profile.id)

        if (updateError) {
            return { error: updateError.message }
        }

        // Sync auth metadata
        await adminSb.auth.admin.updateUserById(profile.id, {
            user_metadata: { role },
            app_metadata: { role }
        }).catch((e) => console.warn('Could not sync auth metadata for user:', profile.id, e?.message))

        revalidatePath('/admin/users')
        return { success: true }
    } catch (err: any) {
        console.error('promoteByEmail exception:', err?.message || err)
        return { error: err?.message || 'Failed to promote user' }
    }
}
