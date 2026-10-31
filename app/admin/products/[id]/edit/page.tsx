
import { createClient } from "@/utils/supabase/server"
import EditProductForm from "../../edit-form"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: product } = await supabase
        .from('products')
        .select(`
            *,
            product_attributes (
                *,
                product_attribute_values (*)
            )
        `)
        .eq('id', id)
        .single()

    if (!product) {
        notFound()
    }

    return <EditProductForm product={product} />
}
