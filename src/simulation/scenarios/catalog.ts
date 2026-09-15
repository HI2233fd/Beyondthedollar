import type { ScenarioDef, ScenarioTrigger } from './types'

/** Runtime (generated) scenarios — random expenses, one-off notices. */
const runtimeScenarios = new Map<string, ScenarioDef>()

export function registerRuntimeScenario(def: ScenarioDef) {
  runtimeScenarios.set(def.id, def)
}

export function clearRuntimeScenario(id: string) {
  runtimeScenarios.delete(id)
}

/**
 * Seed catalog + major purchase scenarios.
 * Random expenses are registered at fire-time via registerRuntimeScenario.
 */
export const SCENARIOS: Record<string, ScenarioDef> = {
  'demo-opportunity-cost': {
    id: 'demo-opportunity-cost',
    title: 'Friday night money',
    badge: 'Scenario',
    unitNumber: 1,
    topicId: 'unit-01-t1',
    setup:
      'You have $40 left from your first paycheck. Friends want pizza and a movie ($32). You also wanted to put that money toward next month’s phone bill.',
    choices: [
      {
        id: 'spend',
        label: 'Go out with friends ($32)',
        effects: { stats: { cash: -32 } },
        why: 'You chose the night out. The opportunity cost is the phone-bill cushion you gave up — every choice spends a limited resource.',
      },
      {
        id: 'save',
        label: 'Skip the outing and keep the $40',
        effects: { stats: { cash: 0 } },
        why: 'You kept the cash for the bill. The opportunity cost is the social night — scarcity means you can’t fully do both.',
      },
      {
        id: 'split',
        label: 'Suggest a cheaper hang ($12 snacks)',
        effects: { stats: { cash: -12 } },
        why: 'Thinking at the margin: a smaller spend keeps most of the cushion while still seeing friends.',
      },
    ],
  },
  'demo-price-spike': {
    id: 'demo-price-spike',
    title: 'Eggs are up again',
    badge: 'News',
    unitNumber: 3,
    topicId: 'unit-03-t1',
    setup:
      'FreshMart posted a notice: egg prices jumped after a supply shortage. Your usual carton is $2 more this week.',
    choices: [
      {
        id: 'buy-anyway',
        label: 'Buy the carton anyway',
        effects: { stats: { cash: -6 } },
        why: 'When supply falls, prices rise. Paying more is how scarce goods get rationed without a line.',
      },
      {
        id: 'substitute',
        label: 'Switch to oatmeal this week',
        effects: { stats: { cash: -3 } },
        why: 'Substitutes soften a price spike. Demand for eggs falls a bit when buyers walk away.',
      },
      {
        id: 'wait',
        label: 'Skip eggs and wait',
        effects: { stats: { cash: 0 } },
        why: 'Waiting is a bet that supply recovers. If it doesn’t, you may face the same price later.',
      },
    ],
  },
  'car-buy-vs-lease': {
    id: 'car-buy-vs-lease',
    title: 'AutoMart deal sheet',
    badge: 'Decision',
    unitNumber: 19,
    topicId: 'unit-19-t1',
    setup:
      'A used hatchback lists at $12,000. Buy: $2,000 down + ~$280/mo loan (48 mo) + $110 insurance + $40 upkeep. Lease: $249/mo + $110 insurance, no equity.',
    choices: [
      {
        id: 'buy',
        label: 'Buy — $2,000 down + $280/mo loan',
        effects: { carDeal: 'buy' },
        why: 'Buying costs more monthly at first, but payments build ownership. Insurance and maintenance still hit every month.',
      },
      {
        id: 'lease',
        label: 'Lease — $249/mo + insurance',
        effects: { carDeal: 'lease' },
        why: 'Leasing keeps the payment lower and the car newer, but you never own it and mileage rules apply.',
      },
      {
        id: 'pass',
        label: 'Walk away for now',
        effects: { carDeal: 'pass' },
        why: 'Skipping a car avoids new bills. Transit or rideshares may cost less until income is steadier.',
      },
    ],
  },
  'home-rent-vs-buy': {
    id: 'home-rent-vs-buy',
    title: 'Maple Apartments — rent or buy?',
    badge: 'Decision',
    unitNumber: 20,
    topicId: 'unit-20-t1',
    setup:
      'Your unit can stay a $900/mo rental, or you can buy it: $15,000 down, then ~$1,050 mortgage + $150 tax + $100 upkeep each month. Lenders want a credit score of at least 640.',
    choices: [
      {
        id: 'buy',
        label: 'Buy — $15,000 down + mortgage bundle',
        effects: { homeDeal: 'buy' },
        why: 'Buying replaces rent with mortgage, tax, and upkeep. You build equity if you keep up payments — and take on repair risk.',
      },
      {
        id: 'rent',
        label: 'Keep renting at $900/mo',
        effects: { homeDeal: 'keep-rent' },
        why: 'Renting keeps housing flexible and the landlord handles big repairs, but payments don’t build ownership.',
      },
      {
        id: 'pass',
        label: 'Not ready — revisit later',
        effects: { homeDeal: 'pass' },
        why: 'Waiting is fine if the down payment or credit score isn’t there yet. Revisit when the numbers work.',
      },
    ],
  },
  'investing-intro': {
    id: 'investing-intro',
    title: 'FirstCity Invest desk',
    badge: 'Tip',
    unitNumber: 14,
    topicId: 'unit-14-t1',
    setup:
      'You can buy a higher-risk stock fund or a steadier bond fund. Prices move with game days — watch your portfolio instead of memorizing jargon.',
    choices: [
      {
        id: 'got-it',
        label: 'Open the invest desk',
        effects: { stats: {} },
        why: 'Higher potential return usually means bumpier prices. Bonds move less; stocks swing more.',
      },
    ],
  },
}

export function getScenario(id: string): ScenarioDef | undefined {
  return SCENARIOS[id] ?? runtimeScenarios.get(id)
}

/** Calendar demos: morning trade-off, then a mid-morning price notice. */
export const CALENDAR_TRIGGERS: ScenarioTrigger[] = [
  {
    id: 'cal-demo-opportunity',
    kind: 'calendar',
    scenarioId: 'demo-opportunity-cost',
    atTotalMinutes: 8 * 60 + 25,
    once: true,
  },
  {
    id: 'cal-demo-price',
    kind: 'calendar',
    scenarioId: 'demo-price-spike',
    atTotalMinutes: 8 * 60 + 90,
    once: true,
  },
]
