import type { LifeGoalId, Mission } from './types'

export function createFirstDayMission(): Mission {
  return {
    id: 'first-day',
    title: 'Your First Day',
    category: 'main',
    description: 'Hit each beat in order — home → city → phone → meet Jordan. Use Go when you’re stuck.',
    objectives: [
      { id: 'explore-home', label: 'Quick look around home', done: false },
      { id: 'leave-home', label: 'Leave through EXIT', done: false },
      { id: 'explore-neighborhood', label: 'Scan the starter block', done: false },
      { id: 'meet-someone', label: 'Talk to Jordan', done: false },
      { id: 'open-phone', label: 'Open your phone (P)', done: false },
      { id: 'first-opportunity', label: 'Unlock your opportunity arc', done: false },
    ],
    rewardXp: 120,
    rewardCash: 25,
    followUpId: 'first-paycheck-path',
    locationHint: 'Maple Apartments → City Streets',
    personHint: 'Jordan',
    completed: false,
  }
}

/** Goal-personalized follow-up after first day — uses existing bank/job loop. */
export function createPersonalizedOpportunity(goals: LifeGoalId[]): Mission {
  const primary = goals[0] ?? 'career'
  const variants: Record<string, Pick<Mission, 'title' | 'description' | 'personHint' | 'locationHint'>> = {
    career: {
      title: 'A Brighter Future',
      description: 'Jordan heard Summit Office is hiring. Open checking, then interview with Diane.',
      personHint: 'Diane · Summit Office',
      locationHint: 'FirstCity Bank → Summit Tower',
    },
    entrepreneurship: {
      title: 'Starter Hustle',
      description: 'Open a checking account, get a first paycheck job, then scout café ideas downtown later.',
      personHint: 'Marcus · Bank',
      locationHint: 'FirstCity Bank → Summit Tower',
    },
    financialFreedom: {
      title: 'Foundation First',
      description: 'Open checking, land a job for direct deposit, then move cash into savings.',
      personHint: 'Marcus · Bank',
      locationHint: 'FirstCity Bank',
    },
    education: {
      title: 'Campus Path',
      description: 'Talk to Ms. Alvarez about education options, then open checking so you can plan tuition.',
      personHint: 'Ms. Alvarez · College',
      locationHint: 'Merridian College → FirstCity Bank',
    },
    investing: {
      title: 'Investor Starter',
      description: 'Get hired, build savings, then visit the INVEST desk when you have a cushion.',
      personHint: 'Bank INVEST desk',
      locationHint: 'Summit → FirstCity Bank',
    },
    relationships: {
      title: 'Someone in Your Corner',
      description: 'Deepen your bond with Jordan, open checking together as a plan, then apply at Summit.',
      personHint: 'Jordan · Home',
      locationHint: 'Maple Apartments → Bank → Office',
    },
    home: {
      title: 'Keys & Cash Flow',
      description: 'Secure income and banking before housing choices get real. Interview at Summit.',
      personHint: 'Diane · Summit',
      locationHint: 'Bank → Office',
    },
    cars: {
      title: 'Wheels Later',
      description: 'Jobs and credit first — open checking, get hired, then browse AutoMart when ready.',
      personHint: 'Jordan · AutoMart tablet',
      locationHint: 'Bank → Office → Home',
    },
    creativity: {
      title: 'Creative Cash Flow',
      description: 'Fund your creative goals with a starter job. Bank account, then Diane’s interview.',
      personHint: 'Diane',
      locationHint: 'Bank → Office',
    },
    helping: {
      title: 'Earn to Give',
      description: 'Stable income helps you help others. Open checking and get hired at Summit.',
      personHint: 'Diane',
      locationHint: 'Bank → Office',
    },
    travel: {
      title: 'Ticket Fund',
      description: 'Travel needs cash flow. Open checking, land your first job, start a savings habit.',
      personHint: 'Marcus',
      locationHint: 'Bank → Office',
    },
    adventure: {
      title: 'Map the Block',
      description: 'Discover every building on the starter block, then unlock your first job opportunity.',
      personHint: 'Neighborhood',
      locationHint: 'Starter District',
    },
  }

  const v = variants[primary] ?? variants.career
  return {
    id: 'first-opportunity',
    title: v.title,
    category: 'opportunity',
    description: v.description,
    objectives: [
      { id: 'open-checking', label: 'Open a checking account', done: false },
      { id: 'get-hired', label: 'Get hired at Summit Office', done: false },
      { id: 'first-paycheck', label: 'Collect first payday (~$300 on Sept 2)', done: false },
      { id: 'shop-or-save', label: 'Make a money decision (grocery or savings)', done: false },
    ],
    rewardXp: 200,
    rewardCash: 50,
    personHint: v.personHint,
    locationHint: v.locationHint,
    completed: false,
  }
}

export const ACHIEVEMENT_DEFS = [
  { id: 'first-paycheck', title: 'First Paycheck' },
  { id: 'first-1k', title: 'First $1K' },
  { id: 'first-car', title: 'First Car' },
  { id: 'moved-out', title: 'Moved Out' },
  { id: 'debt-free', title: 'Debt Free' },
  { id: 'strong-credit', title: 'Strong Credit' },
  { id: 'first-investment', title: 'First Investment' },
  { id: 'first-day-done', title: 'Survived Day One' },
  { id: 'met-jordan', title: 'Made a Friend' },
  { id: 'downtown-unlocked', title: 'Downtown Bound' },
] as const
