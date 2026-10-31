
'use client'

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteProduct } from "./actions"
import { toast } from "sonner"

export default function DeleteProductButton({ id }: { id: string }) {
    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
            // @ts-ignore
            const result = await deleteProduct(id)
            if (result && result.error) {
                toast.error(`Delete failed: ${result.error}`)
            } else {
                toast.success("Product deleted")
            }
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            title="Delete Product"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    )
}
