import type { DebtType, LifeStage, SkillKey } from './types'

export interface EventEffect {
  cash?: number
  savings?: number
  xp?: number
  stress?: number
  creditDelta?: number
  learnConcept?: string
  skill?: { key: SkillKey; amount: number }
  addDebt?: { type: DebtType; name: string; balance: number; apr: number }
  timeline?: { title: string; detail: string; icon: string; tone: 'good' | 'bad' | 'neutral' | 'milestone' }
}

export interface EventChoice {
  id: string
  label: string
  hint?: string
  requiresConcept?: string
  smart?: boolean
  effects: EventEffect
  outcome: string
}

export interface GameEvent {
  id: string
  title: string
  emoji: string
  category: string
  minMonth?: number
  minStage?: LifeStage
  story: string
  info?: { concept?: string; text: string }
  choices: EventChoice[]
}

export const EVENTS: GameEvent[] = [
  {
    id: 'car-breakdown',
    title: 'Your Car Won’t Start',
    emoji: '🚗',
    category: 'Emergency',
    story:
      'It’s Monday morning and your car makes an awful clunk, then silence. The mechanic quotes $650 for the repair.',
    info: {
      concept: 'emergencyfund',
      text: 'This is exactly what an emergency fund is for. Paying cash avoids interest; putting it on a high-APR card can snowball.',
    },
    choices: [
      {
        id: 'cash',
        label: 'Pay $650 from savings',
        hint: 'Uses your emergency fund',
        smart: true,
        effects: {
          savings: -650,
          xp: 25,
          skill: { key: 'saving', amount: 20 },
          timeline: { title: 'Handled a car repair', detail: 'Paid $650 cash — no debt, no drama.', icon: '🛟', tone: 'good' },
        },
        outcome: 'You pay cash. Stressful, but no debt — this is your emergency fund earning its keep.',
      },
      {
        id: 'card',
        label: 'Put it on a credit card (24% APR)',
        hint: 'Creates debt if unpaid',
        effects: {
          addDebt: { type: 'creditCard', name: 'Credit Card', balance: 650, apr: 0.24 },
          stress: 10,
          xp: 8,
          timeline: { title: 'Charged a car repair', detail: 'Put $650 on a 24% APR card.', icon: '💳', tone: 'bad' },
        },
        outcome: 'The car runs again — but a 24% APR balance now grows every month until you knock it out.',
      },
      {
        id: 'bus',
        label: 'Skip the repair, take the bus for now',
        hint: 'Saves money, costs time',
        effects: {
          stress: 6,
          xp: 12,
          skill: { key: 'budgeting', amount: 10 },
          timeline: { title: 'Delayed a car repair', detail: 'Chose the bus to avoid the bill.', icon: '🚌', tone: 'neutral' },
        },
        outcome: 'You buy time with the bus. Not glamorous, but your bank account stays intact.',
      },
    ],
  },
  {
    id: 'road-trip',
    title: 'Friends Want a Road Trip',
    emoji: '🏝️',
    category: 'Lifestyle',
    story:
      'Leo texts: “Beach weekend?? It’ll be like $400 all in.” It sounds amazing. Payday isn’t for another two weeks.',
    info: {
      concept: 'budgeting',
      text: 'Fun matters — the “wants” bucket is real. The question is whether it fits your plan without raiding savings.',
    },
    choices: [
      {
        id: 'go',
        label: 'Go for it — $400 cash',
        effects: {
          cash: -400,
          xp: 10,
          stress: -8,
          timeline: { title: 'Weekend road trip', detail: 'Spent $400 making memories.', icon: '🏝️', tone: 'neutral' },
        },
        outcome: 'Unforgettable weekend. Your “wants” budget took the hit, but it was planned fun.',
      },
      {
        id: 'budget',
        label: 'Propose a $150 budget version',
        hint: 'Balance fun and goals',
        smart: true,
        effects: {
          cash: -150,
          xp: 20,
          stress: -6,
          skill: { key: 'budgeting', amount: 18 },
          timeline: { title: 'Budget road trip', detail: 'Made it fun for $150 by camping.', icon: '⛺', tone: 'good' },
        },
        outcome: 'You camp instead of a hotel and split gas. Same laughs, fraction of the cost.',
      },
      {
        id: 'skip',
        label: 'Skip it and save',
        effects: {
          savings: 60,
          xp: 12,
          stress: 6,
          skill: { key: 'saving', amount: 12 },
          timeline: { title: 'Skipped the trip', detail: 'Stayed home and saved instead.', icon: '🐷', tone: 'neutral' },
        },
        outcome: 'FOMO is real, but you moved $60 to savings and kept your goals on track.',
      },
    ],
  },
  {
    id: 'phone-broke',
    title: 'Cracked Phone Screen',
    emoji: '📱',
    category: 'Emergency',
    story:
      'Your phone slips out of your pocket and the screen shatters. You need it for work and school.',
    choices: [
      {
        id: 'repair',
        label: 'Repair the screen — $120',
        smart: true,
        effects: {
          cash: -120,
          xp: 12,
          skill: { key: 'budgeting', amount: 8 },
          timeline: { title: 'Repaired phone', detail: 'Fixed the screen for $120.', icon: '🔧', tone: 'neutral' },
        },
        outcome: 'A repair is far cheaper than replacing. Good call.',
      },
      {
        id: 'upgrade',
        label: 'Finance a brand-new $1,100 phone',
        hint: 'Adds monthly debt',
        effects: {
          addDebt: { type: 'personal', name: 'Phone Financing', balance: 1100, apr: 0.18 },
          xp: 5,
          stress: 6,
          timeline: { title: 'Financed a new phone', detail: 'Took on $1,100 at 18% APR.', icon: '📱', tone: 'bad' },
        },
        outcome: 'Shiny new phone — and a new monthly payment you’ll feel for a while.',
      },
    ],
  },
  {
    id: 'bonus',
    title: 'Surprise Work Bonus',
    emoji: '🎉',
    category: 'Windfall',
    minStage: 'firstJob',
    story:
      'Your manager pulls you aside: great quarter — here’s a $600 bonus! What will you do with it?',
    info: {
      concept: 'compound',
      text: 'A windfall is a fork in the road. Spent, it’s gone; invested, it can compound for decades.',
    },
    choices: [
      {
        id: 'invest',
        label: 'Invest $600 in an index fund',
        smart: true,
        effects: {
          cash: -600,
          xp: 30,
          learnConcept: 'compound',
          skill: { key: 'investing', amount: 25 },
          timeline: { title: 'Invested a bonus', detail: 'Put $600 to work in the market.', icon: '🌱', tone: 'good' },
        },
        outcome: 'You invest it. In 30 years at ~9%, $600 could grow to nearly $8,000. Future you is grateful.',
      },
      {
        id: 'split',
        label: 'Save $300, spend $300',
        effects: {
          savings: 300,
          xp: 18,
          stress: -6,
          skill: { key: 'saving', amount: 12 },
          timeline: { title: 'Split the bonus', detail: 'Half saved, half enjoyed.', icon: '⚖️', tone: 'good' },
        },
        outcome: 'A balanced move — you reward yourself and your future at the same time.',
      },
      {
        id: 'spend',
        label: 'Treat yourself — spend it all',
        effects: {
          cash: 600,
          xp: 6,
          stress: -10,
          timeline: { title: 'Spent the bonus', detail: 'Treated yourself to $600 of fun.', icon: '🛍️', tone: 'neutral' },
        },
        outcome: 'You enjoy every dollar. Totally valid once in a while — just not every time.',
      },
    ],
  },
  {
    id: 'medical',
    title: 'Unexpected Clinic Bill',
    emoji: '🩺',
    category: 'Emergency',
    story:
      'A nasty flu turns into an urgent care visit. The bill comes to $480 after any insurance.',
    info: {
      concept: 'emergencyfund',
      text: 'Medical costs are a top reason people fall into debt. Many providers offer interest-free payment plans if you ask.',
    },
    choices: [
      {
        id: 'pay',
        label: 'Pay $480 from savings',
        smart: true,
        effects: {
          savings: -480,
          xp: 18,
          skill: { key: 'saving', amount: 15 },
          timeline: { title: 'Paid a medical bill', detail: 'Covered $480 from the emergency fund.', icon: '🩺', tone: 'neutral' },
        },
        outcome: 'You pay it off and move on. This is why the fund exists.',
      },
      {
        id: 'plan',
        label: 'Ask for a 0% payment plan',
        hint: 'Smart if cash is tight',
        smart: true,
        effects: {
          cash: -80,
          xp: 22,
          skill: { key: 'debt', amount: 18 },
          learnConcept: 'apr',
          timeline: { title: 'Negotiated a payment plan', detail: 'Split a $480 bill at 0% interest.', icon: '🤝', tone: 'good' },
        },
        outcome: 'They agree to $80/month at 0% interest. Negotiating saved you from a high-APR card.',
      },
      {
        id: 'ignore',
        label: 'Ignore the bill',
        hint: 'Hurts your credit',
        effects: {
          creditDelta: -40,
          stress: 12,
          timeline: { title: 'Ignored a medical bill', detail: 'It went to collections — credit took a hit.', icon: '⚠️', tone: 'bad' },
        },
        outcome: 'Ignored bills go to collections and can crater your credit score for years.',
      },
    ],
  },
  {
    id: 'scholarship',
    title: 'Scholarship Opportunity',
    emoji: '🎓',
    category: 'Opportunity',
    minStage: 'college',
    story:
      'A local nonprofit offers a $1,000 scholarship for a short essay on your financial goals.',
    info: {
      text: 'Opportunities like this reward the effort of applying. “Free money” is worth your time.',
    },
    choices: [
      {
        id: 'apply',
        label: 'Spend an evening and apply',
        smart: true,
        effects: {
          savings: 1000,
          xp: 35,
          skill: { key: 'career', amount: 15 },
          timeline: { title: 'Won a scholarship', detail: 'Earned $1,000 by applying.', icon: '🏆', tone: 'good' },
        },
        outcome: 'You write a heartfelt essay and win! $1,000 lands in your savings.',
      },
      {
        id: 'skip',
        label: 'Too busy — skip it',
        effects: {
          xp: 2,
          timeline: { title: 'Skipped a scholarship', detail: 'Passed on a $1,000 chance.', icon: '🕳️', tone: 'neutral' },
        },
        outcome: 'You pass. Sometimes life is busy — but that was a $1,000 evening.',
      },
    ],
  },
  {
    id: 'subscription',
    title: 'Subscription Creep',
    emoji: '📺',
    category: 'Lifestyle',
    story:
      'You realize you’re paying for 5 streaming services and 2 apps you forgot about — about $60/month.',
    info: {
      concept: 'budgeting',
      text: 'Small recurring charges are “death by a thousand cuts.” Auditing them is one of the fastest budget wins.',
    },
    choices: [
      {
        id: 'cancel',
        label: 'Cancel the ones you don’t use',
        smart: true,
        effects: {
          cash: 40,
          xp: 18,
          skill: { key: 'budgeting', amount: 20 },
          timeline: { title: 'Cut subscriptions', detail: 'Freed up ~$40/month.', icon: '✂️', tone: 'good' },
        },
        outcome: 'You cancel 4 of them and instantly free up ~$40 every month. That adds up fast.',
      },
      {
        id: 'keep',
        label: 'Keep them all',
        effects: {
          cash: -0,
          xp: 4,
          timeline: { title: 'Kept all subscriptions', detail: 'Decided the convenience was worth it.', icon: '📺', tone: 'neutral' },
        },
        outcome: 'You keep everything. Convenient — but that’s $720/year on autopilot.',
      },
    ],
  },
  {
    id: 'crypto-hype',
    title: 'A Friend’s Hot Crypto Tip',
    emoji: '🪙',
    category: 'Investing',
    minStage: 'firstJob',
    story:
      'Dev swears a new coin is “going to 10x.” He wants you to throw in $500 tonight before it “moons.”',
    info: {
      concept: 'risk',
      text: 'Hype and FOMO are how people lose money. High potential reward always comes with high risk of loss.',
    },
    choices: [
      {
        id: 'small',
        label: 'Invest only what you can lose ($100)',
        hint: 'Balanced risk',
        smart: true,
        effects: {
          cash: -100,
          xp: 20,
          learnConcept: 'risk',
          skill: { key: 'investing', amount: 15 },
          timeline: { title: 'Tried a speculative bet', detail: 'Risked $100 you could afford to lose.', icon: '🎲', tone: 'neutral' },
        },
        outcome: 'You put in a small amount as “fun money.” Win or lose, it won’t derail your life.',
      },
      {
        id: 'allin',
        label: 'Go big — $500',
        hint: 'Very risky',
        effects: {
          cash: -500,
          stress: 8,
          xp: 6,
          timeline: { title: 'Bet big on crypto', detail: 'Put $500 into a hyped coin.', icon: '🪙', tone: 'bad' },
        },
        outcome: 'You go all in on a tip. It might soar — or it might vanish. That’s a gamble, not a plan.',
      },
      {
        id: 'pass',
        label: 'Pass and stick to your plan',
        smart: true,
        effects: {
          xp: 16,
          learnConcept: 'diversification',
          skill: { key: 'investing', amount: 12 },
          timeline: { title: 'Ignored the hype', detail: 'Stuck to a diversified plan.', icon: '🧺', tone: 'good' },
        },
        outcome: 'You pass. Boring beats broke — your diversified plan keeps compounding.',
      },
    ],
  },
]
