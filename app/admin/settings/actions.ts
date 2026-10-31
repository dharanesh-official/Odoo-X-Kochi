'use server'

import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getSettings() {
    try {
        const { supabase } = await requireAdmin()
        const { data, error } = await supabase.from('settings').select('*')

        if (error) {
            console.warn('Settings table might be missing or inaccessible:', error.message)
            return {}
        }

        // Convert array to object for easier use
        const settingsObj: Record<string, string> = {}
        data?.forEach(s => {
            if (s.key) settingsObj[s.key] = s.value
        })
        return settingsObj
    } catch (error) {
        console.error('Error in getSettings:', error)
        return {}
    }
}

export async function updateSettings(formData: FormData) {
    try {
        const { supabase } = await requireAdmin()

        const settingsToUpdate = [
            'company_name',
            'default_currency',
            'auto_invoice',
            'send_welcome_email'
        ]

        for (const key of settingsToUpdate) {
            let value = formData.get(key) as string

            // Handle switches/checkboxes which might be null if off
            if ((key === 'auto_invoice' || key === 'send_welcome_email') && !value) {
                value = 'false'
            } else if (value === 'on') {
                value = 'true'
            }

            if (value !== null && value !== undefined) {
                const { error } = await supabase.from('settings').upsert({
                    key,
                    value,
                    updated_at: new Date().toISOString()
                })
                if (error) throw error
            }
        }

        revalidatePath('/admin/settings')
        return { success: true }
    } catch (error: any) {
        console.error('Error updating settings:', error)
        return { success: false, error: error.message }
    }
}
