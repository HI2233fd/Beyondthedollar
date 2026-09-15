import { create, type StoreApi, type UseBoundStore } from 'zustand'
import { CURRICULUM, unlockedAfterCompleting } from './curriculum'
import { MINUTES_PER_DAY, START_TOTAL_MINUTES, stampFromMinutes } from './simulation/time'
import { getScenario, registerRuntimeScenario, type ScenarioStat } from './simulation/scenarios'
import {
  billInDays,
  removeBillsByCategory,
  upsertBill,
  type RecurringBill,
} from './simulation/bills'
import {
  buildRandomExpenseScenario,
  rollNextExpenseAt,
  type ExpenseContext,
} from './simulation/randomExpenses'
import {
  INITIAL_ASSETS,
  stepPrices,
  type AssetId,
  type Holdings,
} from './simulation/investing'
import {
  CAR_CREDIT_MIN,
  CAR_SAVINGS_MIN,
  CREDIT_PRODUCT_MIN,
  CREDIT_SCORE_ON_FILE,
  GRADUATION_CASH,
  HOME_CREDIT_MIN,
  HOME_DOWN_PAYMENT,
  INVEST_SAVINGS_MIN,
} from './simulation/progression'

export type SceneId = 'city' | 'bank' | 'grocery' | 'college' | 'office' | 'home'

export interface DialogueOption {
  label: string
  next?: Dialogue
  action?: () => void
  close?: boolean
}

export interface Dialogue {
  name: string
  text: string
  options: DialogueOption[]
}

export interface CartItem {
  id: string
  name: string
  price: number
}

export interface Spawn {
  pos: [number, number, number]
  yaw: number
}

export type CarStatus = 'none' | 'owned' | 'leased'
export type HomeStatus = 'renting' | 'owned'

export interface Paystub {
  id: string
  atTotalMinutes: number
  employer: string
  gross: number
  tax: number
  net: number
}

export interface LedgerEntry {
  id: string
  atTotalMinutes: number
  label: string
  amount: number
  kind: 'bill' | 'paycheck' | 'expense' | 'interest' | 'late-fee'
  status: 'paid' | 'missed'
}

export const CAR_BUY_DOWN = 2000
export const CAR_LOAN_MONTHLY = 280
export const CAR_LEASE_MONTHLY = 249
export const CAR_INSURANCE_MONTHLY = 110
export const CAR_MAINTENANCE_MONTHLY = 40

export const RENT_MONTHLY = 900
export const MORTGAGE_MONTHLY = 1050
export const PROPERTY_TAX_MONTHLY = 150
export const HOME_MAINTENANCE_MONTHLY = 100

export { HOME_CREDIT_MIN, HOME_DOWN_PAYMENT, INVEST_SAVINGS_MIN, CREDIT_PRODUCT_MIN }

interface GameState {
  cash: number
  bank: number
  savings: number
  weeklyIncome: number
  monthlyExpenses: number
  creditScore: number
  creditEstablished: boolean
  debt: number
  education: string
  career: string
  transportationAvailable: boolean
  hasCheckingAccount: boolean
  hasCreditCard: boolean

  scene: SceneId
  spawn: Spawn | null
  transitioning: boolean

  prompt: string | null
  dialogue: Dialogue | null

  cart: CartItem[]

  lifeEventActive: boolean
  lifeEventShown: boolean
  lifeEventOutcome: string | null

  hasJob: boolean
  incomeFactor: number
  incomeFactorUntil: number
  nextPaydayAt: number

  completedTopicIds: string[]
  unlockedUnitNumber: number
  activeLessonId: string | null
  activeQuizId: string | null
  quizAnswers: Record<string, number>
  quizSubmitted: boolean

  totalMinutes: number
  timeScale: number

  activeScenarioId: string | null
  scenarioChoiceId: string | null
  scenarioWhyOverride: string | null
  firedTriggerIds: string[]
  engagedScenarioIds: string[]

  recurringBills: RecurringBill[]
  /** Bill ids that are due and waiting for a Scenario resolution. */
  dueBillIds: string[]
  lastBillNotice: string | null
  lastMarketNotice: string | null
  recentlyMissedBill: boolean

  /** Random life-expense scheduler. */
  nextRandomExpenseAt: number
  /** After the first expense, use the normal 5–15 day spacing. */
  randomExpenseCount: number

  /** Job interview progress (null = not interviewing). */
  interviewCorrect: number
  interviewAsked: number
  interviewActive: boolean

  assetPrices: Record<AssetId, number>
  holdings: Holdings
  lastPriceDayIndex: number
  investingPanelOpen: boolean
  investingIntroSeen: boolean

  phoneOpen: boolean
  paystubs: Paystub[]
  ledger: LedgerEntry[]

  carStatus: CarStatus
  homeStatus: HomeStatus

  setPrompt: (p: string | null) => void
  openDialogue: (d: Dialogue) => void
  closeDialogue: () => void
  enterScene: (scene: SceneId, spawn: Spawn) => void
  finishTransition: () => void

  openCheckingAccount: () => void
  deposit: (amount: number) => string | null
  withdraw: (amount: number) => string | null
  openSavings: (amount: number) => string | null
  transferToSavings: (amount: number) => string | null
  applyForCreditCard: () => string | null
  applyJob: () => string | null

  addToCart: (item: CartItem) => void
  clearCart: () => void
  checkout: () => number

