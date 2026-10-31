
import { createClient } from "@/utils/supabase/server"
import EditCustomerForm from "../../edit-form"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: customer } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single()

    if (!customer) {
        notFound()
    }

    return <EditCustomerForm customer={customer} />
}
