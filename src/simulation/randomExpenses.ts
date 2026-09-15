import type { ScenarioDef } from './scenarios/types'
import { MINUTES_PER_DAY } from './time'

export type ExpenseSeverity = 'small' | 'medium' | 'large' | 'consequence'

export interface ExpenseTemplate {
  id: string
  title: string
  setup: string
  severity: ExpenseSeverity
  /** Amount as fraction of weekly income (fallback uses flat min/max). */
  incomeFraction?: [number, number]
  min: number
  max: number
  weight: number
  unitNumber?: number
  /** Only fire if player has a job. */
  requiresJob?: boolean
  /** Only fire if debt > 0 (credit interest). */
  requiresDebt?: boolean
  /** Only fire if a bill was recently missed. */
  requiresMissedBill?: boolean
  /** Special effect applied via ScenarioEffects extras. */
  special?: 'hours-cut' | 'rent-hike' | 'late-fee' | 'interest'
}

export interface ExpenseContext {
  weeklyIncome: number
  savings: number
  bank: number
  cash: number
  debt: number
  hasJob: boolean
  recentlyMissedBill: boolean
  rentAmount: number
}

export const EXPENSE_TEMPLATES: ExpenseTemplate[] = [
  // Small / frequent
  {
    id: 'parking',
    title: 'Parking ticket',
    setup: 'A parking ticket for {amount} showed up on your windshield.',
    severity: 'small',
    min: 35,
    max: 85,
    weight: 14,
  },
  {
    id: 'phone-screen',
    title: 'Cracked phone screen',
    setup: 'Your phone screen is cracked. A cheap repair runs about {amount}.',
    severity: 'small',
    min: 80,
    max: 160,
    weight: 10,
  },
  {
    id: 'subscription',
    title: 'Forgotten subscription',
    setup: 'A free trial flipped to paid. You’re charged {amount} for a streaming plan you forgot to cancel.',
    severity: 'small',
    min: 12,
    max: 25,
    weight: 12,
  },
  {
    id: 'late-fee-small',
    title: 'Library / admin late fee',
    setup: 'A small late fee of {amount} hit for an overdue form or card.',
    severity: 'small',
    min: 10,
    max: 40,
    weight: 8,
  },
  // Medium
  {
    id: 'car-repair',
    title: 'Car repair bill',
    setup: 'The shop quotes {amount} to fix your car. It won’t pass inspection until it’s done.',
    severity: 'medium',
    min: 280,
    max: 700,
    incomeFraction: [0.8, 2.2],
    weight: 8,
    unitNumber: 19,
  },
  {
    id: 'medical',
    title: 'Urgent clinic visit',
    setup: 'Urgent care after a sprain. After insurance, you still owe {amount}.',
    severity: 'medium',
    min: 150,
    max: 480,
    incomeFraction: [0.5, 1.6],
    weight: 8,
    unitNumber: 18,
  },
  {
    id: 'vet',
    title: 'Pet emergency',
    setup: 'A roommate’s pet needs a vet visit. Your share is {amount}.',
    severity: 'medium',
    min: 90,
    max: 360,
    weight: 6,
  },
  {
    id: 'appliance',
    title: 'Appliance failure',
    setup: 'Your fridge died overnight. Repair or a cheap replacement is about {amount}.',
    severity: 'medium',
    min: 160,
    max: 420,
    weight: 5,
  },
  // Large / rarer
  {
    id: 'medical-big',
    title: 'Bigger medical bill',
    setup: 'An ER visit left you with {amount} after insurance. It’s painful but not uncommon.',
    severity: 'large',
    min: 600,
    max: 1800,
    incomeFraction: [2, 5],
    weight: 3,
    unitNumber: 18,
  },
  {
    id: 'hours-cut',
    title: 'Hours cut this month',
    setup: 'Your manager cut shifts. Take-home drops for a while — expect about {amount} less per week until things stabilize.',
    severity: 'large',
    min: 60,
    max: 140,
    weight: 3,
    requiresJob: true,
    special: 'hours-cut',
  },
  {
    id: 'rent-hike',
    title: 'Rent increase notice',
    setup: 'Maple Apartments is raising rent by {amount}/mo starting with the next cycle.',
    severity: 'large',
    min: 40,
    max: 120,
    weight: 2,
    special: 'rent-hike',
  },
  // Consequence-based
  {
    id: 'missed-bill-late-fee',
    title: 'Late fee on a missed bill',
    setup: 'Because a bill went unpaid, the issuer added a {amount} late fee.',
    severity: 'consequence',
    min: 25,
    max: 75,
    weight: 16,
    requiresMissedBill: true,
    special: 'late-fee',
  },
  {
    id: 'credit-interest',
    title: 'Credit card interest',
    setup: 'You carried a balance. This month’s interest charge is about {amount}.',
    severity: 'consequence',
    min: 15,
    max: 120,
    weight: 14,
    requiresDebt: true,
    special: 'interest',
  },
]

export function randInt(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1))
}

/** First surprise arrives sooner so players see the system; later rolls use 5–15 days. */
export function rollNextExpenseAt(fromTotalMinutes: number, opts?: { first?: boolean }): number {
  const days = opts?.first ? randInt(2, 4) : randInt(5, 15)
  const hour = randInt(8, 20)
  const minute = randInt(0, 59)
  return fromTotalMinutes + days * MINUTES_PER_DAY + hour * 60 + minute
}

