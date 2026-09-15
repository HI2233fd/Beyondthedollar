import { create } from 'zustand'
import { CURRICULUM, unlockedAfterCompleting } from './curriculum'
import { MINUTES_PER_DAY, START_TOTAL_MINUTES, stampFromMinutes } from './simulation/time'
import { getScenario, type ScenarioStat } from './simulation/scenarios'
import {
  billInDays,
  removeBillsByCategory,
  upsertBill,
  type RecurringBill,
} from './simulation/bills'
import { buildRandomExpenseScenario, rollNextExpenseAt } from './simulation/randomExpenses'
import {
  INITIAL_ASSETS,
  stepPrices,
  type AssetId,
  type Holdings,
} from './simulation/investing'
import { registerRuntimeScenario } from './simulation/scenarios'

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

export const CAR_BUY_DOWN = 2000
export const CAR_LOAN_MONTHLY = 280
export const CAR_LEASE_MONTHLY = 249
export const CAR_INSURANCE_MONTHLY = 110
export const CAR_MAINTENANCE_MONTHLY = 40

export const RENT_MONTHLY = 900
export const HOME_DOWN_PAYMENT = 15000
export const HOME_CREDIT_MIN = 640
export const MORTGAGE_MONTHLY = 1050
export const PROPERTY_TAX_MONTHLY = 150
export const HOME_MAINTENANCE_MONTHLY = 100

interface GameState {
  cash: number
  bank: number
  savings: number
  weeklyIncome: number
  monthlyExpenses: number
  creditScore: number
  debt: number
  education: string
  career: string
  transportationAvailable: boolean

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

  /** Recurring calendar charges (rent, car, mortgage…). */
  recurringBills: RecurringBill[]
  lastBillNotice: string | null

  /** Random life-expense scheduler. */
  nextRandomExpenseAt: number

  /** Investing (Bank). */
  assetPrices: Record<AssetId, number>
  holdings: Holdings
  lastPriceDayIndex: number
  investingPanelOpen: boolean
  investingIntroSeen: boolean

  carStatus: CarStatus
  homeStatus: HomeStatus

  setPrompt: (p: string | null) => void
  openDialogue: (d: Dialogue) => void
  closeDialogue: () => void
  enterScene: (scene: SceneId, spawn: Spawn) => void
  finishTransition: () => void

  deposit: (amount: number) => void
  withdraw: (amount: number) => void
  openSavings: (amount: number) => void
  transferToSavings: (amount: number) => void
  applyJob: () => void

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

  openInvestingPanel: () => void
  closeInvestingPanel: () => void
  buyAsset: (id: AssetId, shares?: number) => string | null
  sellAsset: (id: AssetId, shares?: number) => string | null

