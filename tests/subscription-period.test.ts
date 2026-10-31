import { describe, it, expect } from 'vitest'
import {
    advanceSubscriptionPeriod,
    calculateSubscriptionCycle,
} from '@/lib/financial'

describe('Subscription Period Advancement Engine', () => {
    describe('advanceSubscriptionPeriod', () => {
        it('advances daily subscription interval correctly', () => {
            const start = new Date('2026-03-01T00:00:00Z')
            const next = advanceSubscriptionPeriod(start, 'daily', 1)
            expect(next.toISOString()).toBe('2026-03-02T00:00:00.000Z')

            const plusFive = advanceSubscriptionPeriod(start, 'daily', 5)
            expect(plusFive.toISOString()).toBe('2026-03-06T00:00:00.000Z')
        })

        it('advances weekly subscription interval by 7 days per cycle', () => {
            const start = new Date('2026-01-05T00:00:00Z') // Monday
            const nextWeek = advanceSubscriptionPeriod(start, 'weekly', 1)
            expect(nextWeek.toISOString()).toBe('2026-01-12T00:00:00.000Z')

            const fourWeeks = advanceSubscriptionPeriod(start, 'weekly', 4)
            expect(fourWeeks.toISOString()).toBe('2026-02-02T00:00:00.000Z')
        })

        it('advances regular monthly intervals', () => {
            const start = new Date('2026-04-15T00:00:00Z')
            const nextMonth = advanceSubscriptionPeriod(start, 'monthly', 1)
            expect(nextMonth.toISOString()).toBe('2026-05-15T00:00:00.000Z')

            const threeMonths = advanceSubscriptionPeriod(start, 'monthly', 3)
            expect(threeMonths.toISOString()).toBe('2026-07-15T00:00:00.000Z')
        })

        it('handles month-end clamping for 31-day to 30-day transitions', () => {
            // March 31 -> April 30 (April has only 30 days)
            const march31 = new Date('2026-03-31T00:00:00Z')
            const april = advanceSubscriptionPeriod(march31, 'monthly', 1)
            expect(april.toISOString()).toBe('2026-04-30T00:00:00.000Z')

            // May 31 -> June 30
            const may31 = new Date('2026-05-31T00:00:00Z')
            const june = advanceSubscriptionPeriod(may31, 'monthly', 1)
            expect(june.toISOString()).toBe('2026-06-30T00:00:00.000Z')

            // August 31 -> September 30
            const aug31 = new Date('2026-08-31T00:00:00Z')
            const sept = advanceSubscriptionPeriod(aug31, 'monthly', 1)
            expect(sept.toISOString()).toBe('2026-09-30T00:00:00.000Z')
        })

        it('handles February transition in a non-leap year (Jan 31 -> Feb 28)', () => {
            const jan31 = new Date('2025-01-31T00:00:00Z') // 2025 is not a leap year
            const feb = advanceSubscriptionPeriod(jan31, 'monthly', 1)
            expect(feb.toISOString()).toBe('2025-02-28T00:00:00.000Z')
        })

        it('handles February transition in a leap year (Jan 31 -> Feb 29)', () => {
            const jan31Leap = new Date('2024-01-31T00:00:00Z') // 2024 is a leap year
            const febLeap = advanceSubscriptionPeriod(jan31Leap, 'monthly', 1)
            expect(febLeap.toISOString()).toBe('2024-02-29T00:00:00.000Z')
        })

        it('advances quarterly intervals by 3 calendar months', () => {
            const start = new Date('2026-01-15T00:00:00Z')
            const q2 = advanceSubscriptionPeriod(start, 'quarterly', 1)
            expect(q2.toISOString()).toBe('2026-04-15T00:00:00.000Z')

            const q3 = advanceSubscriptionPeriod(start, 'quarterly', 2)
            expect(q3.toISOString()).toBe('2026-07-15T00:00:00.000Z')
        })

        it('advances yearly intervals across calendar years', () => {
            const start = new Date('2026-06-01T00:00:00Z')
            const nextYear = advanceSubscriptionPeriod(start, 'yearly', 1)
            expect(nextYear.toISOString()).toBe('2027-06-01T00:00:00.000Z')

            const threeYears = advanceSubscriptionPeriod(start, 'yearly', 3)
            expect(threeYears.toISOString()).toBe('2029-06-01T00:00:00.000Z')
        })

        it('handles leap year leap-day advancement to non-leap year (Feb 29 -> Feb 28)', () => {
            const leapDay = new Date('2024-02-29T00:00:00Z')
            const nextYear = advanceSubscriptionPeriod(leapDay, 'yearly', 1)
            expect(nextYear.toISOString()).toBe('2025-02-28T00:00:00.000Z')
        })

        it('throws an informative error for invalid date inputs', () => {
            expect(() => advanceSubscriptionPeriod('not-a-valid-date', 'monthly')).toThrow(
                /Invalid date/
            )
        })
    })

    describe('calculateSubscriptionCycle', () => {
        it('calculates the 1st cycle period dates and next billing date', () => {
            const start = new Date('2026-01-01T00:00:00Z')
            const cycle1 = calculateSubscriptionCycle({
                startDate: start,
                interval: 'monthly',
                cycleCount: 1,
            })

            expect(cycle1.cycle).toBe(1)
            expect(cycle1.currentPeriodStart.toISOString()).toBe('2026-01-01T00:00:00.000Z')
            expect(cycle1.currentPeriodEnd.toISOString()).toBe('2026-02-01T00:00:00.000Z')
            expect(cycle1.nextBillingDate.toISOString()).toBe('2026-02-01T00:00:00.000Z')
        })

        it('calculates subsequent cycles (e.g., cycle 3 of a monthly subscription)', () => {
            const start = new Date('2026-01-01T00:00:00Z')
            const cycle3 = calculateSubscriptionCycle({
                startDate: start,
                interval: 'monthly',
                cycleCount: 3,
            })

            expect(cycle3.cycle).toBe(3)
            // Cycle 1: Jan 1 - Feb 1
            // Cycle 2: Feb 1 - Mar 1
            // Cycle 3: Mar 1 - Apr 1
            expect(cycle3.currentPeriodStart.toISOString()).toBe('2026-03-01T00:00:00.000Z')
            expect(cycle3.currentPeriodEnd.toISOString()).toBe('2026-04-01T00:00:00.000Z')
            expect(cycle3.nextBillingDate.toISOString()).toBe('2026-04-01T00:00:00.000Z')
        })

        it('calculates annual cycle dates', () => {
            const start = new Date('2026-05-10T00:00:00Z')
            const cycle1 = calculateSubscriptionCycle({
                startDate: start,
                interval: 'yearly',
                cycleCount: 1,
            })

            expect(cycle1.currentPeriodStart.toISOString()).toBe('2026-05-10T00:00:00.000Z')
            expect(cycle1.currentPeriodEnd.toISOString()).toBe('2027-05-10T00:00:00.000Z')
            expect(cycle1.nextBillingDate.toISOString()).toBe('2027-05-10T00:00:00.000Z')
        })
    })
})
