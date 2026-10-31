
'use client'

import { Button } from "@/components/ui/button"
import { Printer, Send } from "lucide-react"
import { toast } from "sonner"
import { sendInvoiceManually } from "../actions"
import { useState } from "react"
import { useParams } from "next/navigation"

export default function InvoiceActions({ customerEmail }: { customerEmail?: string }) {
    const [sending, setSending] = useState(false)
    const params = useParams()
    const invoiceId = params.id as string

    const handlePrint = () => {
        window.print()
    }

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
        <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <Button
                onClick={handleSend}
                disabled={sending || !customerEmail}
            >
                <Send className="mr-2 h-4 w-4" />
                {sending ? 'Sending...' : 'Send'}
            </Button>
        </div>
    )
}
