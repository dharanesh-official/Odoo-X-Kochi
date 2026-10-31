import { describe, it, expect } from 'vitest'
import {
    calculateLineItem,
    calculateSubtotal,
    calculateDiscount,
    calculateTax,
    calculateInvoiceTotals,
    roundCurrency,
} from '@/lib/financial'

describe('Financial Calculations Engine', () => {
    describe('roundCurrency', () => {
        it('rounds values to two decimal places accurately', () => {
            expect(roundCurrency(10.004)).toBe(10)
            expect(roundCurrency(10.005)).toBe(10.01)
            expect(roundCurrency(123.456)).toBe(123.46)
            expect(roundCurrency(0)).toBe(0)
        })
    })

    describe('calculateLineItem', () => {
        it('calculates line item subtotal without variant or discount', () => {
            const item = calculateLineItem({
                quantity: 3,
                unitPrice: 150.0,
            })
            expect(item.quantity).toBe(3)
            expect(item.effectiveUnitPrice).toBe(150.0)
            expect(item.subtotal).toBe(450.0)
            expect(item.discountAmount).toBe(0)
            expect(item.total).toBe(450.0)
        })

        it('includes variant price_extra into effective unit price', () => {
            const item = calculateLineItem({
                quantity: 2,
                unitPrice: 200.0,
                priceExtra: 50.0,
            })
            expect(item.effectiveUnitPrice).toBe(250.0)
            expect(item.subtotal).toBe(500.0)
            expect(item.total).toBe(500.0)
        })

        it('applies line-level discount percentage correctly', () => {
            const item = calculateLineItem({
                quantity: 4,
                unitPrice: 100.0,
                discountPercent: 10, // 10% discount
            })
            expect(item.subtotal).toBe(400.0)
            expect(item.discountAmount).toBe(40.0)
            expect(item.total).toBe(360.0)
        })

        it('handles zero or negative inputs defensively', () => {
            const item = calculateLineItem({
                quantity: -2,
                unitPrice: -50,
            })
            expect(item.quantity).toBe(0)
            expect(item.subtotal).toBe(0)
            expect(item.total).toBe(0)
        })
    })

    describe('calculateSubtotal', () => {
        it('aggregates multiple line items with different quantities and prices', () => {
            const lines = [
                { quantity: 2, unitPrice: 100 }, // 200
                { quantity: 1, unitPrice: 350, priceExtra: 50 }, // 400
                { quantity: 3, unitPrice: 50, discountPercent: 20 }, // 150 - 30 = 120
            ]
            const subtotal = calculateSubtotal(lines)
            expect(subtotal).toBe(720.0)
        })

        it('returns 0 for empty line items array', () => {
            expect(calculateSubtotal([])).toBe(0)
        })
    })

    describe('calculateDiscount', () => {
        it('returns zero discount if no discount is provided', () => {
            const res = calculateDiscount(500, null)
            expect(res.discountAmount).toBe(0)
            expect(res.discountedSubtotal).toBe(500)
            expect(res.isEligible).toBe(true)
        })

        it('calculates percentage discount accurately', () => {
            const res = calculateDiscount(1000, {
                type: 'percent',
                value: 15, // 15% of 1000 = 150
            })
            expect(res.discountAmount).toBe(150.0)
            expect(res.discountedSubtotal).toBe(850.0)
            expect(res.isEligible).toBe(true)
        })

        it('calculates fixed discount accurately', () => {
            const res = calculateDiscount(1000, {
                type: 'fixed',
                value: 200,
            })
            expect(res.discountAmount).toBe(200.0)
            expect(res.discountedSubtotal).toBe(800.0)
            expect(res.isEligible).toBe(true)
        })

        it('caps discount at subtotal to prevent negative totals', () => {
            const res = calculateDiscount(150, {
                type: 'fixed',
                value: 500,
            })
            expect(res.discountAmount).toBe(150.0)
            expect(res.discountedSubtotal).toBe(0)
            expect(res.isEligible).toBe(true)
        })

        it('enforces min_purchase_amount requirement', () => {
            const res = calculateDiscount(300, {
                type: 'fixed',
                value: 100,
                minAmount: 500,
            })
            expect(res.isEligible).toBe(false)
            expect(res.discountAmount).toBe(0)
            expect(res.discountedSubtotal).toBe(300)
            expect(res.reason).toContain('Minimum order amount')
        })

        it('rejects inactive discount coupons', () => {
            const res = calculateDiscount(1000, {
                type: 'percent',
                value: 20,
                active: false,
            })
            expect(res.isEligible).toBe(false)
            expect(res.discountAmount).toBe(0)
            expect(res.reason).toContain('inactive')
        })

        it('rejects expired discounts', () => {
            const pastDate = new Date('2020-01-01T00:00:00Z')
            const now = new Date('2026-01-01T00:00:00Z')
            const res = calculateDiscount(
                1000,
                {
                    type: 'percent',
                    value: 20,
                    validUntil: pastDate,
                },
                now
            )
            expect(res.isEligible).toBe(false)
            expect(res.discountAmount).toBe(0)
            expect(res.reason).toContain('expired')
        })

        it('rejects discounts that have not yet started', () => {
            const futureDate = new Date('2027-01-01T00:00:00Z')
            const now = new Date('2026-01-01T00:00:00Z')
            const res = calculateDiscount(
                1000,
                {
                    type: 'percent',
                    value: 20,
                    validFrom: futureDate,
                },
                now
            )
            expect(res.isEligible).toBe(false)
            expect(res.discountAmount).toBe(0)
            expect(res.reason).toContain('not started')
        })

        it('rejects discounts exceeding usage limits', () => {
            const res = calculateDiscount(1000, {
                type: 'fixed',
                value: 50,
                usageLimit: 10,
                usedCount: 10,
            })
            expect(res.isEligible).toBe(false)
            expect(res.discountAmount).toBe(0)
            expect(res.reason).toContain('usage limit reached')
        })
    })

    describe('calculateTax', () => {
        it('calculates standard exclusive percentage tax', () => {
            const res = calculateTax(1000, {
                name: 'GST 18%',
                rate: 18,
            })
            expect(res.totalTax).toBe(180.0)
            expect(res.taxDetails).toHaveLength(1)
            expect(res.taxDetails[0].amount).toBe(180.0)
        })

        it('calculates multiple combined taxes (e.g. CGST 9% + SGST 9%)', () => {
            const res = calculateTax(1000, [
                { name: 'CGST 9%', rate: 9 },
                { name: 'SGST 9%', rate: 9 },
            ])
            expect(res.totalTax).toBe(180.0)
            expect(res.taxDetails).toHaveLength(2)
            expect(res.taxDetails[0].amount).toBe(90.0)
            expect(res.taxDetails[1].amount).toBe(90.0)
        })

        it('calculates inclusive tax correctly', () => {
            // For 118 inclusive with 18% tax: base = 100, tax = 18
            const res = calculateTax(118, {
                name: 'VAT Included',
                rate: 18,
                isInclusive: true,
            })
            expect(res.totalTax).toBe(18.0)
        })

        it('calculates fixed-amount tax fees', () => {
            const res = calculateTax(500, {
                name: 'Service Processing Fee',
                rate: 25.5,
                type: 'fixed',
            })
            expect(res.totalTax).toBe(25.5)
        })

        it('ignores inactive taxes', () => {
            const res = calculateTax(1000, [
                { name: 'Active Tax', rate: 10, active: true },
                { name: 'Deprecated Tax', rate: 5, active: false },
            ])
            expect(res.totalTax).toBe(100.0)
            expect(res.taxDetails).toHaveLength(1)
        })
    })

    describe('calculateInvoiceTotals', () => {
        it('performs end-to-end invoice total calculation (lines + discount + multi-tax)', () => {
            const result = calculateInvoiceTotals({
                lines: [
                    { quantity: 2, unitPrice: 500 }, // 1000
                    { quantity: 1, unitPrice: 200, priceExtra: 50 }, // 250
                ],
                discount: {
                    type: 'percent',
                    value: 20, // 20% off 1250 = 250 discount
                },
                taxes: [
                    { name: 'CGST', rate: 9 }, // 9% of 1000 = 90
                    { name: 'SGST', rate: 9 }, // 9% of 1000 = 90
                ],
            })

            expect(result.subtotal).toBe(1250.0)
            expect(result.discountAmount).toBe(250.0)
            expect(result.taxableAmount).toBe(1000.0)
            expect(result.taxAmount).toBe(180.0)
            expect(result.totalAmount).toBe(1180.0)
            expect(result.taxDetails).toHaveLength(2)
        })
    })
})
