import type { RecurringBill } from '../../simulation/bills'
import { billInDays, removeBillsByCategory, upsertBill } from '../../simulation/bills'
import { MINUTES_PER_DAY } from '../../simulation/time'
import {
  CAR_CREDIT_MIN,
  CREDIT_SCORE_ON_FILE,
} from '../../simulation/progression'
import type { Mission, NpcRelation, Skills } from '../types'
import type { PhoneMessage } from '../characterLook'
import {
  BANK_PLANS,
  CARS,
  EMPLOYERS,
  FINANCE,
  appOf,
  bankPlan,
  clockLabel,
  daysUntil,
  debitChecking,
  defaultLifeFacts,
  financeQuote,
  finishIfReady,
  inInterviewWindow,
  interviewSlot,
  markObjective,
  monthlyPayment,
  objectiveLabel,
  requiredComplete,
  roundMoney,
  scoreInterview,
  setStatus,
  shiftPay,
  upsertMission,
  withApp,
  type BankPlanId,
  type EmployerId,
  type JobApp,
  type LifeFacts,
} from './logic'
import {
  discoveredMissions,
  fixCarMission,
  freshmartMission,
  jobMissionId,
  mayaIntroMission,
  paydayMission,
  recoveryMission,
  repayMission,
  reviewMission,
  shiftMission,
  wheelsMission,
  workplaceMission,
} from './missions'

export type ActivitySession =
  | { kind: 'bank' }
  | { kind: 'posting'; employerId: EmployerId }
  | { kind: 'interview'; employerId: EmployerId }
  | { kind: 'shift'; employerId: EmployerId }
  | { kind: 'maya' }
  | { kind: 'phone' }
  | { kind: 'split' }
  | { kind: 'emergency' }
  | { kind: 'car' }
  | { kind: 'workplace' }
  | { kind: 'practice' }
  | { kind: 'review' }
  | { kind: 'maya-intro' }
  | { kind: 'repair' }

export type PlayAction =
  | { type: 'sync' }
  | { type: 'open'; activity: ActivitySession }
  | { type: 'close' }
  | { type: 'accept'; missionId: string }
  | { type: 'bank'; planId: BankPlanId; deposit: number }
  | { type: 'apply'; employerId: EmployerId }
  | { type: 'interview'; employerId: EmployerId; picks: string[] }
  | { type: 'respond-offer'; employerId: EmployerId; accept: boolean }
  | { type: 'shift'; employerId: EmployerId; accuracy: number }
  | { type: 'maya'; needsHit: number }
  | { type: 'phone-buy' }
  | { type: 'phone-pass' }
  | { type: 'split'; toSavings: number; toCash: number }
  | { type: 'emergency'; choice: EmergencyChoice; repair?: boolean }
  | { type: 'workplace'; choice: 'report' | 'cover' | 'ignore' }
  | { type: 'review' }
  | { type: 'practice' }
  | { type: 'car'; modelId: string; finance: 'short' | 'long' | 'cash' }
  | { type: 'transit' }
  | { type: 'repay-jordan' }
  | { type: 'maya-intro'; yes: boolean }
  | { type: 'reschedule'; employerId: EmployerId }
  | { type: 'wait'; until: number }
  | { type: 'grocery'; spent: number; needs: number; liquidAfter: number }

export type EmergencyChoice = 'cash' | 'bank' | 'savings' | 'credit' | 'jordan' | 'delay'

export interface PlayLedger {
  id: string
  atTotalMinutes: number
  label: string
  amount: number
  kind: 'bill' | 'paycheck' | 'expense' | 'interest' | 'late-fee'
  status: 'paid' | 'missed'
}

export interface PlayStub {
  id: string
  atTotalMinutes: number
  employer: string
  gross: number
  tax: number
  net: number
}

export interface PlaySnapshot {
  cash: number
  bank: number
  savings: number
  debt: number
  creditScore: number
  creditEstablished: boolean
  hasCheckingAccount: boolean
  hasCreditCard: boolean
  hasJob: boolean
  career: string
  weeklyIncome: number
  monthlyExpenses: number
  totalMinutes: number
  skills: Skills
  relationships: Record<string, NpcRelation>
  missions: Mission[]
  lifeFacts: LifeFacts
  paystubs: PlayStub[]
  ledger: PlayLedger[]
  recurringBills: RecurringBill[]
  dueBillIds: string[]
  carStatus: string
  transportationAvailable: boolean
  messages: PhoneMessage[]
  decisions: string[]
  activity: ActivitySession | null
  playerName: string
  leftHome: boolean
  busy: boolean
  scene: string
}

export interface PlayResult {
  patch: Partial<PlaySnapshot>
  education: string[]
  xp: { amount: number; reason: string }[]
  reward: { title: string; lines: string[] } | null
  error: string | null
  notice: string | null
  advanceMinutes: number
}

interface Draft extends PlaySnapshot {
  education: string[]
  xp: { amount: number; reason: string }[]
  reward: { title: string; lines: string[] } | null
  error: string | null
  notice: string | null
  advanceMinutes: number
}

function clone(s: PlaySnapshot): Draft {
  return {
    ...s,
    skills: { ...s.skills },
    relationships: { ...s.relationships },
    missions: s.missions.map((m) => ({ ...m, objectives: m.objectives.map((o) => ({ ...o })), conceptIds: m.conceptIds ? [...m.conceptIds] : undefined })),
    lifeFacts: {
      ...s.lifeFacts,
      apps: { ...s.lifeFacts.apps },
      rewarded: [...s.lifeFacts.rewarded],
    },
    paystubs: [...s.paystubs],
    ledger: [...s.ledger],
    recurringBills: s.recurringBills.map((b) => ({ ...b })),
    dueBillIds: [...s.dueBillIds],
    messages: [...s.messages],
    decisions: [...s.decisions],
    education: [],
    xp: [],
    reward: null,
    error: null,
    notice: null,
    advanceMinutes: 0,
  }
}

function say(d: Draft, from: string, body: string) {
  d.messages = [
    {
      id: `msg-${d.totalMinutes}-${d.messages.length}-${from}`,
      from,
      body,
      atTotalMinutes: d.totalMinutes,
      read: false,
    },
    ...d.messages,
  ].slice(0, 40)
}

function remember(d: Draft, id: string) {
  if (!d.decisions.includes(id)) d.decisions = [...d.decisions, id]
}

