import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from 'react'
import type {
  AssetClass,
  Debt,
  GameState,
  Housing,
  Job,
  LifeStage,
  Transport,
} from './types'
import { uid } from './format'
import {
  ACHIEVEMENTS,
  CHALLENGES,
  CONCEPTS,
  STAGE_ORDER,
} from './content'
import { EVENTS, type EventEffect } from './events'
import {
  ASSETS,
  STAGE_LABEL,
  inCrisis,
  minPaymentFor,
  monthlyExpenses,
  monthlyNetIncome,
  monthlyReturn,
  netWorth,
  portfolioInvested,
  recomputeCreditScore,
} from './engine'

const STORAGE_KEY = 'btd-save-v1'

const initialState: GameState = {
  started: false,
  onboardingStep: 'welcome',
  character: { name: '', avatar: '🦊', pronouns: 'they/them', trait: 'saver' },
  stage: 'highSchool',
  month: 0,
  age: 16,
  cash: 0,
  savings: 0,
  job: null,
  sideHustle: null,
  housing: null,
  transport: null,
  debts: [],
  creditScore: 300,
  creditHistoryMonths: 0,
  onTimePayments: 0,
  missedPayments: 0,
  holdings: [],
  xp: 0,
  skills: { budgeting: 0, saving: 0, credit: 0, investing: 0, career: 0, debt: 0 },
  knownConcepts: [],
  unlockedAchievements: [],
  challengeProgress: {},
  completedChallenges: [],
  stress: 20,
  netWorthHistory: [],
  ledger: [],
  timeline: [],
  seenEvents: [],
  pendingEventId: null,
  inRecovery: false,
  monthlyStipend: 0,
}

export type Action =
  | { type: 'RESET' }
  | { type: 'SET_STEP'; step: GameState['onboardingStep'] }
  | { type: 'CREATE_CHARACTER'; name: string; avatar: string; pronouns: string; trait: string }
  | { type: 'START_LIFE'; stage: LifeStage; goal: string }
  | { type: 'ADVANCE_MONTH' }
  | { type: 'OPEN_ACCOUNT' }
  | { type: 'MOVE_MONEY'; from: 'cash' | 'savings'; amount: number }
  | { type: 'TAKE_JOB'; job: Job }
  | { type: 'QUIT_JOB' }
  | { type: 'SET_SIDE_HUSTLE'; id: string | null; monthly: number }
  | { type: 'RENT_HOUSING'; housing: Housing }
  | { type: 'BUY_TRANSPORT'; transport: Transport }
  | { type: 'SPEND'; amount: number; label: string; category: string }
  | { type: 'INVEST'; asset: AssetClass; amount: number }
  | { type: 'SELL'; asset: AssetClass; amount: number }
  | { type: 'PAY_DEBT'; debtId: string; amount: number }
  | { type: 'LEARN'; conceptId: string }
  | { type: 'RESOLVE_EVENT'; eventId: string; choiceId: string }
  | { type: 'DISMISS_EVENT' }
  | { type: 'ADVANCE_STAGE' }
  | { type: 'RECOVER'; action: 'sellCar' | 'downsize' | 'hardship' | 'hustle' }

// ---- helpers -----------------------------------------------------------

const pushTimeline = (
  s: GameState,
  e: { title: string; detail: string; icon: string; tone: 'good' | 'bad' | 'neutral' | 'milestone' },
) => {
  s.timeline.unshift({ id: uid(), month: s.month, stage: s.stage, ...e })
}

const addXp = (s: GameState, amount: number) => {
  s.xp += Math.max(0, Math.round(amount))
}

const unlockAchievement = (s: GameState, id: string) => {
  if (s.unlockedAchievements.includes(id)) return
  const a = ACHIEVEMENTS.find((x) => x.id === id)
  if (!a) return
  s.unlockedAchievements.push(id)
  addXp(s, a.xp)
  pushTimeline(s, { title: `Achievement: ${a.title}`, detail: a.desc, icon: a.emoji, tone: 'milestone' })
}

