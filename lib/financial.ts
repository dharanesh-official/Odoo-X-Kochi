/**
 * Financial calculations and subscription period advancement engine.
 * Pure functions covering subtotal, discounts, taxes, totals, and billing interval schedules.
 */

export type SubscriptionInterval = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'

export interface LineItemInput {
    quantity: number
    unitPrice: number
    priceExtra?: number
    discountPercent?: number
}

export interface LineItemResult {
    quantity: number
    unitPrice: number
    effectiveUnitPrice: number
    subtotal: number
    discountAmount: number
    total: number
}

export interface DiscountInput {
    type: 'percent' | 'fixed'
    value: number
    minAmount?: number
    active?: boolean
    validFrom?: string | Date
    validUntil?: string | Date
    usageLimit?: number | null
    usedCount?: number
}

export interface DiscountResult {
    discountAmount: number
    discountedSubtotal: number
    isEligible: boolean
    reason?: string
}

export interface TaxInput {
    name?: string
    rate: number
    type?: 'percent' | 'fixed'
    isInclusive?: boolean
    active?: boolean
}

export interface TaxDetail {
    name: string
    rate: number
    amount: number
}

export interface TaxResult {
    totalTax: number
    taxDetails: TaxDetail[]
}

export interface InvoiceCalculationParams {
    lines: LineItemInput[]
    discount?: DiscountInput | null
    taxes?: TaxInput[] | TaxInput | null
}

export interface InvoiceTotalsResult {
    subtotal: number
    discountAmount: number
    taxableAmount: number
    taxAmount: number
    totalAmount: number
    taxDetails: TaxDetail[]
}

export interface SubscriptionCycleParams {
    startDate: Date | string
    interval: SubscriptionInterval
    cycleCount?: number
}

export interface SubscriptionCycleResult {
    currentPeriodStart: Date
    currentPeriodEnd: Date
    nextBillingDate: Date
    cycle: number
}

/**
 * Rounds a number to two decimal places using standard financial round-half-up.
 */
export function roundCurrency(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100
}

/**
 * Calculates a single line item total including optional variant extra price and item-level discount.
 */
export function calculateLineItem(line: LineItemInput): LineItemResult {
    const qty = Math.max(0, line.quantity || 0)
    const unitPrice = Math.max(0, line.unitPrice || 0)
    const priceExtra = Math.max(0, line.priceExtra || 0)
    const effectiveUnitPrice = roundCurrency(unitPrice + priceExtra)

    const rawSubtotal = qty * effectiveUnitPrice
    const discountPercent = Math.min(100, Math.max(0, line.discountPercent || 0))
    const discountAmount = roundCurrency(rawSubtotal * (discountPercent / 100))
    const total = roundCurrency(Math.max(0, rawSubtotal - discountAmount))

    return {
        quantity: qty,
        unitPrice,
        effectiveUnitPrice,
        subtotal: roundCurrency(rawSubtotal),
        discountAmount,
        total,
    }
}

/**
 * Calculates aggregated subtotal from multiple line items.
 */
export function calculateSubtotal(lines: LineItemInput[]): number {
    if (!lines || lines.length === 0) return 0
    const sum = lines.reduce((acc, line) => {
        const item = calculateLineItem(line)
        return acc + item.total
    }, 0)
    return roundCurrency(sum)
}

/**
 * Calculates coupon/order-level discount amount applied to a subtotal.
 */
export function calculateDiscount(
    subtotal: number,
    discount?: DiscountInput | null,
    now: Date = new Date()
): DiscountResult {
    const safeSubtotal = Math.max(0, subtotal || 0)

    if (!discount) {
        return {
            discountAmount: 0,
            discountedSubtotal: safeSubtotal,
            isEligible: true,
        }
    }

    if (discount.active === false) {
        return {
            discountAmount: 0,
            discountedSubtotal: safeSubtotal,
            isEligible: false,
            reason: 'Discount is inactive',
        }
    }

    if (discount.validFrom && new Date(discount.validFrom) > now) {
        return {
            discountAmount: 0,
            discountedSubtotal: safeSubtotal,
            isEligible: false,
            reason: 'Discount validity period has not started',
        }
    }

    if (discount.validUntil && new Date(discount.validUntil) < now) {
        return {
            discountAmount: 0,
            discountedSubtotal: safeSubtotal,
            isEligible: false,
            reason: 'Discount has expired',
        }
    }

    if (
        discount.usageLimit !== null &&
        discount.usageLimit !== undefined &&
        (discount.usedCount ?? 0) >= discount.usageLimit
    ) {
        return {
            discountAmount: 0,
            discountedSubtotal: safeSubtotal,
            isEligible: false,
            reason: 'Discount usage limit reached',
        }
    }

    const minAmount = discount.minAmount ?? 0
    if (safeSubtotal < minAmount) {
        return {
            discountAmount: 0,
            discountedSubtotal: safeSubtotal,
            isEligible: false,
            reason: `Minimum order amount of ₹${minAmount.toFixed(2)} required`,
        }
    }

    let rawDiscount = 0
    if (discount.type === 'percent') {
        const rate = Math.min(100, Math.max(0, discount.value || 0))
        rawDiscount = safeSubtotal * (rate / 100)
    } else {
        // fixed amount
        rawDiscount = Math.max(0, discount.value || 0)
    }

    // Cap discount so total cannot be negative
    const cappedDiscount = roundCurrency(Math.min(safeSubtotal, rawDiscount))
    const discountedSubtotal = roundCurrency(safeSubtotal - cappedDiscount)

    return {
        discountAmount: cappedDiscount,
        discountedSubtotal,
        isEligible: true,
    }
}

