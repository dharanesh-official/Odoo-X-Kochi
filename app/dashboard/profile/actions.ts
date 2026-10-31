'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateCustomerProfile(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) {
        return { error: 'Unauthorized' }
    }

    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string

    if (!name || name.trim().length === 0) {
        return { error: 'Name is required' }
    }

    const updatePayload: Record<string, any> = {
        name: name.trim()
    }
    if (phone !== null) updatePayload.phone = phone.trim()
    if (address !== null) updatePayload.address = address.trim()

    const { error } = await supabase
        .from('customers')
        .update(updatePayload)
        .eq('email', user.email)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/profile')
    return { success: true }
}
