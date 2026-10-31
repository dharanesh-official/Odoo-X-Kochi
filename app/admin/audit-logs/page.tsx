import { createClient } from "@/utils/supabase/server"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ShieldCheck, History } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function AuditLogsPage() {
    const supabase = await createClient()

    let logs: any[] = []
    let tableExists = true

    try {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100)

        if (error) {
            tableExists = false
        } else {
            logs = data || []
        }
    } catch {
        tableExists = false
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <ShieldCheck className="h-7 w-7 text-primary" />
                        System Audit Logs
                    </h1>
                    <p className="text-muted-foreground">
                        Traceability and compliance record of financial actions, billing cycles, and status changes.
                    </p>
                </div>
            </div>

            <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-48">Timestamp</TableHead>
                            <TableHead className="w-32">Entity</TableHead>
                            <TableHead className="w-36">Action</TableHead>
                            <TableHead>Performed By</TableHead>
                            <TableHead>Entity Ref</TableHead>
                            <TableHead className="text-right">Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!tableExists || logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                    <History className="h-8 w-8 mx-auto mb-2 opacity-40" />
                                    {tableExists
                                        ? "No audit events logged yet. Events will record automatically as actions occur."
                                        : "Audit log table is pending database initialization."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            logs.map((log) => (
                                <TableRow key={log.id} className="hover:bg-muted/30">
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        {new Date(log.created_at).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize text-xs">
                                            {log.entity_type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium text-sm">
                                        <span className="px-2 py-0.5 rounded bg-muted text-xs font-mono">
                                            {log.action}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {log.performed_by || 'system'}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        {log.entity_id ? log.entity_id.slice(0, 8) + '...' : '-'}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-xs text-muted-foreground">
                                        {log.details ? JSON.stringify(log.details).slice(0, 40) + '...' : '-'}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
