import { createClient } from '@/utils/supabase/server'

export interface AuditLogInput {
    entityType: 'subscription' | 'invoice' | 'payment' | 'product' | 'customer' | 'tax' | 'discount' | 'quotation' | 'billing'
    entityId?: string | null
    action: string
    performedBy?: string | null
    details?: Record<string, any> | null
}

/**
 * Records an audit log event in the database.
 * Fails gracefully if audit_logs table is not yet provisioned.
 */
export async function logAuditEvent(input: AuditLogInput) {
    try {
        const supabase = await createClient()

        let performedBy = input.performedBy
        if (!performedBy) {
            const { data: { user } } = await supabase.auth.getUser()
            performedBy = user?.email || 'system'
        }

        const { error } = await supabase.from('audit_logs').insert({
            entity_type: input.entityType,
            entity_id: input.entityId || null,
            action: input.action,
            performed_by: performedBy,
            details: input.details || null,
            created_at: new Date().toISOString()
        })

        if (error) {
            console.warn('[AuditLog] Notice - table may need creation:', error.message)
        }
    } catch (err: any) {
        console.warn('[AuditLog] Error writing audit log:', err?.message || err)
    }
}
