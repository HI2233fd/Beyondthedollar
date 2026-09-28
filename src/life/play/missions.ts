import type { Mission } from '../types'
import { EMPLOYERS, type EmployerId } from './logic'

function mission(partial: Mission): Mission {
  return partial
}

export function settleInMission(): Mission {
  return mission({
    id: 'settle-in',
    title: 'First morning',
    category: 'main',
    description: 'Look around the apartment, then step outside. The block will not hand you a single arrow.',
    status: 'active',
    conceptIds: ['choices-cost'],
    locationHint: 'Maple Apartments',
    objectives: [
      { id: 'explore-home', label: 'Look around the apartment', done: false },
      { id: 'leave-home', label: 'Leave through the EXIT', done: false },
    ],
    rewardXp: 40,
    completed: false,
    chainId: 'opening',
  })
}

export function rentMission(dueAt: number): Mission {
  return mission({
    id: 'rent-clock',
    title: 'Rent is coming',
    category: 'financial',
    description: 'Maple Apartments will charge rent. It clears only when that bill is actually paid.',
    status: 'active',
    conceptIds: ['cashflow-budget', 'first-lease'],
    deadlineAt: dueAt,
    locationHint: 'Phone → Bank, when the bill is due',
    objectives: [{ id: 'pay-rent', label: 'Pay Maple rent when it posts', done: false }],
    rewardXp: 80,
    completed: false,
    chainId: 'housing',
  })
}

export function discoveredMissions(phoneExpiresAt: number): Mission[] {
  return [
    mission({
      id: 'bank-first',
      title: 'Open a bank account',
      category: 'financial',
      description: 'You do not have an account yet. FirstCity will show real products. The one you pick is the one you live with.',
      status: 'discovered',
      conceptIds: ['checking-life', 'fees-safety', 'move-money'],
      locationHint: 'FirstCity Bank',
      personHint: 'Marcus',
      objectives: [{ id: 'choose-account', label: 'Choose an account and deposit what you want', done: false }],
      rewardXp: 70,
      completed: false,
      chainId: 'banking',
    }),
    mission({
      id: 'job-bean',
      title: 'Bean Street is hiring',
      category: 'career',
      description: 'A café on the west sidewalk wants a barista. Apply, show up for the interview, then decide.',
      status: 'discovered',
      conceptIds: ['get-hired', 'human-capital', 'paycheck-story'],
      locationHint: 'Help Wanted board',
      personHint: 'Bean Street',
      objectives: [
        { id: 'apply', label: 'Apply', done: false },
        { id: 'show-up', label: 'Attend the interview', done: false },
        { id: 'outcome', label: 'Take the result — offer, rejection, or a miss', done: false },
      ],
      rewardXp: 90,
      completed: false,
      chainId: 'work',
    }),
    mission({
      id: 'job-summit',
      title: 'Summit Tower opening',
      category: 'career',
      description: 'Diane is hiring an office assistant. The pay is higher. She will not schedule you without a checking account.',
      status: 'discovered',
      conceptIds: ['get-hired', 'paycheck-story', 'checking-life'],
      locationHint: 'Summit Tower',
      personHint: 'Diane',
      objectives: [
        { id: 'apply', label: 'Apply with Diane', done: false },
        { id: 'show-up', label: 'Attend the interview', done: false },
        { id: 'outcome', label: 'Take the result', done: false },
      ],
      rewardXp: 90,
      completed: false,
      chainId: 'work',
    }),
    mission({
      id: 'maya-help',
      title: 'Someone near FreshMart',
      category: 'side',
      description: 'A neighbor may need a hand in the grocery store. You will not know the details until you find her.',
      status: 'discovered',
      conceptIds: ['choices-cost', 'how-you-pay'],
      locationHint: 'FreshMart',
      personHint: 'Maya',
      chainId: 'maya',
      objectives: [{ id: 'help', label: 'Find Maya and help with her basket', done: false }],
      rewardXp: 50,
      completed: false,
    }),
    mission({
      id: 'phone-deal',
      title: 'Used phone — $180',
      category: 'opportunity',
      description: 'A used phone is listed for $180. Your starter phone still works, but some messages wait until morning.',
      status: 'discovered',
      conceptIds: ['choices-cost', 'money-behavior'],
      deadlineAt: phoneExpiresAt,
      locationHint: 'Phone → Your Life',
      objectives: [{ id: 'decide', label: 'Buy it or pass before the listing expires', done: false }],
      rewardXp: 30,
      completed: false,
    }),
    mission({
      id: 'week-groceries',
      title: 'Food for the week',
      category: 'financial',
      description: 'Stock the kitchen at FreshMart. Nothing in the aisle is marked correct. The total is what you live with.',
      status: 'discovered',
      conceptIds: ['cashflow-budget', 'shop-smart', 'how-you-pay', 'choices-cost'],
      locationHint: 'FreshMart',
      objectives: [
        { id: 'food', label: 'Buy at least four kinds of food you can cook with', done: false },
        { id: 'budget', label: 'Optional: keep the trip at $55 or less', done: false, optional: true },
        { id: 'reserve', label: 'Optional: still have $20 after you pay', done: false, optional: true },
      ],
      rewardXp: 60,
      completed: false,
    }),
  ]
}

export function shiftMission(employerId: EmployerId): Mission {
  const job = EMPLOYERS[employerId]
  return mission({
    id: 'first-shift',
    title: `First shift · ${job.name}`,
    category: 'career',
    description: `Clock in and work the orders. Pay depends on how accurately you work, not on a button that says “get paid.”`,
    status: 'active',
    conceptIds: ['paycheck-story', 'pay-forms', 'human-capital'],
    locationHint: job.where,
    chainId: 'work',
    objectives: [{ id: 'work', label: 'Finish a shift', done: false }],
    rewardXp: 80,
    completed: false,
  })
}

