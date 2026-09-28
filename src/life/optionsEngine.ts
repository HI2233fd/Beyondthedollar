import type { ActivityOption } from './characterLook'
import { DOWNTOWN_UNLOCK_LEVEL, LIFE_GOALS, missionStatus, type LifeGoalId } from './types'
import type { Mission } from './types'

export interface OptionContext {
  scene: string
  hasChecking: boolean
  hasJob: boolean
  cash: number
  bank: number
  savings: number
  lifeLevel: number
  xp: number
  xpToNext: number
  goals: LifeGoalId[]
  missions: Mission[]
  metJordan: boolean
  phoneOpen: boolean
  discovered: string[]
  career: string
  season: string
  creditEstablished: boolean
  paystubCount: number
  unreadMessages: number
}

/** Surfaces several real opportunities. It does not collapse life into one next step. */
export function computeActivityOptions(ctx: OptionContext): ActivityOption[] {
  const options: ActivityOption[] = []
  const openMissions = ctx.missions.filter((m) => {
    const status = missionStatus(m)
    return status === 'active' || status === 'accepted' || status === 'discovered'
  })
  for (const mission of openMissions) {
    options.push(optionFromMission(mission))
  }

  const legacyMain = ctx.missions.find((m) => !m.completed && m.id === 'first-day')
  const activeOpp = ctx.missions.find((m) => !m.completed && m.id === 'first-opportunity')

  if (legacyMain) {
    const next = legacyMain.objectives.find((o) => !o.done)
    options.push({
      id: `main-${legacyMain.id}`,
      category: 'main',
      title: next ? next.label : legacyMain.title,
      reason: legacyMain.description,
      locationHint: legacyMain.locationHint,
      personHint: legacyMain.personHint,
      priority: 100,
      action: next?.id === 'open-phone' ? 'phone' : next?.id === 'leave-home' ? 'goto-city' : next?.id === 'meet-someone' ? 'talk-jordan' : 'goto-home',
    })
  }

  if (activeOpp) {
    // Prefer the first objective that still matches live state (handles sync lag).
    const next =
      activeOpp.objectives.find((o) => {
        if (o.done) return false
        if (o.id === 'open-checking' && ctx.hasChecking) return false
        if (o.id === 'get-hired' && ctx.hasJob) return false
        if (o.id === 'first-paycheck' && ctx.paystubCount > 0) return false
        return true
      }) ?? activeOpp.objectives.find((o) => !o.done)

    const action: ActivityOption['action'] = !ctx.hasChecking
      ? 'goto-bank'
      : !ctx.hasJob
        ? 'goto-office'
        : ctx.paystubCount === 0
          ? 'advance-payday'
          : next?.id === 'shop-or-save'
            ? 'goto-grocery'
            : 'goto-grocery'

    options.push({
      id: `opp-${activeOpp.id}`,
      category: 'career',
      title: next?.label ?? activeOpp.title,
      reason: activeOpp.description,
      locationHint: activeOpp.locationHint,
      personHint: activeOpp.personHint,
      priority: 90,
      action,
    })
  }

  if (!ctx.hasChecking && !options.some((o) => /checking/i.test(o.title))) {
    options.push({
      id: 'money-open-checking',
      category: 'money',
      title: 'Open a checking account',
      reason: 'Employers need direct deposit — FirstCity Bank is on the starter block.',
      locationHint: 'FirstCity Bank',
      priority: 85,
      action: 'goto-bank',
    })
  } else if (ctx.hasJob && ctx.savings < 200 && ctx.bank > 50) {
    options.push({
      id: 'money-start-savings',
      category: 'money',
      title: 'Move money into savings',
      reason: 'A small cushion turns emergencies into recoverable bumps.',
      locationHint: 'FirstCity Bank',
      priority: 70,
      action: 'goto-bank',
    })
  }

  if (ctx.hasChecking && !ctx.hasJob) {
    options.push({
      id: 'career-interview',
      category: 'career',
      title: 'Interview at Summit Office',
      reason: 'Diane is hiring Office Assistants — bring your checking account.',
      locationHint: 'Summit Tower',
      priority: 88,
      action: 'goto-office',
    })
  }

  if (ctx.hasJob) {
    if (ctx.paystubCount === 0) {
      const alreadyPayday = options.some((o) => o.action === 'advance-payday')
      if (!alreadyPayday) {
        options.push({
          id: 'career-collect-payday',
          category: 'career',
          title: 'Collect your first payday (Sept 2)',
          reason: 'Skip ahead to morning of Sept 2 and get ~$300 take-home deposited.',
          locationHint: 'Phone / time skip',
          priority: 92,
          action: 'advance-payday',
        })
      } else {
        // Boost the opportunity payday option copy so Sept 2 / ~$300 is obvious
        const pay = options.find((o) => o.action === 'advance-payday')
        if (pay) {
          pay.title = 'Collect your first payday (Sept 2)'
          pay.reason = 'Skip ahead to morning of Sept 2 — ~$300 take-home hits checking.'
          pay.priority = Math.max(pay.priority, 92)
        }
      }
    } else {
      options.push({
        id: 'career-performance',
        category: 'career',
        title: `Keep performing at ${ctx.career}`,
        reason: 'Paychecks land weekly. Check Phone → Jobs between shifts.',
        locationHint: 'Summit Tower',
        priority: 55,
        action: 'goto-office',
      })
    }
  }

  if (!ctx.metJordan) {
    options.push({
      id: 'social-jordan',
      category: 'social',
      title: 'Meet Jordan at home',
      reason: 'Your roommate knows the neighborhood — and often has leads.',
      locationHint: 'Maple Apartments',
      personHint: 'Jordan',
      priority: 80,
      action: 'talk-jordan',
    })
  } else {
    options.push({
      id: 'social-deepen',
      category: 'social',
      title: 'Catch up with Jordan',
      reason: 'Friends open introductions. Talk again to deepen the relationship.',
      locationHint: 'Maple Apartments',
      personHint: 'Jordan',
      priority: 48,
      action: 'talk-jordan',
    })
  }

  if (ctx.cash > 40 && ctx.scene !== 'grocery') {
    options.push({
      id: 'money-grocery',
      category: 'money',
      title: 'Shop FreshMart on a budget',
      reason: 'Walk the aisles, compare prices, and keep your running total in check.',
      locationHint: 'FreshMart',
      priority: 52,
      action: 'goto-grocery',
    })
  }

  const primary = ctx.goals[0]
  if (primary) {
    const g = LIFE_GOALS.find((x) => x.id === primary)
    options.push({
      id: `goal-${primary}`,
      category: 'goal',
      title: progressTowardGoal(primary, ctx),
      reason: g ? `${g.label}: ${g.blurb}` : 'Push your ambition forward.',
      priority: 60,
      action: goalAction(primary, ctx),
    })
  }

  if (ctx.lifeLevel < DOWNTOWN_UNLOCK_LEVEL) {
    options.push({
      id: 'prog-downtown',
      category: 'main',
      title: `Level up toward Downtown (${ctx.lifeLevel}/${DOWNTOWN_UNLOCK_LEVEL})`,
      reason: `${ctx.xpToNext - ctx.xp} XP to next level. Missions, jobs, and discovery all count.`,
      locationHint: 'East avenue teaser',
      priority: 45,
      action: 'goto-city',
    })
  }

  if (!ctx.discovered.includes('college') || ctx.goals.includes('education')) {
    options.push({
      id: 'discover-college',
      category: 'discover',
      title: 'Visit Merridian College',
      reason: 'Education paths unlock careers — tour campus and talk to staff.',
      locationHint: 'Merridian College',
      priority: 42,
      action: 'goto-college',
    })
  }

  if (ctx.season === 'summer' || ctx.season === 'fall') {
    options.push({
      id: 'event-block-fair',
      category: 'event',
      title: ctx.season === 'summer' ? 'Block summer pop-up nearby' : 'Fall career mixer rumor',
      reason: 'Seasonal activity on the starter block — check News on your phone.',
      locationHint: 'City plaza',
      priority: 40,
      action: 'phone',
    })
  }

  if (ctx.unreadMessages > 0) {
    options.push({
      id: 'social-messages',
      category: 'social',
      title: `Read ${ctx.unreadMessages} new message${ctx.unreadMessages > 1 ? 's' : ''}`,
      reason: 'People and employers reach you through Messages.',
      priority: 75,
      action: 'phone',
    })
  }

  // Deduplicate by id + similar titles, sort by priority, take top 6
  const seen = new Set<string>()
  const seenTitles = new Set<string>()
  return options
    .filter((o) => {
      if (seen.has(o.id)) return false
      const t = o.title.toLowerCase()
      if (seenTitles.has(t)) return false
      seen.add(o.id)
      seenTitles.add(t)
      return true
    })
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 8)
}

