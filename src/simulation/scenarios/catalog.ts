import type { ScenarioDef, ScenarioTrigger } from './types'

/**
 * Seed catalog for the Scenario pattern review.
 * Full unit conversion comes after the time + pop-up pattern is approved.
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
}

export function getScenario(id: string): ScenarioDef | undefined {
  return SCENARIOS[id]
}

/** Calendar demos: morning trade-off, then a mid-morning price notice. */
export const CALENDAR_TRIGGERS: ScenarioTrigger[] = [
  {
    id: 'cal-demo-opportunity',
    kind: 'calendar',
    scenarioId: 'demo-opportunity-cost',
    atTotalMinutes: 8 * 60 + 25, // 08:25 day 0
    once: true,
  },
  {
    id: 'cal-demo-price',
    kind: 'calendar',
    scenarioId: 'demo-price-spike',
    atTotalMinutes: 8 * 60 + 90, // 09:30 day 0
    once: true,
  },
]