  openCarDealScenario: () => void
  openHomeDealScenario: () => void
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

export const useGame = create<GameState>((set, get) => ({
  cash: 500,
  bank: 1500,
  savings: 1000,
  weeklyIncome: 0,
  monthlyExpenses: RENT_MONTHLY,
  creditScore: 650,
  debt: 0,
  education: 'High School',
  career: 'Student',
  transportationAvailable: true,

  scene: 'city',
  spawn: null,
  transitioning: false,

  prompt: null,
  dialogue: null,

  cart: [],

  lifeEventActive: false,
  lifeEventShown: true, // legacy popup disabled; random scenarios replace it
  lifeEventOutcome: null,

  hasJob: false,

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
    billInDays('rent-maple', 'Maple Apartments rent', RENT_MONTHLY, 30, START_TOTAL_MINUTES, 'rent', 7),
  ],
  lastBillNotice: null,

  nextRandomExpenseAt: rollNextExpenseAt(START_TOTAL_MINUTES),

  assetPrices: { stock: INITIAL_ASSETS.stock.price, bond: INITIAL_ASSETS.bond.price },
  holdings: { stock: 0, bond: 0 },
  lastPriceDayIndex: stampFromMinutes(START_TOTAL_MINUTES).dayIndex,
  investingPanelOpen: false,
  investingIntroSeen: false,

  carStatus: 'none',
  homeStatus: 'renting',

  setPrompt: (p) => {
    if (get().prompt !== p) set({ prompt: p })
  },
  openDialogue: (d) => set({ dialogue: d, prompt: null }),
  closeDialogue: () => {
    if (get().dialogue) set({ dialogue: null })
  },

  enterScene: (scene, spawn) =>
    set({ transitioning: true, scene, spawn, dialogue: null, prompt: null, investingPanelOpen: false }),
  finishTransition: () => set({ transitioning: false }),

  deposit: (amount) => {
    const { cash, bank } = get()
    const amt = Math.min(amount, cash)
    set({ cash: cash - amt, bank: bank + amt })
  },
  withdraw: (amount) => {
    const { cash, bank } = get()
    const amt = Math.min(amount, bank)
    set({ bank: bank - amt, cash: cash + amt })
  },
  openSavings: (amount) => {
    const { cash, savings } = get()
    const amt = Math.min(amount, cash)
    set({ cash: cash - amt, savings: savings + amt })
  },
  transferToSavings: (amount) => {
    const { bank, savings } = get()
    const amt = Math.min(amount, bank)
    set({ bank: bank - amt, savings: savings + amt })
  },
  applyJob: () => set({ hasJob: true, career: 'Office Assistant', weeklyIncome: 16 * 15 }),

  addToCart: (item) => set({ cart: [...get().cart, item] }),
  clearCart: () => set({ cart: [] }),
  checkout: () => {
    const { cart, cash } = get()
    const total = cart.reduce((s, i) => s + i.price, 0)
    const paid = Math.min(total, cash)
    set({ cash: cash - paid, cart: [] })
    return total
  },

  triggerLifeEvent: () => {
    if (!get().lifeEventShown) set({ lifeEventActive: true, lifeEventShown: true })
  },
  resolveLifeEvent: (choice) => {
    const s = get()
    if (choice === 'savings') {
      set({
        savings: Math.max(0, s.savings - 700),
        lifeEventActive: false,
        lifeEventOutcome: 'You paid $700 from savings. Your car is repaired and back on the road.',
      })
    } else if (choice === 'credit') {
      set({
        creditScore: s.creditScore - 15,
        debt: s.debt + 700,
        lifeEventActive: false,
        lifeEventOutcome:
          'You put the $700 repair on credit. Your car runs again, but your credit score dropped 15 points and you owe $700.',
      })
    } else {
      set({
        transportationAvailable: false,
        lifeEventActive: false,
        lifeEventOutcome:
          'You delayed the repair. Your car sits in the driveway — transportation is unavailable until you fix it.',
      })
    }
  },
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
    }),
  closeLesson: () => set({ activeLessonId: null }),
  startQuiz: (quizId) =>
    set({
      activeQuizId: quizId,
      activeLessonId: null,
      quizAnswers: {},
      quizSubmitted: false,
    }),
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
    if (day > lastPriceDayIndex) {
      for (let d = lastPriceDayIndex; d < day; d++) {
        assetPrices = stepPrices(assetPrices)
      }
      lastPriceDayIndex = day
    }

    let recurringBills = prev.recurringBills.map((b) => ({ ...b }))
    let bank = prev.bank
    let savings = prev.savings
    let cash = prev.cash
    let debt = prev.debt
    let creditScore = prev.creditScore
    let lastBillNotice = prev.lastBillNotice

    for (const bill of recurringBills) {
      let guard = 0
      while (totalMinutes >= bill.nextDueTotalMinutes && guard++ < 6) {
        const paid = takeFromLiquid({ bank, savings, cash }, bill.amount)
        if (paid) {
          bank = paid.bank
          savings = paid.savings
          cash = paid.cash
          lastBillNotice = `Paid $${bill.amount} — ${bill.label}`
        } else {
          debt += bill.amount
          creditScore = Math.max(300, creditScore - 8)
          lastBillNotice = `Missed $${bill.amount} — ${bill.label} (added to debt)`
        }
        bill.nextDueTotalMinutes += bill.everyDays * MINUTES_PER_DAY
      }
    }

    set({
      totalMinutes,
      assetPrices,
      lastPriceDayIndex,
      recurringBills,
      bank,
      savings,
      cash,
      debt,
      creditScore,
      lastBillNotice,
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
        if (state.savings >= pay.amount) patch.savings = state.savings - pay.amount
        else {
          patch.scenarioWhyOverride =
            'Not enough savings — the bill went on credit instead, and your score took a small hit.'
          patch.debt = state.debt + pay.amount
          patch.creditScore = Math.max(300, state.creditScore - 10)
        }
      } else if (pay.from === 'bank') {
        if (state.bank >= pay.amount) patch.bank = state.bank - pay.amount
        else {
          patch.scenarioWhyOverride =
            'Checking couldn’t cover it — the rest went on credit with a score ding.'
          const fromBank = state.bank
          patch.bank = 0
          patch.debt = state.debt + (pay.amount - fromBank)
          patch.creditScore = Math.max(300, state.creditScore - 10)
        }
      } else if (pay.from === 'cash') {
        if (state.cash >= pay.amount) patch.cash = state.cash - pay.amount
        else {
          patch.scenarioWhyOverride = 'You didn’t have enough cash, so credit covered the gap.'
          patch.debt = state.debt + pay.amount
          patch.creditScore = Math.max(300, state.creditScore - 8)
        }
      } else if (pay.from === 'credit') {
        patch.debt = state.debt + pay.amount
        patch.creditScore = Math.max(300, state.creditScore - 12)
      } else if (pay.from === 'delay') {
        patch.transportationAvailable = state.transportationAvailable
        if (activeScenarioId.includes('car-repair')) patch.transportationAvailable = false
        patch.creditScore = Math.max(300, state.creditScore - 3)
      }
    }

