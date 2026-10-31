'use server'

import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getUsers() {
    const { supabase } = await requireAdmin()
    const { data: users, error } = await supabase.from('profiles').select('*')
    if (error) {
        console.error('Error fetching users:', error)
        return []
    }
    return users
}

export async function updateUserRole(userId: string, role: 'admin' | 'internal' | 'customer') {
    const { supabase } = await requireAdmin()
    const { error } = await supabase.from('profiles').update({ role }).eq('id', userId)
    if (error) {
        console.error('Error updating role:', error)
        return { error: error.message }
    }
    revalidatePath('/admin/users')
    return { success: true }
}

export async function createInternalUser(email: string, fullName: string, role: 'admin' | 'internal') {
    await requireAdmin()

    // In a real app, you would use supabase.auth.admin.createUser
    // For this demo/setup, we will assume the user manually signs up or we insert into profiles
    // But profiles is linked to auth.users, so we'll just handle the role update for now

    return { error: "User must sign up first; Admin can then promote to Internal/Admin role." }
}

export async function promoteByEmail(email: string, role: 'admin' | 'internal') {
    const { supabase } = await requireAdmin()
    const { data: profile, error: findError } = await supabase.from('profiles').select('id').eq('email', email).single()
    if (findError || !profile) return { error: 'No user found with this email. They must sign up first.' }

    const { error: updateError } = await supabase.from('profiles').update({ role }).eq('id', profile.id)
    if (updateError) return { error: updateError.message }

    revalidatePath('/admin/users')
    return { success: true }
}