  triggerLifeEvent: () => void
  resolveLifeEvent: (choice: 'savings' | 'credit' | 'delay') => void
  dismissLifeEventOutcome: () => void

  openLesson: (lessonId: string) => void
  closeLesson: () => void
  startQuiz: (quizId: string) => void
  answerQuiz: (questionId: string, choiceIndex: number) => void
  submitQuiz: () => void
  closeQuiz: () => void

  advanceTime: (deltaMinutes: number) => void
  setTimeScale: (scale: number) => void
  openScenario: (scenarioId: string, triggerId?: string) => void
  chooseScenarioOption: (choiceId: string) => void
  dismissScenario: () => void
  dismissBillNotice: () => void
  dismissMarketNotice: () => void

  openPhone: () => void
  closePhone: () => void

  openInvestingPanel: () => void
  closeInvestingPanel: () => void
  buyAsset: (id: AssetId, shares?: number) => string | null
  sellAsset: (id: AssetId, shares?: number) => string | null

  openCarDealScenario: () => void
  openHomeDealScenario: () => void

  beginInterview: () => string | null
  answerInterview: (correct: boolean) => void
  finishInterview: () => { hired: boolean; message: string }
}

function liquidFunds(s: { bank: number; savings: number; cash: number }) {
  return s.bank + s.savings + s.cash
}

function takeFromLiquid(
  s: { bank: number; savings: number; cash: number },
  amount: number,
): { bank: number; savings: number; cash: number } | null {
  if (liquidFunds(s) < amount) return null
  let left = amount
  let bank = s.bank
  let savings = s.savings
  let cash = s.cash
  const fromBank = Math.min(bank, left)
  bank -= fromBank
  left -= fromBank
  const fromSavings = Math.min(savings, left)
  savings -= fromSavings
  left -= fromSavings
  cash -= left
  return { bank, savings, cash }
}

function pushLedger(list: LedgerEntry[], entry: LedgerEntry, cap = 40): LedgerEntry[] {
  return [entry, ...list].slice(0, cap)
}

function bumpCredit(score: number, established: boolean, delta: number): number {
  if (!established) return score
  return Math.max(300, Math.min(850, score + delta))
}

type UseGameStore = UseBoundStore<StoreApi<GameState>>

/** Survives Vite HMR so Phone/HUD/NPC never diverge onto a fresh empty store. */
const STORE_GLOBAL = '__beyondTheDollarUseGame' as const

