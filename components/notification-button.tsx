'use client'

import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import { toast } from "sonner"

export function NotificationButton() {
    return (
        <Button
            variant="outline"
            size="icon"
            className="ml-auto h-8 w-8"
            onClick={() => toast.info('No new notifications', { description: "You're all caught up!" })}
        >
            <Bell className="h-4 w-4" />
            <span className="sr-only">Toggle notifications</span>
        </Button>
    )
}
