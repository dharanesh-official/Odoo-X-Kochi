
'use client'

import { deletePlan } from "./actions"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"

export default function DeletePlanButton({ id }: { id: string }) {
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!confirm("Are you absolutely sure? This action cannot be undone.")) return;

        setLoading(true)
        const result = await deletePlan(id)
        setLoading(false)

        if (result && result.error) {
            toast.error(result.error)
        } else {
            toast.success('Plan deleted')
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={loading}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            title="Delete Plan"
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    )
}