function bumpCredit(d: Draft, delta: number) {
  d.creditEstablished = true
  const base = d.creditScore || CREDIT_SCORE_ON_FILE
  d.creditScore = Math.max(300, Math.min(850, base + delta))
}

function grant(d: Draft, mission: Mission) {
  if (d.lifeFacts.rewarded.includes(mission.id)) return
  d.lifeFacts = { ...d.lifeFacts, rewarded: [...d.lifeFacts.rewarded, mission.id] }
  const failed = mission.status === 'failed' || mission.status === 'expired'
  if (!failed && mission.rewardXp) d.xp.push({ amount: mission.rewardXp, reason: mission.title })
  if (!failed && mission.rewardCash) d.cash = roundMoney(d.cash + mission.rewardCash)
  const lines = [mission.failReason || mission.title]
  if (!failed && mission.rewardXp) lines.push(`+${mission.rewardXp} XP`)
  d.reward = {
    title: mission.status === 'failed' ? 'That path closed' : mission.status === 'expired' ? 'Opportunity gone' : 'Mission',
    lines,
  }
}

function tryFinish(d: Draft, id: string, status: 'completed' | 'failed' | 'expired' = 'completed', failReason?: string) {
  const before = d.missions.find((m) => m.id === id)
  if (!before || before.completed || before.status === 'completed' || before.status === 'failed' || before.status === 'expired') return
  if (status === 'completed' && !requiredComplete({ ...before, objectives: d.missions.find((m) => m.id === id)?.objectives ?? before.objectives })) {
    d.missions = finishIfReady(d.missions, id, status, failReason)
    const mid = d.missions.find((m) => m.id === id)
    if (!mid || mid.status !== 'completed') return
  } else {
    d.missions = finishIfReady(d.missions, id, status, failReason)
  }
  const after = d.missions.find((m) => m.id === id)
  if (!after) return
  if (after.status === 'completed' || after.status === 'failed' || after.status === 'expired') {
    if (failReason) {
      d.missions = d.missions.map((m) => (m.id === id ? { ...m, failReason } : m))
    }
    grant(d, d.missions.find((m) => m.id === id)!)
  }
}

function ensure(d: Draft, mission: Mission) {
  d.missions = upsertMission(d.missions, mission)
}

function jobProgress(d: Draft, employerId: EmployerId) {
  const id = jobMissionId(employerId)
  if (!d.missions.some((m) => m.id === id)) return
  const app = appOf(d.lifeFacts, employerId)
  if (app.status !== 'none') d.missions = markObjective(d.missions, id, 'apply')
  if (app.status === 'offered' || app.status === 'rejected' || app.status === 'missed' || app.status === 'hired' || app.status === 'declined') {
    d.missions = markObjective(d.missions, id, 'show-up')
  }
  if (app.status === 'rejected' || app.status === 'missed' || app.status === 'hired' || app.status === 'declined') {
    d.missions = markObjective(d.missions, id, 'outcome')
  }
  if (app.status === 'hired' || app.status === 'declined') tryFinish(d, id, 'completed')
  if (app.status === 'rejected') tryFinish(d, id, 'failed', app.feedback)
}

function refreshRent(d: Draft) {
  const rent = d.recurringBills.find((b) => b.category === 'rent')
  if (!d.lifeFacts.rentPaid && d.ledger.some((e) => e.status === 'paid' && e.kind === 'bill' && /rent|maple/i.test(e.label))) {
    d.lifeFacts = { ...d.lifeFacts, rentPaid: true }
  }
  if (!d.missions.some((m) => m.id === 'rent-clock')) return
  if (d.lifeFacts.rentPaid) {
    d.missions = markObjective(d.missions, 'rent-clock', 'pay-rent')
    tryFinish(d, 'rent-clock')
    return
  }
  if (rent) {
    const days = daysUntil(d.totalMinutes, rent.nextDueTotalMinutes)
    d.missions = objectiveLabel(
      d.missions,
      'rent-clock',
      'pay-rent',
      `Pay $${rent.amount} rent · ${days === 0 ? 'due now' : `${days} day${days === 1 ? '' : 's'}`}`,
    )
  }
}

function chargeFees(d: Draft) {
  const facts = d.lifeFacts
  const plan = bankPlan(facts.bankPlanId)
  if (!plan || facts.legacyBank || !facts.bankOpenedAt) return
  let last = facts.lastFeeAt || facts.bankOpenedAt
  let guard = 0
  let overdrafts = facts.overdrafts
  while (d.totalMinutes >= last + 30 * MINUTES_PER_DAY && guard++ < 6) {
    last += 30 * MINUTES_PER_DAY
    if (plan.apy > 0 && d.bank > 0) {
      const interest = roundMoney(d.bank * (plan.apy / 12))
      if (interest > 0) {
        d.bank = roundMoney(d.bank + interest)
        const interestEntry: PlayLedger = {
          id: `led-apy-${last}`,
          atTotalMinutes: last,
          label: `${plan.label} interest`,
          amount: interest,
          kind: 'interest',
          status: 'paid',
        }
        d.ledger = [interestEntry, ...d.ledger].slice(0, 40)
        d.notice = `${plan.label} paid $${interest.toFixed(2)} interest`
      }
    }
    if (plan.monthlyFee > 0) {
      const debit = debitChecking(d.bank, plan.monthlyFee, { ...facts, overdrafts })
      d.bank = debit.bank
      if (debit.fee) overdrafts += 1
      const feeEntry: PlayLedger = {
        id: `led-fee-${last}`,
        atTotalMinutes: last,
        label: `${plan.label} monthly fee`,
        amount: plan.monthlyFee,
        kind: 'bill',
        status: 'paid',
      }
      d.ledger = [feeEntry, ...d.ledger].slice(0, 40)
      d.notice = debit.note || `$${plan.monthlyFee} ${plan.label} fee posted`
    }
    if (plan.belowMinFee > 0 && d.bank < plan.minBalance) {
      const debit = debitChecking(d.bank, plan.belowMinFee, { ...facts, overdrafts })
      d.bank = debit.ok ? debit.bank : roundMoney(d.bank - plan.belowMinFee)
      const minEntry: PlayLedger = {
        id: `led-min-${last}`,
        atTotalMinutes: last,
        label: 'Below-minimum balance fee',
        amount: plan.belowMinFee,
        kind: 'late-fee',
        status: 'paid',
      }
      d.ledger = [minEntry, ...d.ledger].slice(0, 40)
      d.notice = `Balance under $${plan.minBalance}. Below-minimum fee $${plan.belowMinFee}.`
    }
  }
  if (last !== facts.lastFeeAt) d.lifeFacts = { ...d.lifeFacts, lastFeeAt: last, overdrafts }
}