function createGameStore(): UseGameStore {
  return create<GameState>((set, get) => ({
  cash: GRADUATION_CASH,
  bank: 0,
  savings: 0,
  weeklyIncome: 0,
  monthlyExpenses: RENT_MONTHLY,
  creditScore: 0,
  creditEstablished: false,
  debt: 0,
  education: 'High School graduate',
  career: 'Unemployed',
  transportationAvailable: true,
  hasCheckingAccount: false,
  hasCreditCard: false,

  scene: 'city',
  spawn: null,
  transitioning: false,

  prompt: null,
  dialogue: null,

  cart: [],

  lifeEventActive: false,
  lifeEventShown: true,
  lifeEventOutcome: null,

  hasJob: false,
  incomeFactor: 1,
  incomeFactorUntil: 0,
  nextPaydayAt: START_TOTAL_MINUTES + 7 * MINUTES_PER_DAY,

  completedTopicIds: [],
  unlockedUnitNumber: 1,
  activeLessonId: null,
  activeQuizId: null,
  quizAnswers: {},
  quizSubmitted: false,

  totalMinutes: START_TOTAL_MINUTES,
  timeScale: 1,

  activeScenarioId: null,
  scenarioChoiceId: null,
  scenarioWhyOverride: null,
  firedTriggerIds: [],
  engagedScenarioIds: [],

  recurringBills: [
    billInDays('rent-maple', 'Maple Apartments rent', RENT_MONTHLY, 30, START_TOTAL_MINUTES, 'rent', 2),
  ],
  dueBillIds: [],
  lastBillNotice: null,
  lastMarketNotice: null,
  recentlyMissedBill: false,

  nextRandomExpenseAt: rollNextExpenseAt(START_TOTAL_MINUTES, { first: true }),
  randomExpenseCount: 0,

  interviewCorrect: 0,
  interviewAsked: 0,
  interviewActive: false,
  assetPrices: { stock: INITIAL_ASSETS.stock.price, bond: INITIAL_ASSETS.bond.price },
  holdings: { stock: 0, bond: 0 },
  lastPriceDayIndex: stampFromMinutes(START_TOTAL_MINUTES).dayIndex,
  investingPanelOpen: false,
  investingIntroSeen: false,

  phoneOpen: false,
  paystubs: [],
  ledger: [],

  carStatus: 'none',
  homeStatus: 'renting',

  setPrompt: (p) => {
    if (get().prompt !== p) set({ prompt: p })
  },
  openDialogue: (d) => set({ dialogue: d, prompt: null, phoneOpen: false }),
  closeDialogue: () => {
    if (get().dialogue) set({ dialogue: null })
  },

  enterScene: (scene, spawn) =>
    set({
      transitioning: true,
      scene,
      spawn,
      dialogue: null,
      prompt: null,
      investingPanelOpen: false,
      phoneOpen: false,
    }),
  finishTransition: () => set({ transitioning: false }),

  openCheckingAccount: () => {
    const s = get()
    if (s.hasCheckingAccount) return
    const deposit = Math.min(s.cash, GRADUATION_CASH)
    set({
      hasCheckingAccount: true,
      bank: s.bank + deposit,
      cash: s.cash - deposit,
      creditEstablished: true,
      creditScore: s.creditEstablished ? s.creditScore : CREDIT_SCORE_ON_FILE,
    })
  },
  deposit: (amount) => {
    const s = get()
    if (!s.hasCheckingAccount) return 'Open a checking account first.'
    const amt = Math.min(amount, s.cash)
    if (amt <= 0) return 'No cash to deposit.'
    set({ cash: s.cash - amt, bank: s.bank + amt })
    return null
  },
  withdraw: (amount) => {
    const s = get()
    if (!s.hasCheckingAccount) return 'Open a checking account first.'
    const amt = Math.min(amount, s.bank)
    set({ bank: s.bank - amt, cash: s.cash + amt })
    return null
  },
  openSavings: (amount) => {
    const s = get()
    if (!s.hasCheckingAccount) return 'Open a checking account first.'
    const amt = Math.min(amount, s.cash + s.bank)
    if (amt <= 0) return 'Nothing to move into savings.'
    let left = amt
    let cash = s.cash
    let bank = s.bank
    const fromCash = Math.min(cash, left)
    cash -= fromCash
    left -= fromCash
    bank -= left
    set({
      cash,
      bank,
      savings: s.savings + amt,
      creditEstablished: true,
      creditScore: s.creditEstablished ? bumpCredit(s.creditScore, true, 1) : CREDIT_SCORE_ON_FILE,
    })
    return null
  },
  transferToSavings: (amount) => {
    const s = get()
    if (!s.hasCheckingAccount) return 'Open a checking account first.'
    const amt = Math.min(amount, s.bank)
    set({
      bank: s.bank - amt,
      savings: s.savings + amt,
      creditEstablished: true,
      creditScore: s.creditEstablished ? bumpCredit(s.creditScore, true, 1) : CREDIT_SCORE_ON_FILE,
    })
    return null
  },
  applyForCreditCard: () => {
    const s = get()
    if (!s.hasCheckingAccount) return 'Open a checking account first.'
    if (!s.creditEstablished) return 'No credit history yet — bank activity and on-time bills build it.'
    if (s.creditScore < CREDIT_PRODUCT_MIN) {
      return `Credit score ${s.creditScore} is below ${CREDIT_PRODUCT_MIN}. Keep paying on time.`
    }
    if (s.hasCreditCard) return 'You already have a card on file.'
    set({ hasCreditCard: true })
    return null
  },
  applyJob: () => {
    const s = get()
    if (!s.hasCheckingAccount) return 'Employers want direct deposit — open checking at the bank first.'
    if (s.hasJob) return 'You already have this job.'
    if (!s.interviewActive) return 'Start the interview with Diane first.'
    return 'Finish the interview questions first.'
  },

  beginInterview: () => {
    const s = get()
    if (s.hasJob) return 'You already work here.'
    if (!s.hasCheckingAccount) return 'Direct deposit required — open a checking account at FirstCity Bank first.'
    // Education gate: high-school grad is enough for this role; flag if somehow missing.
    if (!/high school/i.test(s.education)) {
      return 'This role requires a high school diploma (or equivalent).'
    }
    set({ interviewActive: true, interviewCorrect: 0, interviewAsked: 0 })
    return null
  },
  answerInterview: (correct) => {
    const s = get()
    if (!s.interviewActive) return
    set({
      interviewAsked: s.interviewAsked + 1,
      interviewCorrect: s.interviewCorrect + (correct ? 1 : 0),
    })
  },
  finishInterview: () => {
    const s = get()
    if (!s.interviewActive) return { hired: false, message: 'No interview in progress.' }
    // Base chance from answers (3 questions): 0/3→15%, 1/3→40%, 2/3→70%, 3/3→90%
    const rates = [0.15, 0.4, 0.7, 0.9]
    const rate = rates[Math.min(3, s.interviewCorrect)] ?? 0.15
    const roll = Math.random()
    const hired = roll < rate
    const score = s.interviewCorrect
    if (hired) {
      const nextPay = s.totalMinutes + 7 * MINUTES_PER_DAY
      const message = `You’re hired as Office Assistant ($16/hr, 15 hrs/week, ~$240 gross). Interview score ${score}/3. Direct deposit hits checking weekly — open your Phone to confirm job status and upcoming payday.`
      set({
        hasJob: true,
        career: 'Office Assistant',
        weeklyIncome: 16 * 15,
        nextPaydayAt: nextPay,
        interviewActive: false,
        interviewCorrect: 0,
        interviewAsked: 0,
        lastBillNotice: 'Hired · Office Assistant — check Phone for job & payday',
      })
      return { hired: true, message }
    }
    set({ interviewActive: false, interviewCorrect: 0, interviewAsked: 0 })
    return {
      hired: false,
      message: `Not this time — you scored ${score}/3. Review the role and try applying again later.`,
    }
  },

  addToCart: (item) => set({ cart: [...get().cart, item] }),
  clearCart: () => set({ cart: [] }),
  checkout: () => {
    const { cart, cash } = get()
    const total = cart.reduce((sum, i) => sum + i.price, 0)
    const paid = Math.min(total, cash)
    set({ cash: cash - paid, cart: [] })
    return total
  },

  triggerLifeEvent: () => {
    if (!get().lifeEventShown) set({ lifeEventActive: true, lifeEventShown: true })
  },
  resolveLifeEvent: () => set({ lifeEventActive: false, lifeEventOutcome: null }),
  dismissLifeEventOutcome: () => set({ lifeEventOutcome: null }),

  openLesson: (lessonId) =>
    set({
      activeLessonId: lessonId,
      activeQuizId: null,
      quizAnswers: {},
      quizSubmitted: false,
      dialogue: null,
      prompt: null,
      investingPanelOpen: false,
      phoneOpen: false,
    }),
  closeLesson: () => set({ activeLessonId: null }),
  startQuiz: (quizId) =>
    set({ activeQuizId: quizId, activeLessonId: null, quizAnswers: {}, quizSubmitted: false }),
  answerQuiz: (questionId, choiceIndex) => {
    if (get().quizSubmitted) return
    set({ quizAnswers: { ...get().quizAnswers, [questionId]: choiceIndex } })
  },
  submitQuiz: () => {
    const { activeQuizId, quizAnswers, completedTopicIds, unlockedUnitNumber } = get()
    if (!activeQuizId) return
    const found = CURRICULUM.flatMap((u) => u.topics.map((t) => ({ topic: t, lesson: t.lesson }))).find(
      (x) => x.lesson.quiz.id === activeQuizId,
    )
    if (!found) return
    const perfect = found.lesson.quiz.questions.every((qq) => quizAnswers[qq.id] === qq.correctIndex)
    set({ quizSubmitted: true })
    if (!perfect || completedTopicIds.includes(found.topic.id)) return
    const nextCompleted = [...completedTopicIds, found.topic.id]
    set({
      completedTopicIds: nextCompleted,
      unlockedUnitNumber: unlockedAfterCompleting(nextCompleted, unlockedUnitNumber),
    })
  },
  closeQuiz: () => set({ activeQuizId: null, quizAnswers: {}, quizSubmitted: false }),

  advanceTime: (deltaMinutes) => {
    if (deltaMinutes <= 0) return
    const prev = get()
    const totalMinutes = prev.totalMinutes + deltaMinutes
    const day = stampFromMinutes(totalMinutes).dayIndex

    let assetPrices = prev.assetPrices
    let lastPriceDayIndex = prev.lastPriceDayIndex
    let lastMarketNotice = prev.lastMarketNotice
    if (day > lastPriceDayIndex) {
      for (let d = lastPriceDayIndex; d < day; d++) {
        const stepped = stepPrices(assetPrices)
        assetPrices = stepped.prices
        if (stepped.eventNote) lastMarketNotice = stepped.eventNote
      }
      lastPriceDayIndex = day
    }

    let incomeFactor = prev.incomeFactor
    if (prev.incomeFactorUntil > 0 && totalMinutes >= prev.incomeFactorUntil) {
      incomeFactor = 1
    }

    let bank = prev.bank
    let savings = prev.savings
    let cash = prev.cash
    let debt = prev.debt
    let creditScore = prev.creditScore
    let creditEstablished = prev.creditEstablished
    let lastBillNotice = prev.lastBillNotice
    let recentlyMissedBill = prev.recentlyMissedBill
    let ledger = prev.ledger
    let paystubs = prev.paystubs
    let nextPaydayAt = prev.nextPaydayAt
    let dueBillIds = [...prev.dueBillIds]
    const recurringBills = prev.recurringBills.map((b) => ({ ...b }))

    // Paydays (weekly) — require checking for direct deposit
    if (prev.hasJob && prev.hasCheckingAccount) {
      let guard = 0
      while (totalMinutes >= nextPaydayAt && guard++ < 8) {
        const gross = Math.round(prev.weeklyIncome * incomeFactor)
        const tax = Math.round(gross * 0.18)
        const net = gross - tax
        bank += net
        const stub: Paystub = {
          id: `pay-${nextPaydayAt}`,
          atTotalMinutes: nextPaydayAt,
          employer: 'Summit Office',
          gross,
          tax,
          net,
        }
        paystubs = [stub, ...paystubs].slice(0, 20)
        ledger = pushLedger(ledger, {
          id: `led-pay-${nextPaydayAt}`,
          atTotalMinutes: nextPaydayAt,
          label: 'Paycheck (direct deposit)',
          amount: net,
          kind: 'paycheck',
          status: 'paid',
        })
        lastBillNotice = `Paycheck deposited: $${net}`
        nextPaydayAt += 7 * MINUTES_PER_DAY
      }
    }

    // Queue due bills for Scenario resolution (do not silently auto-pay).
    for (const bill of recurringBills) {
      if (totalMinutes >= bill.nextDueTotalMinutes && !dueBillIds.includes(bill.id)) {
        dueBillIds.push(bill.id)
        if (import.meta.env.DEV) {
          console.debug('[bills] due', bill.id, bill.label, bill.amount, 'at', totalMinutes)
        }
      }
    }

    set({
      totalMinutes,
      assetPrices,
      lastPriceDayIndex,
      lastMarketNotice,
      incomeFactor,
      incomeFactorUntil: incomeFactor === 1 ? 0 : prev.incomeFactorUntil,
      recurringBills,
      dueBillIds,
      bank,
      savings,
      cash,
      debt,
      creditScore,
      creditEstablished,
      lastBillNotice,
      recentlyMissedBill,
      ledger,
      paystubs,
      nextPaydayAt,
    })
  },
  setTimeScale: (scale) => set({ timeScale: Math.max(0, scale) }),

  openScenario: (scenarioId, triggerId) => {
    if (!getScenario(scenarioId)) return
    if (get().activeScenarioId) return
    set((s) => ({
      activeScenarioId: scenarioId,
      scenarioChoiceId: null,
      scenarioWhyOverride: null,
      dialogue: null,
      prompt: null,
      investingPanelOpen: false,
      phoneOpen: false,
      firedTriggerIds:
        triggerId && !s.firedTriggerIds.includes(triggerId)
          ? [...s.firedTriggerIds, triggerId]
          : s.firedTriggerIds,
    }))
  },
  chooseScenarioOption: (choiceId) => {
    const state = get()
    const { activeScenarioId } = state
    if (!activeScenarioId || state.scenarioChoiceId) return
    const scenario = getScenario(activeScenarioId)
    const choice = scenario?.choices.find((c) => c.id === choiceId)
    if (!choice) return

    const patch: Record<string, unknown> = {
      scenarioChoiceId: choiceId,
      scenarioWhyOverride: null,
    }
    let ledger = state.ledger

    const stats = choice.effects.stats
    if (stats) {
      ;(Object.keys(stats) as ScenarioStat[]).forEach((key) => {
        const delta = stats[key]
        if (delta == null) return
        const cur = state[key]
        if (typeof cur === 'number') patch[key] = cur + delta
      })
    }
    const flags = choice.effects.flags
    if (flags) {
      if (flags.hasJob != null) patch.hasJob = flags.hasJob
      if (flags.transportationAvailable != null) patch.transportationAvailable = flags.transportationAvailable
    }

    const pay = choice.effects.payExpense
    if (pay) {
      if (pay.from === 'savings') {
        if (state.savings >= pay.amount) {
          patch.savings = state.savings - pay.amount
          ledger = pushLedger(ledger, {
            id: `led-exp-${state.totalMinutes}`,
            atTotalMinutes: state.totalMinutes,
            label: scenario?.title ?? 'Expense',
            amount: pay.amount,
            kind: 'expense',
            status: 'paid',
          })
        } else {
          patch.scenarioWhyOverride =
            'Not enough savings — the bill went on credit instead, and your score took a small hit.'
          patch.debt = state.debt + pay.amount
          patch.creditScore = bumpCredit(state.creditScore, true, -10)
          patch.creditEstablished = true
        }
      } else if (pay.from === 'bank') {
        if (state.bank >= pay.amount) {
          patch.bank = state.bank - pay.amount
          ledger = pushLedger(ledger, {
            id: `led-exp-${state.totalMinutes}`,
            atTotalMinutes: state.totalMinutes,
            label: scenario?.title ?? 'Expense',
            amount: pay.amount,
            kind: 'expense',
            status: 'paid',
          })
        } else {
          patch.scenarioWhyOverride =
            'Checking couldn’t cover it — the rest went on credit with a score ding.'
          const fromBank = state.bank
          patch.bank = 0
          patch.debt = state.debt + (pay.amount - fromBank)
          patch.creditScore = bumpCredit(state.creditScore, true, -10)
          patch.creditEstablished = true
        }
      } else if (pay.from === 'cash') {
        if (state.cash >= pay.amount) patch.cash = state.cash - pay.amount
        else {
          patch.scenarioWhyOverride = 'Not enough cash — credit covered the gap.'
          patch.debt = state.debt + pay.amount
          patch.creditScore = bumpCredit(state.creditScore, true, -8)
          patch.creditEstablished = true
        }
      } else if (pay.from === 'credit') {
        if (!state.hasCreditCard && state.creditScore < CREDIT_PRODUCT_MIN && state.creditEstablished) {
          patch.scenarioWhyOverride = `No credit product yet (need score ≥ ${CREDIT_PRODUCT_MIN}). The bill was delayed and may cost more later.`
          patch.recentlyMissedBill = true
        } else {
          patch.debt = state.debt + pay.amount
          patch.creditScore = bumpCredit(state.creditScore, true, -12)
          patch.creditEstablished = true
          ledger = pushLedger(ledger, {
            id: `led-cred-${state.totalMinutes}`,
            atTotalMinutes: state.totalMinutes,
            label: scenario?.title ?? 'Credit charge',
            amount: pay.amount,
            kind: 'expense',
            status: 'paid',
          })
        }
      } else if (pay.from === 'delay') {
        if (activeScenarioId.includes('car-repair')) patch.transportationAvailable = false
        patch.creditScore = bumpCredit(state.creditScore, state.creditEstablished, -3)
        patch.recentlyMissedBill = true
      }
    }

    const billPay = choice.effects.billPay
    if (billPay) {
      const bill = state.recurringBills.find((b) => b.id === billPay.billId)
      if (bill) {
        const amount = bill.amount
        let paidOk = false
        if (billPay.from === 'bank' && state.bank >= amount) {
          patch.bank = state.bank - amount
          paidOk = true
        } else if (billPay.from === 'savings' && state.savings >= amount) {
          patch.savings = state.savings - amount
          paidOk = true
        } else if (billPay.from === 'cash' && state.cash >= amount) {
          patch.cash = state.cash - amount
          paidOk = true
        } else if (billPay.from !== 'miss') {
          patch.scenarioWhyOverride = `Not enough in that account for $${amount}. The payment was missed and added to debt.`
        }

        const bills = state.recurringBills.map((b) =>
          b.id === bill.id
            ? { ...b, nextDueTotalMinutes: Math.max(b.nextDueTotalMinutes, state.totalMinutes) + b.everyDays * MINUTES_PER_DAY }
            : b,
        )
        patch.recurringBills = bills
        patch.dueBillIds = state.dueBillIds.filter((id) => id !== bill.id)

        if (paidOk) {
          patch.creditEstablished = true
          patch.creditScore = state.creditEstablished
            ? bumpCredit(state.creditScore, true, 4)
            : CREDIT_SCORE_ON_FILE + 4
          patch.lastBillNotice = `Paid $${amount} — ${bill.label}`
          ledger = pushLedger(ledger, {
            id: `led-${bill.id}-${state.totalMinutes}`,
            atTotalMinutes: state.totalMinutes,
            label: bill.label,
            amount,
            kind: 'bill',
            status: 'paid',
          })
        } else {
          patch.debt = (typeof patch.debt === 'number' ? patch.debt : state.debt) + amount
          patch.creditEstablished = true
          patch.creditScore = bumpCredit(state.creditEstablished ? state.creditScore : CREDIT_SCORE_ON_FILE, true, -12)
          patch.recentlyMissedBill = true
          patch.lastBillNotice = `Missed $${amount} — ${bill.label} (added to debt)`
          if (!patch.scenarioWhyOverride) {
            patch.scenarioWhyOverride =
              'Missing rent/bills adds debt and hurts your credit. Catch up when you can.'
          }
          ledger = pushLedger(ledger, {
            id: `led-miss-${bill.id}-${state.totalMinutes}`,
            atTotalMinutes: state.totalMinutes,
            label: bill.label,
            amount,
            kind: 'bill',
            status: 'missed',
          })
        }
      }
    }

    if (choice.effects.hoursCut) {
      const { weeklyLoss, days } = choice.effects.hoursCut
      const base = state.weeklyIncome || 240
      const factor = Math.max(0.35, 1 - weeklyLoss / Math.max(base, 1))
      patch.incomeFactor = Math.min(state.incomeFactor, factor)
      patch.incomeFactorUntil = state.totalMinutes + days * MINUTES_PER_DAY
    }

    if (choice.effects.rentHike != null) {
      const hike = choice.effects.rentHike
      const bills = state.recurringBills.map((b) =>
        b.category === 'rent' ? { ...b, amount: b.amount + hike, label: `Maple rent ($${b.amount + hike})` } : b,
      )
      patch.recurringBills = bills
      patch.monthlyExpenses = (typeof patch.monthlyExpenses === 'number' ? patch.monthlyExpenses : state.monthlyExpenses) + hike
    }

    if (choice.effects.carDeal === 'buy') {
      if (!state.hasJob) {
        patch.scenarioWhyOverride = 'Dealers want steady income. Get hired first, then come back.'
      } else if (!state.creditEstablished || state.creditScore < CAR_CREDIT_MIN) {
        patch.scenarioWhyOverride = `Credit score too low for a car loan (need ${CAR_CREDIT_MIN}+). Keep paying bills on time.`
      } else if (state.savings < CAR_SAVINGS_MIN) {
        patch.scenarioWhyOverride = `Build at least $${CAR_SAVINGS_MIN} in savings before taking on a car.`
      } else {
        const paid = takeFromLiquid(state, CAR_BUY_DOWN)
        if (!paid) {
          patch.scenarioWhyOverride = 'You need $2,000 liquid for the down payment.'
        } else {
          let bills = removeBillsByCategory(state.recurringBills, [
            'car-loan',
            'car-lease',
            'car-insurance',
            'car-maintenance',
          ])
          bills = upsertBill(
            bills,
            billInDays('car-loan', 'Car loan payment', CAR_LOAN_MONTHLY, 30, state.totalMinutes, 'car-loan', 30),
          )
          bills = upsertBill(
            bills,
            billInDays(
              'car-insurance',
              'Car insurance',
              CAR_INSURANCE_MONTHLY,
              30,
              state.totalMinutes,
              'car-insurance',
              30,
            ),
          )
          bills = upsertBill(
            bills,
            billInDays(
              'car-maint',
              'Car maintenance fund',
              CAR_MAINTENANCE_MONTHLY,
              30,
              state.totalMinutes,
              'car-maintenance',
              30,
            ),
          )
          Object.assign(patch, paid)
          patch.carStatus = 'owned'
          patch.transportationAvailable = true
          patch.debt = state.debt + 10000
          patch.recurringBills = bills
        }
      }
    } else if (choice.effects.carDeal === 'lease') {
      if (!state.hasJob) {
        patch.scenarioWhyOverride = 'Leases need proof of income. Get a job first.'
      } else if (!state.creditEstablished || state.creditScore < CAR_CREDIT_MIN) {
        patch.scenarioWhyOverride = `Credit score too low to lease (need ${CAR_CREDIT_MIN}+).`
      } else {
        let bills = removeBillsByCategory(state.recurringBills, [
          'car-loan',
          'car-lease',
          'car-insurance',
          'car-maintenance',
        ])
        bills = upsertBill(
          bills,
          billInDays('car-lease', 'Car lease payment', CAR_LEASE_MONTHLY, 30, state.totalMinutes, 'car-lease', 30),
        )
        bills = upsertBill(
          bills,
          billInDays(
            'car-insurance',
            'Car insurance',
            CAR_INSURANCE_MONTHLY,
            30,
            state.totalMinutes,
            'car-insurance',
            30,
          ),
        )
        patch.carStatus = 'leased'
        patch.transportationAvailable = true
        patch.recurringBills = bills
      }
    }

    if (choice.effects.homeDeal === 'buy') {
      if (!state.creditEstablished || state.creditScore < HOME_CREDIT_MIN) {
        patch.scenarioWhyOverride = `Credit score ${state.creditEstablished ? state.creditScore : 'unrated'} is below ${HOME_CREDIT_MIN}. Keep paying on time.`
      } else {
        const paid = takeFromLiquid(state, HOME_DOWN_PAYMENT)
        if (!paid) {
          patch.scenarioWhyOverride = `You need $${HOME_DOWN_PAYMENT.toLocaleString()} liquid for the down payment.`
        } else {
          let bills = removeBillsByCategory(state.recurringBills, [
            'rent',
            'mortgage',
            'property-tax',
            'home-maintenance',
          ])
          bills = upsertBill(
            bills,
            billInDays('mortgage', 'Mortgage payment', MORTGAGE_MONTHLY, 30, state.totalMinutes, 'mortgage', 30),
          )
          bills = upsertBill(
            bills,
            billInDays(
              'prop-tax',
              'Property tax escrow',
              PROPERTY_TAX_MONTHLY,
              30,
              state.totalMinutes,
              'property-tax',
              30,
            ),
          )
          bills = upsertBill(
            bills,
            billInDays(
              'home-maint',
              'Home maintenance',
              HOME_MAINTENANCE_MONTHLY,
              30,
              state.totalMinutes,
              'home-maintenance',
              30,
            ),
          )
          Object.assign(patch, paid)
          patch.homeStatus = 'owned'
          patch.debt = (typeof patch.debt === 'number' ? patch.debt : state.debt) + 165000
          patch.recurringBills = bills
        }
      }
    } else if (choice.effects.homeDeal === 'keep-rent') {
      let bills = removeBillsByCategory(state.recurringBills, [
        'rent',
        'mortgage',
        'property-tax',
        'home-maintenance',
      ])
      const rentBill = state.recurringBills.find((b) => b.category === 'rent')
      const rentAmt = rentBill?.amount ?? RENT_MONTHLY
      bills = upsertBill(
        bills,
        billInDays('rent-maple', 'Maple Apartments rent', rentAmt, 30, state.totalMinutes, 'rent', 30),
      )
      patch.homeStatus = 'renting'
      patch.recurringBills = bills
    }

    patch.ledger = ledger
    set(patch as Partial<GameState>)
  },
  dismissScenario: () => {
    const { activeScenarioId, engagedScenarioIds, investingIntroSeen } = get()
    if (!activeScenarioId) return
    const openInvest = activeScenarioId === 'investing-intro'
    set({
      activeScenarioId: null,
      scenarioChoiceId: null,
      scenarioWhyOverride: null,
      engagedScenarioIds: engagedScenarioIds.includes(activeScenarioId)
        ? engagedScenarioIds
        : [...engagedScenarioIds, activeScenarioId],
      investingIntroSeen: openInvest ? true : investingIntroSeen,
      investingPanelOpen: openInvest ? true : get().investingPanelOpen,
    })
  },
  dismissBillNotice: () => set({ lastBillNotice: null }),
  dismissMarketNotice: () => set({ lastMarketNotice: null }),

  openPhone: () =>
    set({ phoneOpen: true, dialogue: null, prompt: null, investingPanelOpen: false }),
  closePhone: () => set({ phoneOpen: false }),

  openInvestingPanel: () => {
    const s = get()
    if (s.activeScenarioId) return
    if (!s.hasCheckingAccount) {
      s.openDialogue({
        name: 'Invest desk',
        text: 'Open a checking account with the teller before you can invest.',
        options: [{ label: 'OK', close: true }],
      })
      return
    }
    if (s.savings < INVEST_SAVINGS_MIN) {
      s.openDialogue({
        name: 'Invest desk',
        text: `Build a safety net first — you need about $${INVEST_SAVINGS_MIN} in savings before investing.`,
        options: [{ label: 'Got it', close: true }],
      })
      return
    }
    if (!s.investingIntroSeen) {
      s.openScenario('investing-intro')
      return
    }
    set({ investingPanelOpen: true, dialogue: null, prompt: null, phoneOpen: false })
  },
  closeInvestingPanel: () => set({ investingPanelOpen: false }),
  buyAsset: (id, shares = 1) => {
    const s = get()
    if (!s.hasCheckingAccount) return 'Open checking first.'
    if (s.savings < INVEST_SAVINGS_MIN) return `Need $${INVEST_SAVINGS_MIN}+ in savings to invest.`
    const cost = s.assetPrices[id] * shares
    if (s.bank < cost) return 'Not enough checking balance.'
    set({ bank: s.bank - cost, holdings: { ...s.holdings, [id]: s.holdings[id] + shares } })
    return null
  },
  sellAsset: (id, shares = 1) => {
    const s = get()
    if (s.holdings[id] < shares) return 'You do not own that many shares.'
    const proceeds = s.assetPrices[id] * shares
    set({ bank: s.bank + proceeds, holdings: { ...s.holdings, [id]: s.holdings[id] - shares } })
    return null
  },

  openCarDealScenario: () => {
    const s = get()
    if (s.carStatus !== 'none') {
      s.openDialogue({
        name: 'AutoMart kiosk',
        text: `You already ${s.carStatus === 'owned' ? 'own' : 'lease'} a car. Payments run on the calendar.`,
        options: [{ label: 'OK', close: true }],
      })
      return
    }
    if (!s.hasJob) {
      s.openDialogue({
        name: 'AutoMart kiosk',
        text: 'Applications need proof of income. Get a job first, then come back.',
        options: [{ label: 'OK', close: true }],
      })
      return
    }
    if (!s.creditEstablished || s.creditScore < CAR_CREDIT_MIN) {
      s.openDialogue({
        name: 'AutoMart kiosk',
        text: `Credit score too low (need ${CAR_CREDIT_MIN}+). On-time rent and bills raise it.`,
        options: [{ label: 'OK', close: true }],
      })
      return
    }
    s.openScenario('car-buy-vs-lease')
  },
  openHomeDealScenario: () => {
    const s = get()
    if (s.homeStatus === 'owned') {
      s.openDialogue({
        name: 'Housing tablet',
        text: 'You already bought this unit. Mortgage, tax, and upkeep bill on the calendar.',
        options: [{ label: 'OK', close: true }],
      })
      return
    }
    s.openScenario('home-rent-vs-buy')
  },
}))
}

