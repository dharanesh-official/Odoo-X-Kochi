
import { Loader2 } from "lucide-react"

export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center gap-4 p-8 rounded-lg bg-background border shadow-xl">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <div className="flex flex-col items-center gap-1">
                    <p className="text-lg font-semibold text-foreground">Processing...</p>
                    <p className="text-sm text-muted-foreground animate-pulse">Please wait...</p>
                </div>
            </div>
        </div>
    )
}