function sync(d: Draft) {
  if (d.leftHome && !d.lifeFacts.neighborhoodDiscovered) {
    const expires = d.totalMinutes + 5 * MINUTES_PER_DAY
    d.lifeFacts = {
      ...d.lifeFacts,
      neighborhoodDiscovered: true,
      phoneExpiresAt: expires,
      surpriseAt: d.lifeFacts.surpriseAt || d.totalMinutes + 3 * MINUTES_PER_DAY,
    }
    for (const m of discoveredMissions(expires)) ensure(d, m)
    say(
      d,
      'Phone',
      'A few things are happening around the block. Nothing here is an order — pick what matters.',
    )
  }

  if (d.scene === 'grocery') {
    d.missions = d.missions.map((m) =>
      m.id === 'maya-help' && m.status !== 'completed'
        ? {
            ...m,
            title: 'Help Maya shop',
            description: 'Maya is in FreshMart with $24. She will remember whether the basket actually feeds her.',
            personHint: 'Maya',
          }
        : m,
    )
  }

  refreshRent(d)
  chargeFees(d)

  if (d.lifeFacts.phoneDecision === 'open' && d.lifeFacts.phoneExpiresAt > 0 && d.totalMinutes > d.lifeFacts.phoneExpiresAt) {
    d.lifeFacts = { ...d.lifeFacts, phoneDecision: 'expired' }
    d.missions = markObjective(d.missions, 'phone-deal', 'decide')
    tryFinish(d, 'phone-deal', 'expired', 'The $180 listing expired.')
    say(d, 'Marketplace', 'The used phone sold to someone else.')
  }

  const employers: EmployerId[] = ['bean', 'summit', 'freshmart']
  for (const id of employers) {
    const app = appOf(d.lifeFacts, id)
    if (app.status === 'scheduled' && inInterviewWindow(d.totalMinutes, app.interviewAt) === 'late') {
      const next: JobApp = { ...app, status: 'missed', feedback: 'The interview window closed.' }
      d.lifeFacts = withApp(d.lifeFacts, id, next)
      say(d, EMPLOYERS[id].name, `You missed the ${clockLabel(app.interviewAt)} interview. You can reschedule once.`)
    }
    jobProgress(d, id)
  }

  if (d.lifeFacts.helpedMaya === 'well' && d.lifeFacts.mayaChain === 'none' && d.lifeFacts.mayaAt > 0) {
    const lag = d.lifeFacts.phoneTier === 'upgraded' ? MINUTES_PER_DAY : MINUTES_PER_DAY + 8 * 60
    if (d.totalMinutes >= d.lifeFacts.mayaAt + lag) {
      d.lifeFacts = { ...d.lifeFacts, mayaChain: 'texted' }
      ensure(d, mayaIntroMission())
      say(d, 'Maya', 'Thanks again for the basket. My manager is looking for weekend help. Want me to introduce you?')
    }
  }

  if (d.lifeFacts.employerId && d.hasJob && d.lifeFacts.shiftsTotal === 0) ensure(d, shiftMission(d.lifeFacts.employerId))
  if (d.lifeFacts.shiftsTotal >= 1 && !d.lifeFacts.workplaceDone) ensure(d, workplaceMission())
  if (d.paystubs.length > 0 && !d.missions.some((m) => m.id === 'payday-split')) ensure(d, paydayMission())
  if (d.paystubs.length > 0 && !d.missions.some((m) => m.id === 'wheels')) ensure(d, wheelsMission())
  if (d.lifeFacts.shiftsTotal >= 2 && !d.lifeFacts.reviewDone && d.lifeFacts.employerId) {
    ensure(d, reviewMission(EMPLOYERS[d.lifeFacts.employerId].name))
  }
  if (d.lifeFacts.shiftsTotal >= 1) {
    d.missions = markObjective(d.missions, 'first-shift', 'work')
    tryFinish(d, 'first-shift')
  }
  if (d.hasJob && d.missions.some((m) => m.id === 'job-recovery')) {
    d.missions = markObjective(d.missions, 'job-recovery', 'another-path')
    tryFinish(d, 'job-recovery')
  }

  const rejected = employers.some((id) => appOf(d.lifeFacts, id).status === 'rejected')
  if (rejected && !d.hasJob) {
    ensure(d, recoveryMission())
    if (!d.missions.some((m) => m.id === 'job-freshmart')) ensure(d, freshmartMission())
  }
  if (d.lifeFacts.mayaBonus && !d.missions.some((m) => m.id === 'job-freshmart')) ensure(d, freshmartMission())

  if (!d.lifeFacts.surpriseResolved && d.lifeFacts.surpriseAt > 0 && d.totalMinutes >= d.lifeFacts.surpriseAt) {
    if (!d.lifeFacts.surpriseFired) {
      const car = d.carStatus !== 'none' || !!d.lifeFacts.carModelId
      d.lifeFacts = {
        ...d.lifeFacts,
        surpriseFired: true,
        surpriseKind: car ? 'car' : 'utility',
        surpriseAmount: car ? 380 : 65,
      }
    }
    if (!d.busy && !d.activity) d.activity = { kind: d.lifeFacts.repairDelayed ? 'repair' : 'emergency' }
  }
}