    if (choice.effects.carDeal === 'buy') {
      const paid = takeFromLiquid(state, CAR_BUY_DOWN)
      if (!paid) {
        patch.scenarioWhyOverride = 'You need $2,000 liquid for the down payment. Build savings and try again.'
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
        patch.monthlyExpenses =
          (state.homeStatus === 'owned'
            ? MORTGAGE_MONTHLY + PROPERTY_TAX_MONTHLY + HOME_MAINTENANCE_MONTHLY
            : RENT_MONTHLY) +
          CAR_LOAN_MONTHLY +
          CAR_INSURANCE_MONTHLY +
          CAR_MAINTENANCE_MONTHLY
      }
    } else if (choice.effects.carDeal === 'lease') {
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
      patch.monthlyExpenses =
        (state.homeStatus === 'owned'
          ? MORTGAGE_MONTHLY + PROPERTY_TAX_MONTHLY + HOME_MAINTENANCE_MONTHLY
          : RENT_MONTHLY) +
        CAR_LEASE_MONTHLY +
        CAR_INSURANCE_MONTHLY
    } else if (choice.effects.carDeal === 'pass') {
      // no ownership change
    }

    if (choice.effects.homeDeal === 'buy') {
      if (state.creditScore < HOME_CREDIT_MIN) {
        patch.scenarioWhyOverride = `Credit score ${state.creditScore} is below ${HOME_CREDIT_MIN}. Keep paying on time and try again.`
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
          patch.debt = state.debt + 165000
          patch.recurringBills = bills
          const carPart =
            state.carStatus === 'owned'
              ? CAR_LOAN_MONTHLY + CAR_INSURANCE_MONTHLY + CAR_MAINTENANCE_MONTHLY
              : state.carStatus === 'leased'
                ? CAR_LEASE_MONTHLY + CAR_INSURANCE_MONTHLY
                : 0
          patch.monthlyExpenses =
            MORTGAGE_MONTHLY + PROPERTY_TAX_MONTHLY + HOME_MAINTENANCE_MONTHLY + carPart
        }
      }
    } else if (choice.effects.homeDeal === 'keep-rent') {
      let bills = removeBillsByCategory(state.recurringBills, [
        'rent',
        'mortgage',
        'property-tax',
        'home-maintenance',
      ])
      bills = upsertBill(
        bills,
        billInDays('rent-maple', 'Maple Apartments rent', RENT_MONTHLY, 30, state.totalMinutes, 'rent', 30),
      )
      patch.homeStatus = 'renting'
      patch.recurringBills = bills
    }

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

  openInvestingPanel: () => {
    const s = get()
    if (s.activeScenarioId) return
    if (!s.investingIntroSeen) {
      s.openScenario('investing-intro')
      return
    }
    set({ investingPanelOpen: true, dialogue: null, prompt: null })
  },
  closeInvestingPanel: () => set({ investingPanelOpen: false }),
  buyAsset: (id, shares = 1) => {
    const s = get()
    const cost = s.assetPrices[id] * shares
    if (s.bank < cost) return 'Not enough checking balance.'
    set({
      bank: s.bank - cost,
      holdings: { ...s.holdings, [id]: s.holdings[id] + shares },
    })
    return null
  },
  sellAsset: (id, shares = 1) => {
    const s = get()
    if (s.holdings[id] < shares) return 'You do not own that many shares.'
    const proceeds = s.assetPrices[id] * shares
    set({
      bank: s.bank + proceeds,
      holdings: { ...s.holdings, [id]: s.holdings[id] - shares },
    })
    return null
  },

  openCarDealScenario: () => {
    const s = get()
    if (s.carStatus !== 'none') {
      s.openDialogue({
        name: 'AutoMart kiosk',
        text: `You already ${s.carStatus === 'owned' ? 'own' : 'lease'} a car. Ongoing payments run on the calendar.`,
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

export const SCENE_LOCATION: Record<SceneId, string> = {
  city: 'City Streets',
  bank: 'FirstCity Bank',
  grocery: 'FreshMart Grocery',
  college: 'Merridian College',
  office: 'Summit Office',
  home: 'Maple Apartments',
}

/** Called by TimeSystem when the random-expense timer elapses. */
export function fireRandomExpenseIfDue() {
  const s = useGame.getState()
  if (s.activeScenarioId) return false
  if (s.totalMinutes < s.nextRandomExpenseAt) return false
  const { scenario } = buildRandomExpenseScenario(s.totalMinutes)
  registerRuntimeScenario(scenario)
  const triggerId = `rand-expense-${scenario.id}`
  s.openScenario(scenario.id, triggerId)
  useGame.setState({ nextRandomExpenseAt: rollNextExpenseAt(s.totalMinutes) })
  return true
}
