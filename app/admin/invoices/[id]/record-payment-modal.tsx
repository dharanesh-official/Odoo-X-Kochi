'use client'

import { useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { recordPayment } from "../actions"
import { toast } from "sonner"
import { Loader2, Landmark } from "lucide-react"

export default function RecordPaymentModal({ invoiceId, amountDue }: { invoiceId: string, amountDue: number }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        try {
            const res = await recordPayment(invoiceId, formData)
            if (res.success) {
                toast.success("Payment recorded successfully")
                setOpen(false)
            } else {
                toast.error(res.error || "Failed to record payment")
            }
        } catch (e) {
            toast.error("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Landmark className="h-4 w-4" /> Record Payment
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Record Payment</DialogTitle>
                    <DialogDescription>
                        Enter payment details for this invoice. Amount due is {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amountDue)}.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="amount">Amount Collected (₹)</Label>
                        <Input
                            id="amount"
                            name="amount"
                            type="number"
                            defaultValue={amountDue}
                            step="0.01"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="method">Payment Method</Label>
                        <Select name="method" defaultValue="bank_transfer">
                            <SelectTrigger>
                                <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                <SelectItem value="upi">UPI / GPay</SelectItem>
                                <SelectItem value="credit_card">Credit Card</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="transaction_id">Transaction ID / Reference</Label>
                        <Input id="transaction_id" name="transaction_id" placeholder="TXN123456" />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Post Payment
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