function applyFor(d: Draft, employerId: EmployerId) {
  const job = EMPLOYERS[employerId]
  const app = appOf(d.lifeFacts, employerId)
  if (d.lifeFacts.employerId === employerId && d.hasJob) {
    d.error = `You already work at ${job.name}.`
    return
  }
  if (app.status === 'scheduled') {
    d.error = `Interview already set for ${clockLabel(app.interviewAt)}.`
    return
  }
  if (app.status === 'offered') {
    d.error = 'You already have an offer. Accept or decline it.'
    return
  }
  if (app.status === 'rejected' && !d.lifeFacts.practiceDone && employerId !== 'freshmart') {
    d.error = 'They said not yet. Practice with Jordan, or try a different employer.'
    return
  }
  if (job.needsChecking && !d.hasCheckingAccount) {
    d.error = 'Summit wants direct deposit. Open a checking account, then apply.'
    return
  }
  const interviewAt = interviewSlot(d.totalMinutes)
  d.lifeFacts = withApp(d.lifeFacts, employerId, {
    ...app,
    status: 'scheduled',
    interviewAt,
    feedback: '',
    score: 0,
  })
  d.missions = setStatus(d.missions, jobMissionId(employerId), 'active')
  d.missions = markObjective(d.missions, jobMissionId(employerId), 'apply')
  say(d, job.name, `Interview ${clockLabel(interviewAt)}. The window stays open from about 4:00 to 6:30. You can rest until then.`)
  d.notice = `Interview scheduled · ${clockLabel(interviewAt)}`
  d.activity = null
  remember(d, `applied-${employerId}`)
}

function takeLiquid(d: Draft, amount: number): boolean {
  let left = amount
  const bank = Math.min(d.bank, left)
  d.bank = roundMoney(d.bank - bank)
  left -= bank
  const savings = Math.min(d.savings, left)
  d.savings = roundMoney(d.savings - savings)
  left -= savings
  if (d.cash + 0.001 < left) return false
  d.cash = roundMoney(d.cash - left)
  return true
}

function payEmergency(d: Draft, choice: EmergencyChoice, repair: boolean) {
  const amount = d.lifeFacts.surpriseAmount
  const kind = d.lifeFacts.surpriseKind
  if (!repair && d.lifeFacts.surpriseResolved) {
    d.error = 'You already handled that.'
    return
  }
  if (choice === 'cash') {
    if (d.cash + 0.001 < amount) {
      d.error = `You have $${d.cash.toFixed(2)} cash. That does not cover $${amount}.`
      return
    }
    d.cash = roundMoney(d.cash - amount)
    d.notice = `Paid $${amount} in cash.`
  } else if (choice === 'bank') {
    if (!d.hasCheckingAccount) {
      d.error = 'No checking account.'
      return
    }
    const debit = debitChecking(d.bank, amount, d.lifeFacts)
    if (!debit.ok) {
      d.error = debit.note
      return
    }
    d.bank = debit.bank
    if (debit.fee) d.lifeFacts = { ...d.lifeFacts, overdrafts: d.lifeFacts.overdrafts + 1 }
    d.notice = debit.note || `Paid $${amount} from checking.`
  } else if (choice === 'savings') {
    if (d.savings + 0.001 < amount) {
      d.error = 'Savings do not cover it.'
      return
    }
    d.savings = roundMoney(d.savings - amount)
    d.notice = `Paid $${amount} from savings.`
  } else if (choice === 'credit') {
    const owed = roundMoney(amount * 1.25)
    d.debt = roundMoney(d.debt + owed)
    bumpCredit(d, -15)
    d.notice = `A short-term loan covered $${amount}. You now owe $${owed}.`
  } else if (choice === 'jordan') {
    const met = !!d.relationships['home-jordan']?.met
    if (!met) {
      d.error = 'Jordan does not know you well enough yet.'
      return
    }
    if (d.lifeFacts.jordanLoanTaken) {
      d.error = 'Jordan already lent you money.'
      return
    }
    if (amount > 120) {
      d.error = 'Jordan can help with a small bill, not a $380 repair.'
      return
    }
    d.lifeFacts = { ...d.lifeFacts, jordanLoan: amount, jordanLoanTaken: true }
    ensure(d, repayMission(amount))
    say(d, 'Jordan', `I can cover the $${amount}. Pay me back when you have it — I’m not a bank.`)
    d.notice = `Jordan covered $${amount}. You owe him.`
  } else {
    if (kind === 'car' || repair) {
      d.lifeFacts = { ...d.lifeFacts, repairDelayed: true }
      d.transportationAvailable = false
      ensure(d, fixCarMission(amount))
      d.notice = 'The car stays dead until you pay the shop.'
    } else {
      d.recurringBills = d.recurringBills.map((b) =>
        b.category === 'rent' ? { ...b, amount: b.amount + 15, label: `Maple rent ($${b.amount + 15})` } : b,
      )
      if (d.creditEstablished) bumpCredit(d, -3)
      d.notice = 'You delayed it. The landlord added $15 to rent.'
    }
    remember(d, 'delayed-emergency')
  }
  if (choice !== 'delay') {
    const expense: PlayLedger = {
      id: `led-em-${d.totalMinutes}`,
      atTotalMinutes: d.totalMinutes,
      label: kind === 'car' ? 'Car repair' : 'Utility catch-up',
      amount,
      kind: 'expense',
      status: 'paid',
    }
    d.ledger = [expense, ...d.ledger].slice(0, 40)
    if (kind === 'car' || repair) {
      d.lifeFacts = { ...d.lifeFacts, repairDelayed: false }
      d.transportationAvailable = true
      d.missions = markObjective(d.missions, 'fix-car', 'repair')
      tryFinish(d, 'fix-car')
    }
  }
  d.lifeFacts = { ...d.lifeFacts, surpriseResolved: true, surpriseFired: true }
  d.education.push('surprise-expense')
  d.activity = null
  remember(d, `emergency-${choice}`)
}