function scaleAmount(template: ExpenseTemplate, ctx: ExpenseContext): number {
  let amount = randInt(template.min, template.max)
  if (template.incomeFraction && ctx.weeklyIncome > 0) {
    const [lo, hi] = template.incomeFraction
    const frac = lo + Math.random() * (hi - lo)
    amount = Math.round(ctx.weeklyIncome * frac)
    amount = Math.max(template.min, Math.min(template.max * 2, amount))
  }
  if (template.special === 'interest' && ctx.debt > 0) {
    amount = Math.max(template.min, Math.min(template.max, Math.round(ctx.debt * (0.02 + Math.random() * 0.03))))
  }
  if (template.special === 'rent-hike') {
    amount = randInt(template.min, template.max)
  }
  if (template.special === 'hours-cut' && ctx.weeklyIncome > 0) {
    amount = Math.max(40, Math.round(ctx.weeklyIncome * (0.25 + Math.random() * 0.2)))
  }
  // Soft cap vs early-game resources so new grads aren’t instantly ruined
  const cushion = Math.max(80, ctx.cash + ctx.bank + ctx.savings)
  if (template.severity !== 'large' && template.severity !== 'consequence') {
    amount = Math.min(amount, Math.round(cushion * 0.55) + 40)
  } else {
    amount = Math.min(amount, Math.round(cushion * 1.4) + 120)
  }
  return Math.max(5, amount)
}

function pickTemplate(ctx: ExpenseContext): ExpenseTemplate {
  const eligible = EXPENSE_TEMPLATES.filter((t) => {
    if (t.requiresJob && !ctx.hasJob) return false
    if (t.requiresDebt && ctx.debt <= 0) return false
    if (t.requiresMissedBill && !ctx.recentlyMissedBill) return false
    return true
  })
  const pool = eligible.length ? eligible : EXPENSE_TEMPLATES.filter((t) => !t.requiresDebt && !t.requiresMissedBill)
  const total = pool.reduce((s, t) => s + t.weight, 0)
  let r = Math.random() * total
  for (const t of pool) {
    r -= t.weight
    if (r <= 0) return t
  }
  return pool[pool.length - 1]
}

export function buildRandomExpenseScenario(
  now: number,
  ctx: ExpenseContext,
): { scenario: ScenarioDef; amount: number } {
  const template = pickTemplate(ctx)
  const amount = scaleAmount(template, ctx)
  const id = `expense-${template.id}-${Math.floor(now)}`
  const setup = template.setup.replace('{amount}', `$${amount}`)

  const choices: ScenarioDef['choices'] = []

  if (template.special === 'hours-cut') {
    choices.push({
      id: 'accept-cut',
      label: 'Accept the reduced hours',
      effects: { hoursCut: { weeklyLoss: amount, days: 21 } },
      why: 'Income can shrink without warning. A cash buffer and lower fixed costs make hours cuts survivable.',
    })
    choices.push({
      id: 'pick-up-gig',
      label: 'Pick up a weekend gig (−time, +some cash)',
      effects: { stats: { cash: Math.round(amount * 0.6) }, hoursCut: { weeklyLoss: Math.round(amount * 0.5), days: 14 } },
      why: 'Extra shifts soften the cut, but trade study/rest time — another scarcity choice.',
    })
  } else if (template.special === 'rent-hike') {
    choices.push({
      id: 'accept-hike',
      label: `Accept +$${amount}/mo rent`,
      effects: { rentHike: amount },
      why: 'Rent hikes raise your fixed costs. Budgeting with a cushion helps before the next increase.',
    })
    choices.push({
      id: 'roommates',
      label: 'Ask about splitting costs with a roommate',
      effects: { rentHike: Math.round(amount * 0.45) },
      why: 'Sharing space can blunt a hike, but adds household negotiation — trade-offs again.',
    })
  } else {
    choices.push(
      {
        id: 'pay-savings',
        label: `Pay $${amount} from savings`,
        effects: { payExpense: { amount, from: 'savings' } },
        why: 'Paying from savings avoids new debt, but your emergency fund shrinks — that’s what it was for.',
      },
      {
        id: 'pay-bank',
        label: `Pay $${amount} from checking`,
        effects: { payExpense: { amount, from: 'bank' } },
        why: 'Using checking keeps savings intact, but leaves less for rent and daily spending.',
      },
      {
        id: 'use-credit',
        label: `Put $${amount} on credit`,
        effects: { payExpense: { amount, from: 'credit' } },
        why: 'Credit covers it now, but balances can grow — and interest is its own surprise bill.',
      },
      {
        id: 'delay',
        label: 'Delay and hope it waits',
        effects: { payExpense: { amount, from: 'delay' } },
        why: 'Delaying can create bigger costs later — some problems get more expensive when ignored.',
      },
    )
  }

  const scenario: ScenarioDef = {
    id,
    title: template.title,
    badge: template.severity === 'consequence' ? 'Consequence' : 'Life event',
    unitNumber: template.unitNumber,
    setup,
    choices,
  }

  return { scenario, amount }
}
