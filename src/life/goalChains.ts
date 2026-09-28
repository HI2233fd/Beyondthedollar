import type { LifeGoalId } from './types'
import type { GoalMilestone } from './characterLook'

const CHAINS: Record<LifeGoalId, string[]> = {
  career: [
    'Land an entry job',
    'Survive first payday',
    'Build workplace relationships',
    'Earn a performance bump',
    'Unlock a specialization choice',
  ],
  entrepreneurship: [
    'Earn startup capital',
    'Scout a business location',
    'Write a simple offer',
    'Hire or partner',
    'Turn a first profit',
  ],
  financialFreedom: [
    'Open checking + savings',
    'Build an emergency cushion',
    'Clear high-interest debt',
    'Automate investing',
    'Cover essentials from assets',
  ],
  education: [
    'Tour a campus',
    'Compare program costs',
    'Apply / enroll',
    'Fund tuition plan',
    'Complete a credential',
  ],
  home: [
    'Stabilize income',
    'Build credit history',
    'Save a deposit/down payment',
    'Tour neighborhoods',
    'Sign a lease or mortgage',
  ],
  cars: [
    'Decide why you need wheels',
    'Save a down payment',
    'Check loan readiness',
    'Inspect / test-drive',
    'Buy or lease + insure',
  ],
  investing: [
    'Build a cash cushion',
    'Learn risk basics in play',
    'Make a first purchase',
    'Diversify holdings',
    'Hold through a market swing',
  ],
  travel: [
    'Start a travel fund',
    'Pick a destination goal',
    'Balance time off vs income',
    'Book the experience',
    'Return with new opportunities',
  ],
  relationships: [
    'Meet someone new',
    'Share an activity',
    'Become friends',
    'Get an introduction',
    'Support someone through a problem',
  ],
  creativity: [
    'Practice a creative skill',
    'Show work to someone',
    'Land a small paid gig',
    'Build a portfolio',
    'Join a creative network',
  ],
  helping: [
    'Help a neighbor once',
    'Join a community event',
    'Mentor someone newer',
    'Fund a cause from surplus',
    'Lead a local project',
  ],
  adventure: [
    'Discover 3 new places',
    'Find a secret location',
    'Attend a rare event',
    'Cross into a new district',
    'Leave a mark on the map',
  ],
}

export function buildGoalMilestones(goals: LifeGoalId[], completedIds: string[] = []): GoalMilestone[] {
  const out: GoalMilestone[] = []
  for (const goalId of goals) {
    const steps = CHAINS[goalId] ?? []
    steps.forEach((label, i) => {
      const id = `${goalId}-${i}`
      out.push({ id, goalId, label, done: completedIds.includes(id) })
    })
  }
  return out
}

export function syncGoalMilestonesFromState(args: {
  goals: LifeGoalId[]
  milestones: GoalMilestone[]
  hasJob: boolean
  hasChecking: boolean
  savings: number
  paystubCount: number
  metAnyone: boolean
  discoveredCount: number
  holdingsValue: number
}): GoalMilestone[] {
  const done = new Set(args.milestones.filter((m) => m.done).map((m) => m.id))
  const mark = (id: string) => done.add(id)

  if (args.hasChecking) {
    mark('financialFreedom-0')
    mark('investing-0')
  }
  if (args.hasJob) {
    mark('career-0')
    mark('entrepreneurship-0')
  }
  if (args.paystubCount > 0) mark('career-1')
  if (args.savings >= 200) mark('financialFreedom-1')
  if (args.savings >= 500) mark('investing-1')
  if (args.metAnyone) {
    mark('relationships-0')
    mark('helping-0')
  }
  if (args.discoveredCount >= 3) mark('adventure-0')
  if (args.holdingsValue > 0) mark('investing-2')

  const base = args.milestones.length ? args.milestones : buildGoalMilestones(args.goals)
  return base.map((m) => ({ ...m, done: done.has(m.id) || m.done }))
}