export function reducePlay(state: PlaySnapshot, action: PlayAction): PlayResult {
  const d = clone(state)
  if (!d.lifeFacts) d.lifeFacts = defaultLifeFacts(d.totalMinutes)

  if (action.type === 'sync') sync(d)
  else if (action.type === 'open') d.activity = action.activity
  else if (action.type === 'close') d.activity = null
  else if (action.type === 'accept') {
    d.missions = setStatus(d.missions, action.missionId, 'active')
  } else if (action.type === 'bank') {
    const plan = BANK_PLANS.find((p) => p.id === action.planId)
    if (!plan) d.error = 'Unknown account.'
    else if (d.lifeFacts.bankPlanId && !d.lifeFacts.legacyBank) d.error = `You already have ${bankPlan(d.lifeFacts.bankPlanId)?.label}.`
    else if (action.deposit < 0 || action.deposit > d.cash + 0.001) d.error = 'Deposit has to come from the cash you are holding.'
    else {
      const deposit = roundMoney(Math.min(d.cash, Math.max(0, action.deposit)))
      d.cash = roundMoney(d.cash - deposit)
      d.bank = roundMoney(d.bank + deposit)
      d.hasCheckingAccount = true
      if (!d.creditEstablished) {
        d.creditEstablished = true
        d.creditScore = CREDIT_SCORE_ON_FILE
      }
      d.lifeFacts = {
        ...d.lifeFacts,
        bankPlanId: plan.id,
        bankOpenedAt: d.totalMinutes,
        lastFeeAt: d.totalMinutes,
        legacyBank: false,
      }
      d.missions = markObjective(d.missions, 'bank-first', 'choose-account')
      d.missions = setStatus(d.missions, 'bank-first', 'active')
      tryFinish(d, 'bank-first')
      d.education.push('open-checking')
      d.activity = null
      remember(d, `bank-${plan.id}`)
      d.notice = `${plan.label} is open.${deposit ? ` Deposited $${deposit.toFixed(2)}.` : ' You deposited nothing.'}`
      say(d, 'Marcus · FirstCity', d.notice)
    }
  } else if (action.type === 'apply') applyFor(d, action.employerId)
  else if (action.type === 'reschedule') {
    const app = appOf(d.lifeFacts, action.employerId)
    if (app.status !== 'missed' && app.status !== 'rejected') d.error = 'Nothing to reschedule.'
    else if (app.reschedules >= 1) d.error = 'They will not move it again. Try another employer.'
    else if (app.status === 'rejected' && !d.lifeFacts.practiceDone) d.error = 'Practice with Jordan before you ask for another interview.'
    else {
      const interviewAt = interviewSlot(d.totalMinutes)
      d.lifeFacts = withApp(d.lifeFacts, action.employerId, {
        ...app,
        status: 'scheduled',
        interviewAt,
        reschedules: app.reschedules + 1,
        feedback: '',
      })
      const mid = jobMissionId(action.employerId)
      d.missions = d.missions.map((m) =>
        m.id === mid
          ? {
              ...m,
              status: 'active',
              completed: false,
              failReason: undefined,
              objectives: m.objectives.map((o) => (o.id === 'show-up' || o.id === 'outcome' ? { ...o, done: false } : o)),
            }
          : m,
      )
      say(d, EMPLOYERS[action.employerId].name, `New interview ${clockLabel(interviewAt)}.`)
      d.activity = null
    }
  } else if (action.type === 'interview') {
    const job = EMPLOYERS[action.employerId]
    const app = appOf(d.lifeFacts, action.employerId)
    const window = inInterviewWindow(d.totalMinutes, app.interviewAt)
    const where = action.employerId === 'summit' ? 'office' : action.employerId === 'freshmart' ? 'grocery' : 'city'
    if (app.status !== 'scheduled') d.error = 'No interview is scheduled.'
    else if (d.scene !== where) d.error = `Show up at ${job.where} for the interview.`
    else if (window === 'early') d.error = `Too early. They expect you ${clockLabel(app.interviewAt)}.`
    else if (window === 'late') d.error = 'That window already closed.'
    else {
      const scored = scoreInterview(action.employerId, action.picks, d.skills.communication, d.lifeFacts.mayaBonus)
      d.lifeFacts = withApp(d.lifeFacts, action.employerId, {
        ...app,
        status: scored.hired ? 'offered' : 'rejected',
        score: scored.score,
        feedback: scored.feedback,
      })
      d.skills = { ...d.skills, communication: Math.min(5, Math.round((d.skills.communication + 0.15) * 100) / 100) }
      d.education.push('interview')
      d.activity = null
      if (scored.hired) {
        d.notice = `${job.name} offers you ${job.role} at $${job.hourly.toFixed(2)}/hr. You can still say no.`
        say(d, job.name, d.notice)
      } else {
        d.notice = `Not hired. ${scored.feedback}`
        say(d, job.name, `${d.notice} FreshMart is hiring, and Jordan will practice with you.`)
        ensure(d, recoveryMission())
        ensure(d, freshmartMission())
      }
      jobProgress(d, action.employerId)
    }
  } else if (action.type === 'respond-offer') {
    const job = EMPLOYERS[action.employerId]
    const app = appOf(d.lifeFacts, action.employerId)
    if (app.status !== 'offered') d.error = 'There is no open offer.'
    else if (!action.accept) {
      d.lifeFacts = withApp(d.lifeFacts, action.employerId, { ...app, status: 'declined' })
      d.notice = `You turned down ${job.name}.`
      say(d, job.name, 'Offer declined. The door stays closed unless you apply again later.')
      d.activity = null
      jobProgress(d, action.employerId)
      remember(d, `declined-${action.employerId}`)
    } else {
      d.hasJob = true
      d.career = job.role
      d.weeklyIncome = roundMoney(job.hourly * job.hoursPerWeek)
      d.lifeFacts = withApp(
        {
          ...d.lifeFacts,
          employerId: action.employerId,
          hourly: job.hourly,
          hoursPerWeek: job.hoursPerWeek,
          usesShiftPay: true,
        },
        action.employerId,
        { ...app, status: 'hired' },
      )
      d.education.push('get-hired')
      d.skills = {
        ...d.skills,
        communication: Math.min(5, Math.round((d.skills.communication + 0.2) * 100) / 100),
      }
      ensure(d, shiftMission(action.employerId))
      d.notice = `You’re hired at ${job.name}. Clock in when you want the first shift. Pay comes from the work, not from skipping the clock.`
      say(d, job.name, d.notice)
      d.activity = null
      remember(d, `hired-${action.employerId}`)
      jobProgress(d, action.employerId)
    }
  } else if (action.type === 'shift') {
    const job = EMPLOYERS[action.employerId]
    const where = action.employerId === 'summit' ? 'office' : action.employerId === 'freshmart' ? 'grocery' : 'city'
    if (d.lifeFacts.employerId !== action.employerId || !d.hasJob) d.error = 'You are not on this schedule.'
    else if (d.scene !== where) d.error = `Clock in at ${job.where}.`
    else if (d.totalMinutes < d.lifeFacts.lastShiftAt + 6 * 60) d.error = 'You already worked a shift. Rest at least a few hours.'
    else {
      const accuracy = Math.max(0, Math.min(1, action.accuracy))
      const pay = shiftPay(d.lifeFacts.hourly || job.hourly, accuracy, d.lifeFacts.payPenalty || 1)
      const stub: PlayStub = {
        id: `pay-${d.totalMinutes}`,
        atTotalMinutes: d.totalMinutes,
        employer: job.name,
        gross: pay.gross,
        tax: pay.tax,
        net: pay.net,
      }
      if (d.hasCheckingAccount) d.bank = roundMoney(d.bank + pay.net)
      else d.cash = roundMoney(d.cash + pay.net)
      d.paystubs = [stub, ...d.paystubs].slice(0, 20)
      const payEntry: PlayLedger = {
        id: `led-pay-${d.totalMinutes}`,
        atTotalMinutes: d.totalMinutes,
        label: `${job.name} shift`,
        amount: pay.net,
        kind: 'paycheck',
        status: 'paid',
      }
      d.ledger = [payEntry, ...d.ledger].slice(0, 40)
      const shifts = d.lifeFacts.shiftsTotal + 1
      const performance =
        d.lifeFacts.shiftsTotal === 0 ? pay.performance : Math.round((d.lifeFacts.performance * d.lifeFacts.shiftsTotal + pay.performance) / shifts)
      d.lifeFacts = {
        ...d.lifeFacts,
        shiftsTotal: shifts,
        lastShiftAt: d.totalMinutes,
        performance,
        payPenalty: 1,
      }
      d.education.push('payday')
      d.activity = null
      d.notice = `Shift pay $${pay.net.toFixed(2)} after $${pay.tax.toFixed(2)} tax. Accuracy ${pay.performance}%. ${d.hasCheckingAccount ? 'Direct deposit.' : 'Cash, because you have no checking account.'}`
      say(d, job.name, d.notice)
      d.missions = markObjective(d.missions, 'first-shift', 'work')
      tryFinish(d, 'first-shift')
      if (shifts === 1) ensure(d, workplaceMission())
      if (!d.missions.some((m) => m.id === 'payday-split')) ensure(d, paydayMission())
    }
  } else if (action.type === 'maya') {
    const well = action.needsHit >= 3
    d.lifeFacts = { ...d.lifeFacts, helpedMaya: well ? 'well' : 'poorly', mayaAt: d.totalMinutes }
    const prev = d.relationships['grocery-maya']
    d.relationships = {
      ...d.relationships,
      'grocery-maya': {
        affinity: Math.min(100, (prev?.affinity ?? 0) + (well ? 18 : 6)),
        met: true,
        talks: (prev?.talks ?? 0) + 1,
        tier: (prev?.affinity ?? 0) + (well ? 18 : 6) >= 30 ? 'friend' : 'acquaintance',
        professional: 'contact',
        memories: [...(prev?.memories ?? []), well ? 'You covered her grocery needs' : 'Her basket missed something she needed'].slice(-8),
        lastTalkAt: d.totalMinutes,
      },
    }
    d.missions = markObjective(d.missions, 'maya-help', 'help')
    d.missions = setStatus(d.missions, 'maya-help', 'active')
    tryFinish(d, 'maya-help')
    d.activity = null
    d.notice = well
      ? 'Maya can cook this week. She will remember that.'
      : 'Maya thanks you, but she is short a staple and will have to come back.'
    remember(d, well ? 'maya-well' : 'maya-poor')
  } else if (action.type === 'phone-buy') {
    if (d.lifeFacts.phoneDecision !== 'open') d.error = 'That listing is gone.'
    else if (d.cash + 0.001 < 180 && d.bank + 0.001 < 180) d.error = 'Neither cash nor checking has $180.'
    else {
      if (d.cash + 0.001 >= 180) d.cash = roundMoney(d.cash - 180)
      else {
        const debit = debitChecking(d.bank, 180, d.lifeFacts)
        if (!debit.ok) {
          d.error = debit.note
        } else {
          d.bank = debit.bank
          if (debit.fee) d.lifeFacts = { ...d.lifeFacts, overdrafts: d.lifeFacts.overdrafts + 1 }
        }
      }
      if (!d.error) {
        d.lifeFacts = { ...d.lifeFacts, phoneTier: 'upgraded', phoneDecision: 'bought' }
        d.missions = markObjective(d.missions, 'phone-deal', 'decide')
        tryFinish(d, 'phone-deal')
        d.activity = null
        d.notice = 'You bought the phone. Messages arrive on time. You also have $180 less.'
        remember(d, 'bought-phone')
      }
    }
  } else if (action.type === 'phone-pass') {
    if (d.lifeFacts.phoneDecision !== 'open') d.error = 'Already decided.'
    else {
      d.lifeFacts = { ...d.lifeFacts, phoneDecision: 'passed' }
      d.missions = markObjective(d.missions, 'phone-deal', 'decide')
      tryFinish(d, 'phone-deal')
      d.activity = null
      d.notice = 'You kept the cash. The starter phone still delays some texts until morning.'
      remember(d, 'passed-phone')
    }
  } else if (action.type === 'split') {
    const last = d.paystubs[0]
    const moving = roundMoney(action.toSavings + action.toCash)
    const paidCash = !d.hasCheckingAccount || d.bank + 0.001 < moving
    if (!last) d.error = 'No paycheck to split yet.'
    else if (action.toSavings < 0 || action.toCash < 0) d.error = 'Amounts cannot be negative.'
    else if (!paidCash && moving > d.bank + 0.001) d.error = 'Checking does not hold that much.'
    else if (paidCash && action.toCash > 0.001) d.error = 'That pay is already cash. Move some into savings, or leave it.'
    else if (paidCash && action.toSavings > d.cash + 0.001) d.error = 'You do not have that much cash to move into savings.'
    else {
      if (paidCash) {
        d.cash = roundMoney(d.cash - action.toSavings)
        d.savings = roundMoney(d.savings + action.toSavings)
      } else {
        d.bank = roundMoney(d.bank - moving)
        d.savings = roundMoney(d.savings + action.toSavings)
        d.cash = roundMoney(d.cash + action.toCash)
      }
      const slice = action.toSavings + 0.001 >= last.net * 0.1
      d.lifeFacts = { ...d.lifeFacts, paycheckSplit: true, savedSlice: slice || d.lifeFacts.savedSlice }
      d.missions = markObjective(d.missions, 'payday-split', 'allocate')
      if (slice) d.missions = markObjective(d.missions, 'payday-split', 'save-slice')
      tryFinish(d, 'payday-split')
      if (action.toSavings > 0) d.education.push('transfer-savings')
      d.activity = null
      d.notice =
        action.toSavings === 0 && action.toCash === 0
          ? paidCash
            ? 'You left the cash where it is.'
            : 'You left the paycheck in checking.'
          : paidCash
            ? `Moved $${action.toSavings.toFixed(2)} from cash into savings.`
            : `Moved $${action.toSavings.toFixed(2)} to savings and $${action.toCash.toFixed(2)} to cash.`
      remember(d, `split-${Math.round(action.toSavings)}-${Math.round(action.toCash)}`)
    }
  } else if (action.type === 'emergency') payEmergency(d, action.choice, !!action.repair)
  else if (action.type === 'workplace') {
    if (d.lifeFacts.workplaceDone) d.error = 'Already handled.'
    else if (action.choice === 'cover') {
      if (d.cash + 0.001 >= 12) {
        d.cash = roundMoney(d.cash - 12)
      } else if (d.hasCheckingAccount) {
        const debit = debitChecking(d.bank, 12, d.lifeFacts)
        if (!debit.ok) {
          d.error = debit.note || 'Checking will not cover the $12 shortage.'
          return resultOf(d)
        }
        d.bank = debit.bank
        if (debit.fee) d.lifeFacts = { ...d.lifeFacts, overdrafts: d.lifeFacts.overdrafts + 1 }
      } else {
        d.error = 'Covering the $12 shortage needs cash or checking.'
        return resultOf(d)
      }
      d.lifeFacts = { ...d.lifeFacts, workplaceDone: true, performance: Math.min(100, d.lifeFacts.performance + 2) }
      d.notice = 'You covered $12. The drawer balances. Your manager never hears why.'
    } else if (action.choice === 'report') {
      d.lifeFacts = { ...d.lifeFacts, workplaceDone: true, performance: Math.min(100, d.lifeFacts.performance + 8) }
      d.notice = 'You wrote it up. Management trusts the count. No money moved.'
    } else {
      d.lifeFacts = { ...d.lifeFacts, workplaceDone: true, performance: Math.max(0, d.lifeFacts.performance - 12), payPenalty: 0.85 }
      d.notice = 'You left it. The next shift pays less while they sort the drawer.'
    }
    d.missions = markObjective(d.missions, 'workplace-snag', 'handle')
    tryFinish(d, 'workplace-snag')
    d.activity = null
    remember(d, `workplace-${action.choice}`)
  } else if (action.type === 'review') {
    if (d.lifeFacts.reviewDone) d.error = 'Review already happened.'
    else if (d.lifeFacts.shiftsTotal < 2) d.error = 'They want at least two shifts on record.'
    else if (d.lifeFacts.performance >= 70) {
      const hourly = roundMoney((d.lifeFacts.hourly || 0) + 0.75)
      d.lifeFacts = { ...d.lifeFacts, reviewDone: true, hourly }
      d.weeklyIncome = roundMoney(hourly * (d.lifeFacts.hoursPerWeek || 16))
      d.notice = `Raise. You now make $${hourly.toFixed(2)}/hr because the shifts were accurate.`
    } else {
      d.lifeFacts = { ...d.lifeFacts, reviewDone: true }
      d.notice = `No raise. Performance is ${d.lifeFacts.performance}%. They kept your hours and told you to slow down on the tickets.`
    }
    d.missions = markObjective(d.missions, 'performance-review', 'review')
    tryFinish(d, 'performance-review')
    d.activity = null
    say(d, d.lifeFacts.employerId ? EMPLOYERS[d.lifeFacts.employerId].name : 'Work', d.notice || 'Review done.')
  } else if (action.type === 'practice') {
    d.lifeFacts = { ...d.lifeFacts, practiceDone: true }
    d.skills = {
      ...d.skills,
      communication: Math.min(5, Math.round((d.skills.communication + 0.35) * 100) / 100),
    }
    d.activity = null
    d.notice = 'Jordan walked a shift with you. Communication is sharper. You can reapply.'
    say(d, 'Jordan', 'That was better. Go back if you want another shot, or take the FreshMart hours.')
  } else if (action.type === 'maya-intro') {
    ensure(d, mayaIntroMission())
    d.lifeFacts = {
      ...d.lifeFacts,
      mayaChain: 'intro',
      mayaBonus: d.lifeFacts.mayaBonus || (action.yes && d.lifeFacts.helpedMaya === 'well'),
    }
    if (action.yes) {
      ensure(d, freshmartMission())
      say(d, 'Maya', 'I told Andre you are careful with a list. Mention my name.')
      d.notice = 'Maya’s introduction is in. It helps at Bean Street if you interview there, and FreshMart knows your name.'
    } else {
      d.notice = 'You told Maya not to introduce you. She leaves it alone.'
    }
    d.missions = markObjective(d.missions, 'maya-intro', 'intro')
    tryFinish(d, 'maya-intro')
    d.activity = null
    remember(d, action.yes ? 'maya-intro-yes' : 'maya-intro-no')
  } else if (action.type === 'car') {
    const model = CARS.find((c) => c.id === action.modelId)
    if (!model) d.error = 'That car is gone.'
    else if (action.finance === 'cash') {
      if (d.bank + d.savings + d.cash + 0.001 < model.price) d.error = `You need $${model.price.toLocaleString()} liquid to pay cash.`
      else if (!takeLiquid(d, model.price)) d.error = 'The cash, checking, and savings together do not cover it.'
      else buyCar(d, model, 0, 0, 0)
    } else {
      const offer = FINANCE.find((f) => f.id === action.finance)!
      if (!d.hasJob) d.error = 'The lender wants a job on file.'
      else if (!d.creditEstablished || d.creditScore < CAR_CREDIT_MIN) d.error = `Credit needs to be at least ${CAR_CREDIT_MIN} for this loan.`
      else if (d.bank + d.savings + d.cash + 0.001 < offer.down) d.error = `Down payment is $${offer.down.toLocaleString()}.`
      else if (!takeLiquid(d, offer.down)) d.error = 'Not enough liquid for the down payment.'
      else {
        const quote = financeQuote(model.price, offer)
        buyCar(d, model, quote.principal, quote.monthly, offer.months)
      }
    }
  } else if (action.type === 'transit') {
    d.lifeFacts = { ...d.lifeFacts, transit: true }
    d.transportationAvailable = true
    d.recurringBills = upsertBill(
      d.recurringBills.filter((b) => b.id !== 'transit-pass'),
      billInDays('transit-pass', 'Transit pass', 45, 30, d.totalMinutes, 'other', 30),
    )
    d.monthlyExpenses = roundMoney(d.monthlyExpenses + 45)
    d.missions = markObjective(d.missions, 'wheels', 'choose')
    tryFinish(d, 'wheels')
    d.activity = null
    d.notice = 'Transit pass is $45 a month. No car payment, no insurance.'
    d.education.push('car-deal')
    remember(d, 'chose-transit')
  } else if (action.type === 'repay-jordan') {
    const owed = d.lifeFacts.jordanLoan
    if (owed <= 0) d.error = 'You do not owe Jordan.'
    else if (d.cash + 0.001 < owed) d.error = `You need $${owed.toFixed(2)} cash. Withdraw it if it is in checking.`
    else {
      d.cash = roundMoney(d.cash - owed)
      d.lifeFacts = { ...d.lifeFacts, jordanLoan: 0 }
      d.missions = markObjective(d.missions, 'repay-jordan', 'repay')
      tryFinish(d, 'repay-jordan')
      d.activity = null
      say(d, 'Jordan', 'We’re square. I appreciate it.')
      d.notice = `Repaid Jordan $${owed.toFixed(2)}.`
    }
  } else if (action.type === 'grocery') {
    const under = action.spent <= 55
    const reserve = action.liquidAfter + 0.001 >= 20
    d.lifeFacts = {
      ...d.lifeFacts,
      grocerySpent: action.spent,
      groceryNeeds: action.needs,
      groceryAt: d.totalMinutes,
      groceryUnderBudget: under,
      groceryKeptReserve: reserve,
      surpriseAt:
        d.lifeFacts.surpriseFired || d.lifeFacts.surpriseResolved
          ? d.lifeFacts.surpriseAt
          : Math.min(d.lifeFacts.surpriseAt || d.totalMinutes + 2 * MINUTES_PER_DAY, d.totalMinutes + 2 * MINUTES_PER_DAY),
    }
    if (action.needs >= 4) d.missions = markObjective(d.missions, 'week-groceries', 'food')
    if (under) d.missions = markObjective(d.missions, 'week-groceries', 'budget')
    if (reserve) d.missions = markObjective(d.missions, 'week-groceries', 'reserve')
    d.missions = setStatus(d.missions, 'week-groceries', 'active')
    if (action.needs >= 4) tryFinish(d, 'week-groceries')
    remember(d, `grocery-${Math.round(action.spent)}`)
  } else if (action.type === 'wait') {
    const until = Math.min(action.until, d.totalMinutes + 14 * MINUTES_PER_DAY)
    const delta = until - d.totalMinutes
    if (delta <= 1) d.error = 'That time has already passed.'
    else {
      d.advanceMinutes = delta
      d.notice = `Rested until ${clockLabel(until)}.`
    }
  }

  return resultOf(d)
}

