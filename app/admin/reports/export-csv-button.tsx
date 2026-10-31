'use client'

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface ReportExportData {
    summary: {
        totalRevenue: number
        pendingRevenue: number
        activeSubs: number
        overdueInvoices: number
    }
    topCustomers: Array<{ name: string; total: number }>
}

export function ExportCsvButton({ data }: { data: ReportExportData }) {
    const handleDownload = () => {
        let csvContent = "data:text/csv;charset=utf-8,"

        // Summary Section
        csvContent += "=== FINANCIAL & OPS SUMMARY ===\r\n"
        csvContent += "Metric,Value\r\n"
        csvContent += `Settled Revenue,${data.summary.totalRevenue}\r\n`
        csvContent += `Outstanding Revenue,${data.summary.pendingRevenue}\r\n`
        csvContent += `Active Subscriptions,${data.summary.activeSubs}\r\n`
        csvContent += `Overdue Invoices,${data.summary.overdueInvoices}\r\n\r\n`

        // Top Customers Section
        csvContent += "=== TOP CUSTOMERS BY REVENUE ===\r\n"
        csvContent += "Customer Name,Total Settled (INR)\r\n"
        data.topCustomers.forEach((c) => {
            csvContent += `"${c.name.replace(/"/g, '""')}",${c.total}\r\n`
        })

        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `financial_report_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <Button onClick={handleDownload} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
        </Button>
    )
}