export function workplaceMission(): Mission {
  return mission({
    id: 'workplace-snag',
    title: 'The drawer is short',
    category: 'career',
    description: 'Something at work does not add up. How you handle it changes your standing.',
    status: 'discovered',
    conceptIds: ['get-hired', 'reputation'],
    chainId: 'work',
    objectives: [{ id: 'handle', label: 'Deal with the shortage', done: false }],
    rewardXp: 40,
    completed: false,
  })
}

export function paydayMission(): Mission {
  return mission({
    id: 'payday-split',
    title: 'The paycheck is yours',
    category: 'financial',
    description: 'Money landed. Decide what it does next. Leaving it in checking is a real choice.',
    status: 'active',
    conceptIds: ['paycheck-story', 'savings-growth', 'cashflow-budget', 'goals-plan'],
    locationHint: 'Phone → Your Life',
    objectives: [
      { id: 'allocate', label: 'Move the money, or deliberately leave it', done: false },
      { id: 'save-slice', label: 'Optional: put at least 10% into savings', done: false, optional: true },
    ],
    rewardXp: 50,
    completed: false,
    chainId: 'money',
  })
}

export function recoveryMission(): Mission {
  return mission({
    id: 'job-recovery',
    title: 'After the no',
    category: 'career',
    description: 'That interview did not land. Practice with Jordan, try FreshMart, or reapply when you are sharper.',
    status: 'active',
    conceptIds: ['get-hired', 'human-capital'],
    personHint: 'Jordan',
    locationHint: 'Home, or FreshMart',
    chainId: 'work',
    objectives: [
      { id: 'another-path', label: 'Practice, reapply, or get hired somewhere else', done: false },
    ],
    rewardXp: 40,
    completed: false,
  })
}

export function freshmartMission(): Mission {
  const job = EMPLOYERS.freshmart
  return mission({
    id: 'job-freshmart',
    title: 'FreshMart weekend help',
    category: 'career',
    description: 'Andre can use a stocker. The bar is lower than the café. The pay is lower too.',
    status: 'discovered',
    conceptIds: job.conceptIds,
    locationHint: job.where,
    personHint: 'Andre',
    chainId: 'work',
    objectives: [
      { id: 'apply', label: 'Apply with Andre', done: false },
      { id: 'show-up', label: 'Attend the interview', done: false },
      { id: 'outcome', label: 'Take the result', done: false },
    ],
    rewardXp: 70,
    completed: false,
  })
}

export function mayaIntroMission(): Mission {
  return mission({
    id: 'maya-intro',
    title: 'Maya’s manager',
    category: 'side',
    description: 'Maya remembers the basket. She can introduce you to weekend work — or you can leave it.',
    status: 'discovered',
    conceptIds: ['get-hired'],
    personHint: 'Maya',
    chainId: 'maya',
    objectives: [{ id: 'intro', label: 'Answer Maya', done: false }],
    rewardXp: 30,
    completed: false,
  })
}

export function reviewMission(employerName: string): Mission {
  return mission({
    id: 'performance-review',
    title: 'Performance review',
    category: 'career',
    description: `${employerName} has seen your shifts. The review uses that record.`,
    status: 'active',
    conceptIds: ['human-capital', 'paycheck-story'],
    chainId: 'work',
    objectives: [{ id: 'review', label: 'Sit the review', done: false }],
    rewardXp: 60,
    completed: false,
  })
}

export function repayMission(amount: number): Mission {
  return mission({
    id: 'repay-jordan',
    title: 'You owe Jordan',
    category: 'side',
    description: `Jordan covered $${amount}. It is not a bank loan, and it does not vanish.`,
    status: 'active',
    conceptIds: ['debt-path', 'buffers'],
    personHint: 'Jordan',
    locationHint: 'Maple Apartments',
    chainId: 'jordan',
    objectives: [{ id: 'repay', label: `Pay Jordan back $${amount}`, done: false }],
    rewardXp: 40,
    completed: false,
  })
}

export function wheelsMission(): Mission {
  return mission({
    id: 'wheels',
    title: 'How you get around',
    category: 'opportunity',
    description: 'AutoMart will show real cars and real loan math. Transit is also a choice. Looking costs nothing.',
    status: 'discovered',
    conceptIds: ['loan-math', 'car-life', 'cover-the-car', 'choices-cost'],
    locationHint: 'Home → AutoMart tablet',
    objectives: [{ id: 'choose', label: 'Buy a car, finance one, or commit to transit', done: false }],
    rewardXp: 70,
    completed: false,
  })
}

export function fixCarMission(amount: number): Mission {
  return mission({
    id: 'fix-car',
    title: 'The car still will not start',
    category: 'event',
    description: `You delayed a $${amount} repair. The car stays parked until you pay for it.`,
    status: 'active',
    conceptIds: ['car-life', 'buffers', 'cover-the-car'],
    locationHint: 'Phone → Your Life',
    objectives: [{ id: 'repair', label: `Pay $${amount} or keep waiting`, done: false }],
    rewardXp: 40,
    completed: false,
  })
}

export function jobMissionId(employerId: EmployerId): string {
  if (employerId === 'bean') return 'job-bean'
  if (employerId === 'summit') return 'job-summit'
  return 'job-freshmart'
}
