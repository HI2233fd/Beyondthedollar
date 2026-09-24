import type { UnlockDef } from './types'

/**
 * Unlocks granted when a financial Life Level checkpoint is passed.
 * `live` is true only when the current game actually exposes the thing.
 * Future ids stay registered so later missions can claim them without a new curriculum pass.
 */
export const UNLOCKS: UnlockDef[] = [
  {
    id: 'life-log',
    level: 1,
    title: 'Life log',
    detail: 'Phone keeps your financial Life Level, concept progress, and reviews.',
    live: true,
  },
  {
    id: 'paystub-coach',
    level: 2,
    title: 'Pay stub coach',
    detail: 'Reopen the paycheck explanation any time from the phone, using your real stub.',
    live: true,
  },
  {
    id: 'savings-snapshot',
    level: 3,
    title: 'Savings snapshot',
    detail: 'Phone shows checking, savings, and whether an emergency buffer is started.',
    live: true,
  },
  {
    id: 'budget-snapshot',
    level: 4,
    title: 'Cash-flow snapshot',
    detail: 'Phone summarizes recent ledger money in and money out.',
    live: true,
  },
  {
    id: 'credit-file-notes',
    level: 5,
    title: 'Credit file notes',
    detail: 'Phone explains the score and card you already have in this world. Applying still uses the bank rules.',
    live: true,
  },
  {
    id: 'auto-cost-sheet',
    level: 6,
    title: 'Auto cost sheet',
    detail: 'A review sheet for payment, insurance, fuel, and repairs. The AutoMart kiosk is already in the city and is not newly locked.',
    live: true,
  },
  {
    id: 'lease-checklist',
    level: 7,
    title: 'Lease checklist',
    detail: 'A renter checklist you can reread. Maple rent already runs on the calendar.',
    live: true,
  },
  {
    id: 'path-compare',
    level: 8,
    title: 'Path compare',
    detail: 'Compare a job-now path with more training using your current pay as the baseline.',
    live: true,
  },
  {
    id: 'invest-desk-notes',
    level: 9,
    title: 'Investing notes',
    detail: 'Review risk, funds, and fees beside the bank invest desk. The savings gate on that desk stays as it is.',
    live: true,
  },
  {
    id: 'net-worth-snapshot',
    level: 10,
    title: 'Net worth snapshot',
    detail: 'Phone adds up cash, bank, savings, investments, and debt you already have.',
    live: true,
  },
  {
    id: 'home-cost-sheet',
    level: 11,
    title: 'Home cost sheet',
    detail: 'Review mortgage, tax, insurance, and upkeep ideas. The home deal kiosk is already in the world and is not newly locked.',
    live: true,
  },
  {
    id: 'venture-notes',
    level: 12,
    title: 'Venture notes',
    detail: 'A business cash-flow checklist for a future shop or side business. No separate business district exists yet.',
    live: false,
  },
]

export function unlocksForPassedLevel(level: number): UnlockDef[] {
  return UNLOCKS.filter((u) => u.level === level)
}
