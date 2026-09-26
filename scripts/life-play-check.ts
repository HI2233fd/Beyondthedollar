import { reducePlay, type PlaySnapshot } from '../src/life/play/reduce'
import { defaultLifeFacts } from '../src/life/play/logic'
import { rentMission, settleInMission } from '../src/life/play/missions'
import { START_TOTAL_MINUTES, MINUTES_PER_DAY } from '../src/simulation/time'
import { billInDays } from '../src/simulation/bills'

const RENT_MONTHLY = 900
import { DEFAULT_SKILLS } from '../src/life/types'

function snap(over: Partial<PlaySnapshot> = {}): PlaySnapshot {
  const now = START_TOTAL_MINUTES
  return {
    cash: 420,
    bank: 0,
    savings: 0,
    debt: 0,
    creditScore: 0,
    creditEstablished: false,
    hasCheckingAccount: false,
    hasCreditCard: false,
    hasJob: false,
    career: 'Unemployed',
    weeklyIncome: 0,
    monthlyExpenses: RENT_MONTHLY,
    totalMinutes: now,
    skills: { ...DEFAULT_SKILLS },
    relationships: {},
    missions: [settleInMission(), rentMission(now + 12 * MINUTES_PER_DAY)],
    lifeFacts: defaultLifeFacts(now),
    paystubs: [],
    ledger: [],
    recurringBills: [billInDays('rent-maple', 'Maple Apartments rent', RENT_MONTHLY, 30, now, 'rent', 12)],
    dueBillIds: [],
    carStatus: 'none',
    transportationAvailable: true,
    messages: [],
    decisions: [],
    activity: null,
    playerName: 'Avery',
    leftHome: false,
    busy: false,
    scene: 'home',
    ...over,
  }
}

function apply(state: PlaySnapshot, action: Parameters<typeof reducePlay>[1]) {
  const result = reducePlay(state, action)
  if (result.error) throw new Error(`${action.type}: ${result.error}`)
  return { ...state, ...result.patch, totalMinutes: state.totalMinutes + result.advanceMinutes } as PlaySnapshot
}

const asserts: string[] = []
function check(name: string, ok: boolean, detail = '') {
  if (!ok) asserts.push(`${name} ${detail}`)
}

let s = snap()
s = apply(s, { type: 'sync' })
check('no opps before leaving', s.missions.length === 2, String(s.missions.length))

s = { ...s, leftHome: true, scene: 'city' }
s = apply(s, { type: 'sync' })
const ids = s.missions.map((m) => m.id)
for (const id of ['bank-first', 'job-bean', 'job-summit', 'maya-help', 'phone-deal', 'week-groceries', 'rent-clock']) {
  check(`discovered ${id}`, ids.includes(id))
}
check('several open at once', s.missions.filter((m) => m.status === 'discovered' || m.status === 'active').length >= 6)

s = apply(s, { type: 'bank', planId: 'everyday', deposit: 200 })
check('bank plan persisted', s.lifeFacts.bankPlanId === 'everyday')
check('deposit moved cash', s.cash === 220 && s.bank === 200, `${s.cash}/${s.bank}`)
check('bank mission done', !!s.missions.find((m) => m.id === 'bank-first')?.completed)

s = apply(s, { type: 'apply', employerId: 'bean' })
check('interview scheduled', s.lifeFacts.apps.bean?.status === 'scheduled')
const at = s.lifeFacts.apps.bean!.interviewAt
s = { ...apply(s, { type: 'wait', until: at - 10 }), scene: 'city' }
s = apply(s, { type: 'interview', employerId: 'bean', picks: ['text', 'close', 'clear', 'tell'] })
check('offer from strong answers', s.lifeFacts.apps.bean?.status === 'offered', s.lifeFacts.apps.bean?.status)

let rejected = snap({ leftHome: true, scene: 'city', lifeFacts: { ...defaultLifeFacts(START_TOTAL_MINUTES), neighborhoodDiscovered: true } })
rejected = apply(rejected, { type: 'sync' })
rejected = apply(rejected, { type: 'apply', employerId: 'bean' })
const at2 = rejected.lifeFacts.apps.bean!.interviewAt
rejected = { ...apply(rejected, { type: 'wait', until: at2 - 10 }), scene: 'city' }
rejected = apply(rejected, { type: 'interview', employerId: 'bean', picks: ['blame', 'read', 'ignore', 'leave'] })
check('weak answers rejected', rejected.lifeFacts.apps.bean?.status === 'rejected', rejected.lifeFacts.apps.bean?.feedback)
check('recovery exists', rejected.missions.some((m) => m.id === 'job-recovery' || m.id === 'job-freshmart'))