function buyCar(
  d: Draft,
  model: (typeof CARS)[number],
  principal: number,
  monthly: number,
  months: number,
) {
  let bills = removeBillsByCategory(d.recurringBills, ['car-loan', 'car-lease', 'car-insurance', 'car-maintenance'])
  bills = bills.filter((b) => b.id !== 'transit-pass')
  if (principal > 0 && monthly > 0) {
    bills = upsertBill(bills, billInDays('car-loan', `${model.name} loan`, monthly, 30, d.totalMinutes, 'car-loan', 30))
    d.debt = roundMoney(d.debt + principal)
  }
  bills = upsertBill(
    bills,
    billInDays('car-insurance', `${model.name} insurance`, model.insurance, 30, d.totalMinutes, 'car-insurance', 30),
  )
  bills = upsertBill(
    bills,
    billInDays('car-maint', `${model.name} upkeep`, model.upkeep, 30, d.totalMinutes, 'car-maintenance', 30),
  )
  d.recurringBills = bills
  d.carStatus = 'owned'
  d.transportationAvailable = true
  d.lifeFacts = { ...d.lifeFacts, carModelId: model.id, repairDelayed: false, transit: false }
  d.missions = markObjective(d.missions, 'wheels', 'choose')
  tryFinish(d, 'wheels')
  d.education.push('car-deal')
  d.activity = null
  const quote = principal > 0 ? `$${monthly}/mo for ${months} months. You owe $${principal.toLocaleString()}.` : 'Paid in cash. No loan.'
  d.notice = `${model.name} is yours. Insurance $${model.insurance}/mo, upkeep $${model.upkeep}/mo. ${quote}`
  say(d, 'AutoMart', d.notice)
  remember(d, `car-${model.id}-${principal > 0 ? monthly : 'cash'}`)
}