function optionFromMission(mission: Mission): ActivityOption {
  const status = missionStatus(mission)
  const next = mission.objectives.find((o) => !o.done)
  const category: ActivityOption['category'] =
    mission.category === 'career'
      ? 'career'
      : mission.category === 'financial'
        ? 'money'
        : mission.category === 'side'
          ? 'social'
          : mission.category === 'event'
            ? 'event'
            : mission.category === 'opportunity'
              ? 'discover'
              : 'main'
  const play = playForMission(mission.id)
  return {
    id: `mission-${mission.id}`,
    category,
    title: mission.title,
    reason: status === 'discovered' ? mission.description : next?.label ?? mission.description,
    locationHint: mission.locationHint,
    personHint: mission.personHint,
    priority: status === 'active' || status === 'accepted' ? 70 : 62,
    action: play ? undefined : fallbackAction(mission.id),
    play,
  }
}

function playForMission(id: string): ActivityOption['play'] | undefined {
  if (id === 'bank-first') return { type: 'open', activity: { kind: 'bank' } }
  if (id === 'job-bean') return { type: 'open', activity: { kind: 'posting', employerId: 'bean' } }
  if (id === 'job-summit') return { type: 'open', activity: { kind: 'posting', employerId: 'summit' } }
  if (id === 'job-freshmart') return { type: 'open', activity: { kind: 'posting', employerId: 'freshmart' } }
  if (id === 'phone-deal') return { type: 'open', activity: { kind: 'phone' } }
  if (id === 'payday-split') return { type: 'open', activity: { kind: 'split' } }
  if (id === 'workplace-snag') return { type: 'open', activity: { kind: 'workplace' } }
  if (id === 'performance-review') return { type: 'open', activity: { kind: 'review' } }
  if (id === 'maya-intro') return { type: 'open', activity: { kind: 'maya-intro' } }
  if (id === 'wheels') return { type: 'open', activity: { kind: 'car' } }
  if (id === 'fix-car') return { type: 'open', activity: { kind: 'repair' } }
  if (id === 'job-recovery') return { type: 'open', activity: { kind: 'practice' } }
  return undefined
}