s = apply(s, { type: 'respond-offer', employerId: 'bean', accept: true })
check('hired', s.hasJob && s.lifeFacts.employerId === 'bean')
check('shift mission', s.missions.some((m) => m.id === 'first-shift' && m.status === 'active'))

let shiftError = ''
try {
  apply({ ...s, scene: 'home' }, { type: 'shift', employerId: 'bean', accuracy: 1 })
} catch (err) {
  shiftError = (err as Error).message
}
check('cannot clock in from home', shiftError.includes('Clock in'), shiftError)

s = apply({ ...s, scene: 'city' }, { type: 'shift', employerId: 'bean', accuracy: 1 })
check('paycheck exists', s.paystubs.length === 1 && s.paystubs[0].net > 0, String(s.paystubs[0]?.net))
check('paid into checking', s.bank > 200, String(s.bank))
check('tax withheld', s.paystubs[0].tax > 0 && s.paystubs[0].net < s.paystubs[0].gross)

s = apply(s, { type: 'grocery', spent: 70, needs: 4, liquidAfter: 15 })
const groceries = s.missions.find((m) => m.id === 'week-groceries')
check('grocery required done', !!groceries?.objectives.find((o) => o.id === 'food')?.done)
check('optional budget not auto-passed', !groceries?.objectives.find((o) => o.id === 'budget')?.done)
check('optional reserve failed honestly', !groceries?.objectives.find((o) => o.id === 'reserve')?.done)

const before = s.bank
s = apply(s, { type: 'emergency', choice: 'bank' })
check('emergency took money', Math.abs(s.bank - (before - 65)) < 0.02, `${before} -> ${s.bank}`)

s = apply(s, { type: 'workplace', choice: 'ignore' })
check('ignore hurts next pay', s.lifeFacts.payPenalty < 1 && s.lifeFacts.workplaceDone)

const plus = apply(snap({ cash: 420, leftHome: true, scene: 'bank' }), { type: 'bank', planId: 'plus', deposit: 50 })
check('plus selected', plus.lifeFacts.bankPlanId === 'plus' && plus.bank === 50)
let over = { ...plus, totalMinutes: plus.lifeFacts.bankOpenedAt + 30 * MINUTES_PER_DAY + 1 }
over = apply(over, { type: 'sync' })
check('plus monthly fee posted', over.bank < 50, String(over.bank))

const onlineResult = reducePlay(
  snap({
    cash: 100,
    bank: 10,
    hasCheckingAccount: true,
    lifeFacts: { ...defaultLifeFacts(0), bankPlanId: 'online', bankOpenedAt: 1, legacyBank: false, surpriseAmount: 65 },
  }),
  { type: 'emergency', choice: 'bank' },
)
check('online declines overdraft', !!onlineResult.error && /decline/i.test(onlineResult.error), onlineResult.error ?? '')

const cashJob = apply(snap({ leftHome: true, scene: 'city', cash: 420 }), { type: 'sync' })
let cafe = apply(cashJob, { type: 'apply', employerId: 'bean' })
const cafeAt = cafe.lifeFacts.apps.bean!.interviewAt
cafe = { ...apply(cafe, { type: 'wait', until: cafeAt - 10 }), scene: 'city' }
cafe = apply(cafe, { type: 'interview', employerId: 'bean', picks: ['text', 'close', 'clear', 'tell'] })
cafe = apply(cafe, { type: 'respond-offer', employerId: 'bean', accept: true })
cafe = apply({ ...cafe, scene: 'city' }, { type: 'shift', employerId: 'bean', accuracy: 1 })
const cashBeforeSplit = cafe.cash
cafe = apply(cafe, { type: 'split', toSavings: 10, toCash: 0 })
check('cash paycheck can move to savings', cafe.savings === 10 && cafe.cash === round2(cashBeforeSplit - 10), `${cafe.cash}/${cafe.savings}`)

function round2(n: number) {
  return Math.round(n * 100) / 100
}

let slept = apply(snap({ leftHome: true, scene: 'home' }), { type: 'sync' })
const surpriseAt = slept.lifeFacts.surpriseAt
slept = apply(slept, { type: 'wait', until: surpriseAt + 5 })
slept = apply({ ...slept, busy: false }, { type: 'sync' })
check('sleeping into a surprise opens it', slept.activity?.kind === 'emergency' && slept.lifeFacts.surpriseFired, `${slept.activity?.kind ?? 'none'} at ${slept.totalMinutes} vs ${surpriseAt}`)

if (asserts.length) {
  console.error(asserts.join('\n'))
  process.exit(1)
}
console.log('life-play checks passed')
