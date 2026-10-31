
'use client'

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteCustomer } from "./actions"
import { toast } from "sonner"

export default function DeleteCustomerButton({ id }: { id: string }) {
    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this customer? This action cannot be undone.")) {
            const result = await deleteCustomer(id)
            // @ts-ignore - Handle implicit any return
            if (result && result.error) {
                // @ts-ignore
                toast.error(`Delete failed: ${result.error}`)
            } else {
                toast.success("Customer deleted")
            }
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            title="Delete Customer"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    )
}
