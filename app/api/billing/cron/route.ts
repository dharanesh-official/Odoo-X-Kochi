import { NextRequest, NextResponse } from "next/server"
import { executeBillingRun } from "@/lib/billing-engine"

export const dynamic = 'force-dynamic'

/**
 * Endpoint for running automated recurring billing.
 * Accepts GET or POST. Supports CRON_SECRET authorization header if configured.
 */
export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization')
        const cronSecret = process.env.CRON_SECRET

        // If CRON_SECRET is configured, enforce Bearer authorization
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized: Invalid Cron Secret' }, { status: 401 })
        }

        const runResult = await executeBillingRun()
        return NextResponse.json({
            success: true,
            result: runResult,
        })
    } catch (error: any) {
        console.error('API Billing Cron Error:', error)
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal server error during billing run',
        }, { status: 500 })
    }
}

export async function GET(req: NextRequest) {
    return POST(req)
}
