
import CreatePlanForm from './create-form'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export default async function NewPlanPage() {
    const supabase = await createClient()
    const { data: products } = await supabase.from('products').select('id, name').eq('active', true)

    const { data: discounts } = await supabase
        .from('discounts')
        .select('id, name, value, type, product_id, products(name)')
        .eq('active', true)

    return <CreatePlanForm products={products || []} discounts={discounts || []} />
}
