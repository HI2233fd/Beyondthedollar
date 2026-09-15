import { MINUTES_PER_DAY } from './time'

export type BillCategory =
  | 'rent'
  | 'mortgage'
  | 'property-tax'
  | 'home-maintenance'
  | 'car-loan'
  | 'car-lease'
  | 'car-insurance'
  | 'car-maintenance'
  | 'other'

export interface RecurringBill {
  id: string
  label: string
  amount: number
  /** Interval between charges in game days. */
  everyDays: number
  /** Next charge time (absolute game minutes). */
  nextDueTotalMinutes: number
  category: BillCategory
}

export function billInDays(
  id: string,
  label: string,
  amount: number,
  everyDays: number,
  fromTotalMinutes: number,
  category: BillCategory,
  firstDueInDays = everyDays,
): RecurringBill {
  return {
    id,
    label,
    amount,
    everyDays,
    nextDueTotalMinutes: fromTotalMinutes + firstDueInDays * MINUTES_PER_DAY,
    category,
  }
}

export function upsertBill(bills: RecurringBill[], bill: RecurringBill): RecurringBill[] {
  const without = bills.filter((b) => b.id !== bill.id)
  return [...without, bill]
}

export function removeBillsByPrefix(bills: RecurringBill[], prefix: string): RecurringBill[] {
  return bills.filter((b) => !b.id.startsWith(prefix))
}

export function removeBillsByCategory(
  bills: RecurringBill[],
  categories: BillCategory[],
): RecurringBill[] {
  const set = new Set(categories)
  return bills.filter((b) => !set.has(b.category))
}