function resultOf(d: Draft): PlayResult {
  return {
    patch: {
      cash: d.cash,
      bank: d.bank,
      savings: d.savings,
      debt: d.debt,
      creditScore: d.creditScore,
      creditEstablished: d.creditEstablished,
      hasCheckingAccount: d.hasCheckingAccount,
      hasCreditCard: d.hasCreditCard,
      hasJob: d.hasJob,
      career: d.career,
      weeklyIncome: d.weeklyIncome,
      monthlyExpenses: d.monthlyExpenses,
      skills: d.skills,
      relationships: d.relationships,
      missions: d.missions,
      lifeFacts: d.lifeFacts,
      paystubs: d.paystubs,
      ledger: d.ledger,
      recurringBills: d.recurringBills,
      dueBillIds: d.dueBillIds,
      carStatus: d.carStatus as PlaySnapshot['carStatus'],
      transportationAvailable: d.transportationAvailable,
      messages: d.messages,
      decisions: d.decisions,
      activity: d.activity,
    },
    education: d.education,
    xp: d.xp,
    reward: d.reward,
    error: d.error,
    notice: d.notice,
    advanceMinutes: d.advanceMinutes,
  }
}

export function quoteLine(price: number, offerId: 'short' | 'long') {
  const offer = FINANCE.find((f) => f.id === offerId)!
  const q = financeQuote(price, offer)
  return { ...q, ...offer, payment: monthlyPayment(q.principal, offer.apr, offer.months) }
}