const applyEffect = (s: GameState, eff: EventEffect) => {
  if (eff.cash) s.cash += eff.cash
  if (eff.savings) s.savings += eff.savings
  if (eff.xp) addXp(s, eff.xp)
  if (eff.stress) s.stress = Math.max(0, Math.min(100, s.stress + eff.stress))
  if (eff.creditDelta) {
    if (eff.creditDelta < 0) s.missedPayments += Math.ceil(Math.abs(eff.creditDelta) / 40)
  }
  if (eff.learnConcept && !s.knownConcepts.includes(eff.learnConcept)) {
    s.knownConcepts.push(eff.learnConcept)
    const c = CONCEPTS.find((x) => x.id === eff.learnConcept)
    if (c) s.skills[c.skill] += 20
  }
  if (eff.skill) s.skills[eff.skill.key] += eff.skill.amount
  if (eff.addDebt) {
    const existing = s.debts.find((d) => d.type === eff.addDebt!.type && eff.addDebt!.type === 'creditCard')
    if (existing) {
      existing.balance += eff.addDebt.balance
      existing.originalBalance = Math.max(existing.originalBalance, existing.balance)
      existing.minPayment = minPaymentFor(existing.balance, existing.apr, existing.type)
    } else {
      const d: Debt = {
        id: uid(),
        type: eff.addDebt.type,
        name: eff.addDebt.name,
        balance: eff.addDebt.balance,
        apr: eff.addDebt.apr,
        originalBalance: eff.addDebt.balance,
        minPayment: minPaymentFor(eff.addDebt.balance, eff.addDebt.apr, eff.addDebt.type),
      }
      s.debts.push(d)
    }
  }
  if (eff.timeline) pushTimeline(s, eff.timeline)
  s.creditScore = recomputeCreditScore(s)
}

const checkProgress = (s: GameState) => {
  // Achievements (condition-based)
  if (s.job) unlockAchievement(s, 'firstjob')
  if (s.holdings.length > 0) unlockAchievement(s, 'firstinvest')
  if (s.savings >= 1000) unlockAchievement(s, 'efund')
  if (s.creditScore >= 700) unlockAchievement(s, 'credit700')
  if (netWorth(s) >= 10000) unlockAchievement(s, 'net10k')
  if (s.knownConcepts.length >= 6) unlockAchievement(s, 'scholar')

  // Challenges
  const setProgress = (id: string, value: number) => {
    const c = CHALLENGES.find((x) => x.id === id)
    if (!c) return
    s.challengeProgress[id] = value
    if (value >= c.target && !s.completedChallenges.includes(id)) {
      s.completedChallenges.push(id)
      addXp(s, c.xp)
      pushTimeline(s, { title: `Challenge complete: ${c.title}`, detail: c.desc, icon: c.emoji, tone: 'milestone' })
    }
  }
  setProgress('save1000', s.savings)
  setProgress('invest500', portfolioInvested(s))
  setProgress('learn5', s.knownConcepts.length)
  if (s.cash >= 0) setProgress('survive12', s.month)
  setProgress('net5k', Math.max(0, netWorth(s)))
}

const maybeTriggerEvent = (s: GameState) => {
  if (s.pendingEventId || s.inRecovery) return
  if (s.month < 2) return
  if (Math.random() > 0.62) return
  const eligible = EVENTS.filter(
    (e) =>
      !s.seenEvents.includes(e.id) &&
      (!e.minMonth || s.month >= e.minMonth) &&
      (!e.minStage || STAGE_ORDER.indexOf(s.stage) >= STAGE_ORDER.indexOf(e.minStage)),
  )
  if (eligible.length === 0) return
  const pick = eligible[Math.floor(Math.random() * eligible.length)]
  s.pendingEventId = pick.id
}

const advanceMonth = (s: GameState) => {
  s.month += 1
  if (s.month % 12 === 0) s.age += 1

  // Income
  const income = monthlyNetIncome(s)
  s.cash += income
  if (income > 0) {
    s.ledger.unshift({ id: uid(), month: s.month, label: 'Income (net)', amount: income, category: 'income' })
  }

  // Fixed living expenses
  const exp = monthlyExpenses(s)
  const living = exp.rent + exp.transport + exp.living
  s.cash -= living
  s.ledger.unshift({ id: uid(), month: s.month, label: 'Rent, transport & living', amount: -living, category: 'expense' })

  // Debts: accrue interest, apply minimum payment
  let paidAll = true
  for (const d of s.debts) {
    const interest = d.balance * (d.apr / 12)
    d.balance += interest
    const payment = Math.min(d.minPayment, d.balance)
    if (s.cash >= payment) {
      s.cash -= payment
      d.balance -= payment
      s.onTimePayments += 1
    } else if (s.savings >= payment) {
      s.savings -= payment
      d.balance -= payment
      s.onTimePayments += 1
    } else {
      paidAll = false
      s.missedPayments += 1
      s.stress = Math.min(100, s.stress + 6)
    }
    d.minPayment = minPaymentFor(d.balance, d.apr, d.type)
  }
  s.debts = s.debts.filter((d) => d.balance > 1)

  // Overdraft protection: pull from savings if cash negative
  if (s.cash < 0 && s.savings > 0) {
    const cover = Math.min(s.savings, -s.cash)
    s.savings -= cover
    s.cash += cover
  }

  // Investment growth
  for (const h of s.holdings) {
    h.value = Math.max(0, h.value * (1 + monthlyReturn(h.asset)))
  }

  // Credit maturation
  s.creditHistoryMonths += 1
  s.creditScore = recomputeCreditScore(s)

  // Wellbeing drift
  if (s.cash >= 0 && paidAll) s.stress = Math.max(0, s.stress - 2)
  addXp(s, 6)

  s.netWorthHistory.push({ month: s.month, netWorth: Math.round(netWorth(s)) })
  if (s.netWorthHistory.length > 60) s.netWorthHistory.shift()

  maybeTriggerEvent(s)
  checkProgress(s)

  if (inCrisis(s) && !s.inRecovery) {
    s.inRecovery = true
    pushTimeline(s, {
      title: 'Financial crisis',
      detail: 'Money got tight. Time for a recovery plan — not a game over.',
      icon: '🆘',
      tone: 'bad',
    })
  }
}