function getOrCreateGameStore(): UseGameStore {
  const g = globalThis as typeof globalThis & { [STORE_GLOBAL]?: UseGameStore }
  const hotStore = import.meta.hot?.data?.useGame as UseGameStore | undefined
  const existing = g[STORE_GLOBAL] ?? hotStore
  const store = existing ?? createGameStore()
  g[STORE_GLOBAL] = store
  if (import.meta.hot) {
    import.meta.hot.data.useGame = store
    import.meta.hot.accept()
  }
  return store
}

export const useGame = getOrCreateGameStore()

export const SCENE_LOCATION: Record<SceneId, string> = {
  city: 'City Streets',
  bank: 'FirstCity Bank',
  grocery: 'FreshMart Grocery',
  college: 'Merridian College',
  office: 'Summit Office',
  home: 'Maple Apartments',
}

export function processDueBillsAsScenarios() {
  const s = useGame.getState()
  if (s.activeScenarioId || s.phoneOpen || s.investingPanelOpen || s.dialogue) return false
  const billId = s.dueBillIds[0]
  if (!billId) return false
  const bill = s.recurringBills.find((b) => b.id === billId)
  if (!bill) {
    useGame.setState({ dueBillIds: s.dueBillIds.filter((id) => id !== billId) })
    return false
  }
  const scenarioId = `bill-due-${bill.id}-${Math.floor(bill.nextDueTotalMinutes)}`
  if (getScenario(scenarioId)) {
    s.openScenario(scenarioId)
    return true
  }
  registerRuntimeScenario({
    id: scenarioId,
    title: `${bill.label} due`,
    badge: bill.category === 'rent' ? 'Rent due' : 'Bill due',
    setup: `${bill.label} of $${bill.amount} is due now. How do you want to pay?`,
    choices: [
      {
        id: 'bank',
        label: `Pay $${bill.amount} from checking`,
        effects: { billPay: { billId: bill.id, from: 'bank' } },
        why: 'Paying on time from checking protects your credit and keeps housing stable.',
      },
      {
        id: 'savings',
        label: `Pay $${bill.amount} from savings`,
        effects: { billPay: { billId: bill.id, from: 'savings' } },
        why: 'Savings can cover a shortfall — but that’s your emergency cushion shrinking.',
      },
      {
        id: 'cash',
        label: `Pay $${bill.amount} in cash`,
        effects: { billPay: { billId: bill.id, from: 'cash' } },
        why: 'Cash works if you have it on hand. Keep a receipt habit.',
      },
      {
        id: 'miss',
        label: 'I can’t pay today',
        effects: { billPay: { billId: bill.id, from: 'miss' } },
        why: 'Missing a payment adds debt and hurts credit. Catch up as soon as you can.',
      },
    ],
  })
  if (import.meta.env.DEV) console.debug('[bills] opening scenario', scenarioId, bill.amount)
  s.openScenario(scenarioId)
  return true
}

