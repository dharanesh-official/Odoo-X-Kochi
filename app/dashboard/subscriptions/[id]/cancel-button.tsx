'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { cancelCustomerSubscription } from "../actions"
import { toast } from "sonner"
import { Loader2, AlertTriangle } from "lucide-react"

export default function CancelSubscriptionButton({ subscriptionId }: { subscriptionId: string }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleCancel = async () => {
        setLoading(true)
        try {
            const res = await cancelCustomerSubscription(subscriptionId)
            if (res.success) {
                toast.success('Your subscription has been cancelled.')
                setOpen(false)
            } else {
                toast.error(res.error || 'Failed to cancel subscription.')
            }
        } catch (e) {
            toast.error('An unexpected error occurred.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" className="w-full sm:w-auto">
                    Cancel Subscription
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-destructive mb-2">
                        <AlertTriangle className="h-5 w-5" />
                        <DialogTitle>Cancel Subscription</DialogTitle>
                    </div>
                    <DialogDescription>
                        Are you sure you want to cancel this subscription? You will lose access to premium recurring features at the end of your current period.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Keep Subscription
                    </Button>
                    <Button variant="destructive" onClick={handleCancel} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm Cancellation
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
