import CreateSubscriptionForm from './create-form'
import { createClient } from '@/utils/supabase/server'
export const dynamic = 'force-dynamic'

export default async function NewSubscriptionPage() {
    const supabase = await createClient()

    const [customers, plans, templates] = await Promise.all([
        supabase.from('customers').select('id, name, email').order('created_at', { ascending: false }),
        supabase.from('plans').select('id, name, amount, interval, product_id, products(name)').eq('active', true).order('created_at', { ascending: false }),
        supabase.from('quotation_templates').select('*, quotation_template_lines(*)').eq('active', true)
    ])

    return (
        <CreateSubscriptionForm
            customers={customers.data || []}
            plans={plans.data || []}
            templates={templates.data || []}
        />
    )
}