function fallbackAction(id: string): ActivityOption['action'] {
  if (id === 'maya-help' || id === 'week-groceries') return 'goto-grocery'
  if (id === 'settle-in') return 'goto-city'
  if (id === 'rent-clock') return 'phone'
  return 'phone'
}

function progressTowardGoal(goal: LifeGoalId, ctx: OptionContext): string {
  switch (goal) {
    case 'cars':
      return ctx.savings < 1500 ? `Save toward a car · $${Math.round(ctx.savings)}/$1,500` : 'Visit AutoMart when credit is ready'
    case 'home':
      return 'Stabilize income, then explore housing options'
    case 'investing':
      return ctx.savings < 500 ? `Build invest cushion · $${Math.round(ctx.savings)}/$500` : 'Visit the Bank INVEST desk'
    case 'education':
      return 'Talk to Merridian College about your path'
    case 'career':
      return ctx.hasJob ? 'Build performance for the next step' : 'Land your first job'
    case 'financialFreedom':
      return ctx.hasChecking ? 'Grow savings + on-time bills' : 'Open checking to start the foundation'
    case 'relationships':
      return ctx.metJordan ? 'Deepen bonds and meet someone new' : 'Meet your first friend'
    case 'entrepreneurship':
      return 'Earn startup capital with a first paycheck job'
    default:
      return 'Take the next step on your ambition'
  }
}

function goalAction(goal: LifeGoalId, ctx: OptionContext): ActivityOption['action'] {
  if (goal === 'education') return 'goto-college'
  if (goal === 'investing' || goal === 'financialFreedom') return ctx.hasChecking ? 'goto-bank' : 'goto-bank'
  if (goal === 'cars' || goal === 'home') return 'goto-home'
  if (goal === 'career' || goal === 'entrepreneurship') return ctx.hasJob ? 'goto-office' : ctx.hasChecking ? 'goto-office' : 'goto-bank'
  if (goal === 'relationships') return 'talk-jordan'
  return 'phone'
}

export const CATEGORY_META: Record<ActivityOption['category'], { label: string; icon: string }> = {
  main: { label: 'MAIN', icon: '⭐' },
  career: { label: 'CAREER', icon: '💼' },
  social: { label: 'SOCIAL', icon: '👥' },
  money: { label: 'MONEY', icon: '💰' },
  event: { label: 'EVENT', icon: '📅' },
  goal: { label: 'GOAL', icon: '🎯' },
  discover: { label: 'DISCOVER', icon: '🔍' },
}
