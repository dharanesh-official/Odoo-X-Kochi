'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

export default function PrintInvoiceButton({ invoiceId }: { invoiceId?: string }) {
    if (!invoiceId) {
        // Fallback for list view button, though ideally we print individual invoices
        return (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.print()}>
                <Printer className="h-4 w-4" />
            </Button>
        )
    }

    return (
        <Link href={`/admin/invoices/${invoiceId}`} onClick={(e) => {
            // Optional: could try to wait for nav then print, but simpler to let user click print on details page
            // or, we open in new tab and auto print?
            // For now, let's just make sure they go to the printable page if they click a print icon in the row
        }}>
            <Button variant="ghost" size="icon" className="h-8 w-8" title="View & Print">
                <Printer className="h-4 w-4" />
            </Button>
        </Link>
    )
}
