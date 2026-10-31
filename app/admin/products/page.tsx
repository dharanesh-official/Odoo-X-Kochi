
import { createAdminClient } from "@/utils/supabase/admin"
export const dynamic = 'force-dynamic'
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import { Plus } from "lucide-react"
import DeleteProductButton from "./delete-button"

export default async function ProductsPage() {
    const supabase = createAdminClient()

    const { data: products } = await supabase
        .from('products')
        .select(`
            *,
            product_attributes (
                name,
                product_attribute_values (value, price_extra)
            )
        `)
        .order('created_at', { ascending: false })

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Products</h1>
                <Link href="/admin/products/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Product
                    </Button>
                </Link>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Price (INR)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!products || products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No products found.
                                </TableCell>
                            </TableRow>
                        ) : (products.map((product: any) => (
                            <TableRow key={product.id}>
                                <TableCell className="font-medium">
                                    <div>{product.name}</div>
                                    {product.product_attributes && product.product_attributes.length > 0 && (
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                            {product.product_attributes.map((attr: any) => (
                                                <span key={attr.name}>
                                                    {attr.name}: {attr.product_attribute_values?.map((v: any) => v.value).join(', ')}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="capitalize">{product.type}</TableCell>
                                <TableCell>{product.sales_price ? `₹${product.sales_price}` : '-'}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {product.active ? 'Active' : 'Inactive'}
                                    </span>
                                </TableCell>
                                <TableCell>{new Date(product.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Link href={`/admin/products/${product.id}/edit`}>
                                            <Button variant="ghost" size="sm">Edit</Button>
                                        </Link>
                                        <DeleteProductButton id={product.id} />
                                    </div>
                                </TableCell>
                            </TableRow>
                        )))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
