
'use client'

import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import { sendInvoiceManually } from "./actions"
import { toast } from "sonner"
import { useState } from "react"

export default function SendInvoiceButton({
    invoiceId,
    customerEmail
}: {
    invoiceId: string
    customerEmail?: string
}) {
    const [sending, setSending] = useState(false)

    const handleSend = async () => {
        if (!customerEmail) {
            toast.error('Customer email not found')
            return
        }

        setSending(true)
        const result = await sendInvoiceManually(invoiceId)
        setSending(false)

        if (result.success) {
            toast.success(`Invoice sent to ${customerEmail}`)
        } else {
            toast.error(result.error || 'Failed to send invoice')
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleSend}
            disabled={sending || !customerEmail}
            title={customerEmail ? `Send to ${customerEmail}` : 'No email available'}
        >
            <Mail className="h-4 w-4" />
            {sending ? 'Sending...' : 'Send'}
        </Button>
    )
}