export function fireRandomExpenseIfDue() {
  const s = useGame.getState()
  if (s.activeScenarioId || s.phoneOpen || s.investingPanelOpen || s.dialogue) return false
  if (s.dueBillIds.length > 0) return false // bills take priority
  if (s.totalMinutes < s.nextRandomExpenseAt) return false
  const rentAmount = s.recurringBills.find((b) => b.category === 'rent')?.amount ?? RENT_MONTHLY
  const ctx: ExpenseContext = {
    weeklyIncome: Math.round(s.weeklyIncome * s.incomeFactor),
    savings: s.savings,
    bank: s.bank,
    cash: s.cash,
    debt: s.debt,
    hasJob: s.hasJob,
    recentlyMissedBill: s.recentlyMissedBill,
    rentAmount,
  }
  const { scenario } = buildRandomExpenseScenario(s.totalMinutes, ctx)
  registerRuntimeScenario(scenario)
  if (import.meta.env.DEV) {
    console.debug(
      '[expense] fire',
      scenario.id,
      'next in days≈',
      ((rollNextExpenseAt(s.totalMinutes) - s.totalMinutes) / MINUTES_PER_DAY).toFixed(1),
    )
  }
  s.openScenario(scenario.id, `rand-expense-${scenario.id}`)
  const count = s.randomExpenseCount + 1
  useGame.setState({
    nextRandomExpenseAt: rollNextExpenseAt(s.totalMinutes, { first: count === 0 }),
    randomExpenseCount: count,
    recentlyMissedBill: scenario.id.includes('late-fee') ? false : s.recentlyMissedBill,
  })
  return true
}
