
import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import EditPlanForm from "./edit-form"

export const dynamic = 'force-dynamic'

export default async function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: plan } = await supabase
        .from('plans')
        .select(`
            *,
            products (
                name,
                type
            )
        `)
        .eq('id', id)
        .single()

    if (!plan) {
        notFound()
    }

    const { data: discounts } = await supabase
        .from('discounts')
        .select('id, name, value, type, product_id, products(name)')
        .eq('active', true)

    return <EditPlanForm plan={plan} discounts={discounts || []} />
}