// ---- reducer -----------------------------------------------------------

function reducer(state: GameState, action: Action): GameState {
  if (action.type === 'RESET') return { ...initialState }

  const s: GameState = structuredClone(state)

  switch (action.type) {
    case 'SET_STEP':
      s.onboardingStep = action.step
      return s

    case 'CREATE_CHARACTER':
      s.character = { name: action.name, avatar: action.avatar, pronouns: action.pronouns, trait: action.trait }
      s.onboardingStep = 'setup'
      return s

    case 'START_LIFE': {
      s.stage = action.stage
      s.started = true
      s.onboardingStep = 'done'
      const trait = s.character.trait
      // Starting resources by stage
      const startCash: Record<LifeStage, number> = { highSchool: 250, college: 600, firstJob: 1200, careerGrowth: 3500, entrepreneurship: 5000 }
      const startSavings: Record<LifeStage, number> = { highSchool: 100, college: 300, firstJob: 800, careerGrowth: 2500, entrepreneurship: 3000 }
      const stipend: Record<LifeStage, number> = { highSchool: 150, college: 250, firstJob: 0, careerGrowth: 0, entrepreneurship: 0 }
      s.cash = startCash[s.stage]
      s.savings = startSavings[s.stage]
      s.monthlyStipend = stipend[s.stage]
      s.age = s.stage === 'highSchool' ? 16 : s.stage === 'college' ? 19 : s.stage === 'firstJob' ? 22 : s.stage === 'careerGrowth' ? 27 : 32
      if (trait === 'saver') { s.savings += 300; s.skills.saving += 20 }
      if (trait === 'scholar') { s.knownConcepts.push('budgeting'); s.skills.budgeting += 30 }
      if (trait === 'dreamer') { s.cash += 200 }
      if (s.stage === 'highSchool') s.housing = { id: 'family', name: 'Family Home', district: 'Residential', monthlyRent: 0, quality: 2, deposit: 0, description: 'Live with family.' }
      pushTimeline(s, { title: `Started life in ${STAGE_LABEL[s.stage]}`, detail: action.goal ? `Goal: ${action.goal}` : 'A fresh start in the city.', icon: '🌟', tone: 'milestone' })
      s.creditScore = recomputeCreditScore(s)
      return s
    }

    case 'ADVANCE_MONTH':
      advanceMonth(s)
      return s

    case 'OPEN_ACCOUNT':
      unlockAchievement(s, 'firstaccount')
      addXp(s, 10)
      s.skills.saving += 10
      pushTimeline(s, { title: 'Opened a savings account', detail: 'First step to building wealth.', icon: '🏦', tone: 'good' })
      checkProgress(s)
      return s

    case 'MOVE_MONEY': {
      const amt = Math.max(0, action.amount)
      if (action.from === 'cash') {
        const m = Math.min(amt, s.cash)
        s.cash -= m
        s.savings += m
      } else {
        const m = Math.min(amt, s.savings)
        s.savings -= m
        s.cash += m
      }
      checkProgress(s)
      return s
    }

    case 'TAKE_JOB':
      s.job = action.job
      s.skills.career += 15
      addXp(s, 30)
      pushTimeline(s, { title: `New job: ${action.job.title}`, detail: `${action.job.employer} · $${action.job.hourlyWage}/hr`, icon: '💼', tone: 'good' })
      unlockAchievement(s, 'firstjob')
      checkProgress(s)
      return s

    case 'QUIT_JOB':
      if (s.job) pushTimeline(s, { title: `Left job: ${s.job.title}`, detail: 'Moving on.', icon: '👋', tone: 'neutral' })
      s.job = null
      return s

    case 'SET_SIDE_HUSTLE':
      s.sideHustle = action.id
      s.monthlyStipend = action.monthly
      if (action.id) {
        s.skills.career += 10
        addXp(s, 15)
        pushTimeline(s, { title: 'Started a side hustle', detail: `Extra ~$${action.monthly}/month.`, icon: '⚡', tone: 'good' })
      }
      return s

    case 'RENT_HOUSING': {
      const h = action.housing
      if (s.cash + s.savings < h.deposit) return s
      if (s.cash >= h.deposit) s.cash -= h.deposit
      else {
        const fromSavings = h.deposit - s.cash
        s.cash = 0
        s.savings -= fromSavings
      }
      s.housing = h
      s.skills.budgeting += 10
      addXp(s, 20)
      pushTimeline(s, { title: `Moved in: ${h.name}`, detail: h.monthlyRent > 0 ? `Rent $${h.monthlyRent}/mo · deposit $${h.deposit}` : 'Living rent-free.', icon: '🔑', tone: 'good' })
      s.creditScore = recomputeCreditScore(s)
      return s
    }

    case 'BUY_TRANSPORT': {
      const t = action.transport
      if (t.price > 0) {
        // Finance cars over the down payment if not enough cash
        const down = Math.min(s.cash, Math.max(t.price * 0.2, Math.min(t.price, 500)))
        s.cash -= down
        const financed = t.price - down
        if (financed > 0) {
          const apr = t.type === 'new' ? 0.07 : 0.12
          s.debts.push({
            id: uid(),
            type: 'autoLoan',
            name: `Auto Loan (${t.name})`,
            balance: financed,
            apr,
            originalBalance: financed,
            minPayment: minPaymentFor(financed, apr, 'autoLoan'),
          })
          pushTimeline(s, { title: `Financed a car`, detail: `${t.name} · $${Math.round(down)} down, $${Math.round(financed)} loan`, icon: '🚗', tone: 'neutral' })
        }
      } else {
        pushTimeline(s, { title: `Transport: ${t.name}`, detail: t.monthlyCost > 0 ? `$${t.monthlyCost}/mo` : 'Free!', icon: '🚌', tone: 'good' })
      }
      s.transport = t
      s.skills.budgeting += 5
      addXp(s, 15)
      s.creditScore = recomputeCreditScore(s)
      checkProgress(s)
      return s
    }

    case 'SPEND': {
      const amt = Math.min(action.amount, s.cash + s.savings)
      if (s.cash >= amt) s.cash -= amt
      else { const fromSav = amt - s.cash; s.cash = 0; s.savings -= fromSav }
      if (action.category === 'want') s.stress = Math.max(0, s.stress - 4)
      pushTimeline(s, { title: action.label, detail: `Spent $${Math.round(amt)}`, icon: '🛍️', tone: 'neutral' })
      return s
    }

    case 'INVEST': {
      const amt = Math.min(action.amount, s.cash)
      if (amt <= 0) return s
      s.cash -= amt
      const existing = s.holdings.find((h) => h.asset === action.asset)
      if (existing) { existing.value += amt; existing.invested += amt }
      else s.holdings.push({ asset: action.asset, value: amt, invested: amt })
      s.skills.investing += 12
      addXp(s, 18)
      if (!s.knownConcepts.includes('compound')) { s.knownConcepts.push('compound') }
      unlockAchievement(s, 'firstinvest')
      pushTimeline(s, { title: `Invested in ${ASSETS[action.asset].name}`, detail: `$${Math.round(amt)} put to work`, icon: '📈', tone: 'good' })
      checkProgress(s)
      return s
    }

    case 'SELL': {
      const h = s.holdings.find((x) => x.asset === action.asset)
      if (!h) return s
      const amt = Math.min(action.amount, h.value)
      h.value -= amt
      h.invested = Math.max(0, h.invested - amt)
      s.cash += amt
      if (h.value < 1) s.holdings = s.holdings.filter((x) => x.asset !== action.asset)
      pushTimeline(s, { title: `Sold ${ASSETS[action.asset].name}`, detail: `Cashed out $${Math.round(amt)}`, icon: '💵', tone: 'neutral' })
      return s
    }

    case 'PAY_DEBT': {
      const d = s.debts.find((x) => x.id === action.debtId)
      if (!d) return s
      const amt = Math.min(action.amount, d.balance, s.cash + s.savings)
      if (s.cash >= amt) s.cash -= amt
      else { const fromSav = amt - s.cash; s.cash = 0; s.savings -= fromSav }
      d.balance -= amt
      s.skills.debt += 12
      addXp(s, 15)
      if (d.balance <= 1) {
        s.debts = s.debts.filter((x) => x.id !== d.id)
        unlockAchievement(s, 'debtfree')
        pushTimeline(s, { title: `Paid off ${d.name}!`, detail: 'Debt eliminated. Huge win.', icon: '⚔️', tone: 'milestone' })
        s.onTimePayments += 3
      }
      s.creditScore = recomputeCreditScore(s)
      checkProgress(s)
      return s
    }

    case 'LEARN': {
      if (!s.knownConcepts.includes(action.conceptId)) {
        s.knownConcepts.push(action.conceptId)
        const c = CONCEPTS.find((x) => x.id === action.conceptId)
        if (c) s.skills[c.skill] += 25
        addXp(s, 20)
        pushTimeline(s, { title: `Learned: ${CONCEPTS.find((x) => x.id === action.conceptId)?.title ?? ''}`, detail: 'New knowledge unlocked.', icon: '💡', tone: 'good' })
      }
      unlockAchievement(s, 'scholar')
      checkProgress(s)
      return s
    }

    case 'RESOLVE_EVENT': {
      const ev = EVENTS.find((e) => e.id === action.eventId)
      const choice = ev?.choices.find((c) => c.id === action.choiceId)
      if (ev && choice) {
        applyEffect(s, choice.effects)
        if (!s.seenEvents.includes(ev.id)) s.seenEvents.push(ev.id)
        s.pendingEventId = null
        checkProgress(s)
      }
      return s
    }

    case 'DISMISS_EVENT':
      s.pendingEventId = null
      return s

    case 'ADVANCE_STAGE': {
      const idx = STAGE_ORDER.indexOf(s.stage)
      if (idx < STAGE_ORDER.length - 1) {
        s.stage = STAGE_ORDER[idx + 1]
        s.age += 1
        addXp(s, 40)
        unlockAchievement(s, 'stage')
        pushTimeline(s, { title: `Life stage: ${STAGE_LABEL[s.stage]}`, detail: 'A new chapter begins.', icon: '🌟', tone: 'milestone' })
      }
      return s
    }

    case 'RECOVER': {
      switch (action.action) {
        case 'sellCar':
          if (s.transport && s.transport.price > 0) {
            const resale = s.transport.price * 0.5
            s.cash += resale
            s.debts = s.debts.filter((d) => d.type !== 'autoLoan')
            s.transport = { id: 'transit', name: 'Transit Pass', type: 'transit', price: 0, monthlyCost: 70, reliability: 4, description: 'Reliable city transit.' }
            pushTimeline(s, { title: 'Sold the car', detail: `Recovered ~$${Math.round(resale)} and cleared the auto loan.`, icon: '🚌', tone: 'good' })
          }
          break
        case 'downsize':
          s.housing = { id: 'family', name: 'Moved in with family', district: 'Residential', monthlyRent: 0, quality: 2, deposit: 0, description: 'Temporary reset to rebuild.' }
          pushTimeline(s, { title: 'Downsized housing', detail: 'Cut rent to $0 to rebuild savings.', icon: '🏠', tone: 'good' })
          break
        case 'hardship':
          for (const d of s.debts) { d.apr = Math.max(0, d.apr - 0.1); d.minPayment = minPaymentFor(d.balance, d.apr, d.type) }
          pushTimeline(s, { title: 'Enrolled in a hardship plan', detail: 'Lenders lowered your APR while you recover.', icon: '🤝', tone: 'good' })
          break
        case 'hustle':
          s.cash += 400
          s.skills.career += 15
          pushTimeline(s, { title: 'Picked up gig work', detail: 'Earned a fast $400 to stabilize.', icon: '⚡', tone: 'good' })
          break
      }
      s.stress = Math.max(0, s.stress - 12)
      s.creditScore = recomputeCreditScore(s)
      if (!inCrisis(s)) {
        s.inRecovery = false
        addXp(s, 60)
        pushTimeline(s, { title: 'Back on your feet', detail: 'You recovered from a financial crisis. That resilience matters.', icon: '💪', tone: 'milestone' })
      }
      checkProgress(s)
      return s
    }

    default:
      return s
  }
}

// ---- persistence + context --------------------------------------------

function load(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as GameState
      return { ...initialState, ...parsed, skills: { ...initialState.skills, ...parsed.skills } }
    }
  } catch {
    /* ignore */
  }
  return initialState
}

interface Ctx {
  state: GameState
  dispatch: React.Dispatch<Action>
}

const GameContext = createContext<Ctx | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* ignore */
    }
  }, [state])

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>
}

export function useGame(): Ctx {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
