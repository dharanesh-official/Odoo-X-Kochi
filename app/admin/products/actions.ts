
'use server'

import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProduct(formData: FormData) {
    const { supabase } = await requireAdmin()

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const type = formData.get('type') as string
    const active = formData.get('active') === 'on'
    const salesVal = Number(formData.get('sales_price'))
    const costVal = Number(formData.get('cost_price'))
    const salesPrice = isNaN(salesVal) ? 0 : salesVal
    const costPrice = isNaN(costVal) ? 0 : costVal

    if (!name) {
        return redirect('/admin/products/new?error=Name is required')
    }

    const { data: product, error } = await supabase.from('products').insert({
        name,
        description,
        type: type || 'service',
        active,
        sales_price: salesPrice,
        cost_price: costPrice,
    }).select().single()

    if (error) {
        console.error('Create product error:', error)
        return redirect('/admin/products/new?error=Could not create product')
    }

    // Handle Attributes
    const attrName = (formData.get('attribute_name') as string)?.trim()
    const attrValues = (formData.get('attribute_values') as string)?.trim()
    const extraPrice = Number(formData.get('extra_price') || 0)

    if (attrName && attrValues) {
        const { data: attr, error: attrError } = await supabase.from('product_attributes').insert({
            product_id: product.id,
            name: attrName
        }).select().single()

        if (attrError) {
            console.error('Create product attribute error:', attrError)
        } else if (attr) {
            const values = attrValues.split(',').map(v => v.trim()).filter(Boolean)
            for (const val of values) {
                await supabase.from('product_attribute_values').insert({
                    attribute_id: attr.id,
                    value: val,
                    price_extra: extraPrice
                })
            }
        }
    }

    revalidatePath('/admin/products')
    redirect('/admin/products')
}

export async function updateProduct(id: string, formData: FormData) {
    const { supabase } = await requireAdmin()

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const type = formData.get('type') as string
    const active = formData.get('active') === 'on'
    const salesVal = Number(formData.get('sales_price'))
    const costVal = Number(formData.get('cost_price'))
    // Ensure numeric
    const salesPrice = isNaN(salesVal) ? 0 : salesVal
    const costPrice = isNaN(costVal) ? 0 : costVal

    const { data: updated, error } = await supabase.from('products').update({
        name,
        description,
        type,
        active,
        sales_price: salesPrice,
        cost_price: costPrice,
    }).eq('id', id).select()

    if (error || !updated || updated.length === 0) {
        console.error('Update product error:', error || 'No Permission or ID not found')
        return redirect('/admin/products?error=Update failed. Check permissions.')
    }

    // Handle Attributes
    const attrName = (formData.get('attribute_name') as string)?.trim()
    const attrValues = (formData.get('attribute_values') as string)?.trim()
    const extraPrice = Number(formData.get('extra_price') || 0)

    if (attrName && attrValues) {
        // Check if an attribute already exists for this product
        const { data: existingAttr } = await supabase
            .from('product_attributes')
            .select('id')
            .eq('product_id', id)
            .maybeSingle()

        let targetAttrId = existingAttr?.id

        if (existingAttr) {
            await supabase
                .from('product_attributes')
                .update({ name: attrName })
                .eq('id', existingAttr.id)

            // Delete old values and insert fresh list
            await supabase
                .from('product_attribute_values')
                .delete()
                .eq('attribute_id', existingAttr.id)
        } else {
            const { data: newAttr, error: newAttrErr } = await supabase
                .from('product_attributes')
                .insert({
                    product_id: id,
                    name: attrName
                })
                .select()
                .single()

            if (newAttrErr) {
                console.error('New attribute creation error on update:', newAttrErr)
            } else {
                targetAttrId = newAttr?.id
            }
        }

        if (targetAttrId) {
            const values = attrValues.split(',').map(v => v.trim()).filter(Boolean)
            for (const val of values) {
                await supabase.from('product_attribute_values').insert({
                    attribute_id: targetAttrId,
                    value: val,
                    price_extra: extraPrice
                })
            }
        }
    } else if (formData.has('attribute_name') && !attrName) {
        // If attribute_name field was submitted empty, clear existing attributes for this product
        await supabase.from('product_attributes').delete().eq('product_id', id)
    }

    revalidatePath(`/admin/products/${id}/edit`)
    revalidatePath('/admin/products')
    redirect('/admin/products')
}

export async function deleteProduct(id: string) {
    const { supabase } = await requireAdmin()

    const { error } = await supabase.from('products').delete().eq('id', id)

    if (error) {
        console.error('Delete product error:', error)
        if (error.code === '23503') return { error: 'Product used in plans/subscriptions' }
        return { error: 'Could not delete product' }
    }

    revalidatePath('/admin/products')
    return { success: true }
}
