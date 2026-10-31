'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { triggerManualBillingRun } from "./actions"
import { toast } from "sonner"
import { Play, Loader2 } from "lucide-react"

export default function RunBillingButton() {
    const [loading, setLoading] = useState(false)

    const handleRun = async () => {
        setLoading(true)
        try {
            const res = await triggerManualBillingRun()
            if (res.success && res.result) {
                const { totalEvaluated, invoicesGenerated, skippedCount, failedCount } = res.result
                if (invoicesGenerated > 0) {
                    toast.success(`Billing Run Completed: ${invoicesGenerated} invoices generated (${skippedCount} up-to-date, ${failedCount} failed).`)
                } else if (totalEvaluated === 0) {
                    toast.info("No active subscriptions currently due for renewal.")
                } else {
                    toast.info(`Billing Run Completed: ${skippedCount} subscriptions up-to-date.`)
                }
            } else {
                toast.error("Failed to execute billing run.")
            }
        } catch (e: any) {
            toast.error(e.message || "An error occurred during billing execution.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleRun}
            disabled={loading}
            className="gap-2 border-primary/20 hover:bg-primary/10"
            title="Execute automated recurring billing cycle run for due subscriptions"
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Play className="h-3.5 w-3.5 text-primary fill-primary" />}
            {loading ? 'Processing Billing...' : 'Run Billing Cycle'}
        </Button>
    )
}