/**
 * Calculates tax on a given taxable amount.
 * Supports multiple tax rules (e.g., CGST + SGST) and both percent & fixed taxes.
 */
export function calculateTax(
    taxableAmount: number,
    taxes?: TaxInput[] | TaxInput | null
): TaxResult {
    const safeAmount = Math.max(0, taxableAmount || 0)
    if (!taxes) {
        return { totalTax: 0, taxDetails: [] }
    }

    const taxList = Array.isArray(taxes) ? taxes : [taxes]
    const activeTaxes = taxList.filter((t) => t.active !== false)

    const taxDetails: TaxDetail[] = []
    let totalTax = 0

    for (const tax of activeTaxes) {
        const rate = Math.max(0, tax.rate || 0)
        let amount = 0

        if (tax.type === 'fixed') {
            amount = rate
        } else {
            // Percent-based
            if (tax.isInclusive) {
                // Inclusive formula: tax = amount - (amount / (1 + rate / 100))
                amount = safeAmount - safeAmount / (1 + rate / 100)
            } else {
                // Exclusive formula: tax = amount * (rate / 100)
                amount = safeAmount * (rate / 100)
            }
        }

        const roundedAmount = roundCurrency(amount)
        totalTax += roundedAmount
        taxDetails.push({
            name: tax.name || `${rate}% Tax`,
            rate,
            amount: roundedAmount,
        })
    }

    return {
        totalTax: roundCurrency(totalTax),
        taxDetails,
    }
}

/**
 * Calculates complete invoice breakdown: subtotal, discount, taxable base, taxes, and final total.
 */
export function calculateInvoiceTotals({
    lines,
    discount,
    taxes,
}: InvoiceCalculationParams): InvoiceTotalsResult {
    const subtotal = calculateSubtotal(lines)
    const discountRes = calculateDiscount(subtotal, discount)
    const taxableAmount = discountRes.discountedSubtotal
    const taxRes = calculateTax(taxableAmount, taxes)
    const totalAmount = roundCurrency(taxableAmount + taxRes.totalTax)

    return {
        subtotal,
        discountAmount: discountRes.discountAmount,
        taxableAmount,
        taxAmount: taxRes.totalTax,
        totalAmount,
        taxDetails: taxRes.taxDetails,
    }
}

/**
 * Advances a date by a given subscription interval, accurately handling calendar
 * edge cases (e.g. Jan 31 -> Feb 28/29, leap years, etc.).
 */
export function advanceSubscriptionPeriod(
    currentDate: Date | string,
    interval: SubscriptionInterval,
    count: number = 1
): Date {
    const baseDate = new Date(currentDate)
    if (isNaN(baseDate.getTime())) {
        throw new Error(`Invalid date provided to advanceSubscriptionPeriod: ${currentDate}`)
    }

    const result = new Date(baseDate.getTime())

    switch (interval) {
        case 'daily': {
            result.setUTCDate(result.getUTCDate() + count)
            break
        }
        case 'weekly': {
            result.setUTCDate(result.getUTCDate() + count * 7)
            break
        }
        case 'monthly': {
            const originalDay = baseDate.getUTCDate()
            const targetMonth = baseDate.getUTCMonth() + count
            result.setUTCMonth(targetMonth, 1) // Set to 1st first to prevent month overflow

            // Determine max days in target month
            const year = result.getUTCFullYear()
            const month = result.getUTCMonth()
            const daysInTargetMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()

            // Clamp to last valid day of month (e.g. Jan 31 -> Feb 28)
            result.setUTCDate(Math.min(originalDay, daysInTargetMonth))
            break
        }
        case 'quarterly': {
            const originalDay = baseDate.getUTCDate()
            const targetMonth = baseDate.getUTCMonth() + count * 3
            result.setUTCMonth(targetMonth, 1)

            const year = result.getUTCFullYear()
            const month = result.getUTCMonth()
            const daysInTargetMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()

            result.setUTCDate(Math.min(originalDay, daysInTargetMonth))
            break
        }
        case 'yearly': {
            const originalDay = baseDate.getUTCDate()
            const originalMonth = baseDate.getUTCMonth()
            const targetYear = baseDate.getUTCFullYear() + count

            result.setUTCFullYear(targetYear, originalMonth, 1)
            const daysInTargetMonth = new Date(Date.UTC(targetYear, originalMonth + 1, 0)).getUTCDate()
            result.setUTCDate(Math.min(originalDay, daysInTargetMonth))
            break
        }
        default:
            throw new Error(`Unsupported subscription interval: ${interval}`)
    }

    return result
}

/**
 * Calculates subscription period bounds and next billing date for cycle N.
 */
export function calculateSubscriptionCycle({
    startDate,
    interval,
    cycleCount = 1,
}: SubscriptionCycleParams): SubscriptionCycleResult {
    const start = new Date(startDate)
    if (isNaN(start.getTime())) {
        throw new Error(`Invalid start date: ${startDate}`)
    }

    // Period starts at (cycleCount - 1) advances
    const periodStart = cycleCount <= 1
        ? start
        : advanceSubscriptionPeriod(start, interval, cycleCount - 1)

    const periodEnd = advanceSubscriptionPeriod(periodStart, interval, 1)
    const nextBillingDate = new Date(periodEnd.getTime())

    return {
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        nextBillingDate,
        cycle: cycleCount,
    }
}
