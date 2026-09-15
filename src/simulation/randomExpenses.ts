import type { ScenarioDef } from './scenarios/types'
import { MINUTES_PER_DAY } from './time'

export interface ExpenseTemplate {
  id: string
  title: string
  /** Setup with `{amount}` placeholder. */
  setup: string
  min: number
  max: number
  unitNumber?: number
}

export const EXPENSE_TEMPLATES: ExpenseTemplate[] = [
  {
    id: 'car-repair',
    title: 'Car repair bill',
    setup: 'The shop quotes {amount} to fix your car. It won’t pass inspection until it’s done.',
    min: 350,
    max: 900,
    unitNumber: 19,
  },
  {
    id: 'medical',
    title: 'Urgent clinic visit',
    setup: 'You’re at urgent care after a bad sprain. After insurance, you still owe {amount}.',
    min: 180,
    max: 650,
    unitNumber: 18,
  },
  {
    id: 'appliance',
    title: 'Appliance failure',
    setup: 'Your fridge died overnight. A replacement (or repair) runs about {amount}.',
    min: 200,
    max: 550,
  },
  {
    id: 'phone',
    title: 'Cracked phone',
    setup: 'Your phone screen is shattered. Repair or a cheap replacement is about {amount}.',
    min: 120,
    max: 480,
  },
  {
    id: 'vet',
    title: 'Pet emergency',
    setup: 'A roommate’s pet needs a vet visit. Splitting the bill still leaves you {amount}.',
    min: 90,
    max: 420,
  },
]

export function randInt(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1))
}

/** Next surprise expense: 5–15 in-game days from now (uneven spacing is fine). */
export function rollNextExpenseAt(fromTotalMinutes: number): number {
  const days = randInt(5, 15)
  const hour = randInt(8, 20)
  const minute = randInt(0, 59)
  return fromTotalMinutes + days * MINUTES_PER_DAY + hour * 60 + minute
}

export function buildRandomExpenseScenario(now: number): { scenario: ScenarioDef; amount: number } {
  const template = EXPENSE_TEMPLATES[randInt(0, EXPENSE_TEMPLATES.length - 1)]
  const amount = randInt(template.min, template.max)
  const id = `expense-${template.id}-${Math.floor(now)}`
  const setup = template.setup.replace('{amount}', `$${amount}`)

  const scenario: ScenarioDef = {
    id,
    title: template.title,
    badge: 'Life event',
    unitNumber: template.unitNumber,
    setup,
    choices: [
      {
        id: 'pay-savings',
        label: `Pay $${amount} from savings`,
        effects: {
          payExpense: { amount, from: 'savings' },
        },
        why: 'Paying from savings avoids new debt, but your emergency fund takes a hit — that’s what it was for.',
      },
      {
        id: 'pay-bank',
        label: `Pay $${amount} from checking`,
        effects: {
          payExpense: { amount, from: 'bank' },
        },
        why: 'Using checking keeps savings intact, but leaves less cash for rent and daily spending.',
      },
      {
        id: 'use-credit',
        label: `Put $${amount} on credit`,
        effects: {
          payExpense: { amount, from: 'credit' },
        },
        why: 'Credit covers the bill now, but you add debt and may ding your score if balances stay high.',
      },
      {
        id: 'delay',
        label: 'Delay and hope it waits',
        effects: {
          payExpense: { amount, from: 'delay' },
        },
        why: 'Delaying can create bigger costs later — some problems get more expensive when ignored.',
      },
    ],
  }

  return { scenario, amount }
}
