import { MINUTES_PER_DAY, stampFromMinutes } from '../../simulation/time'
import { PAYROLL_TAX_RATE } from '../../simulation/progression'
import type { Mission, MissionStatus, Skills } from '../types'

export type BankPlanId = 'everyday' | 'plus' | 'online'
export type EmployerId = 'bean' | 'summit' | 'freshmart'

export interface BankPlan {
  id: BankPlanId
  label: string
  monthlyFee: number
  overdraftFee: number
  /** 0 means the bank refuses the debit instead of lending the difference. */
  allowsOverdraft: boolean
  apy: number
  minBalance: number
  belowMinFee: number
  note: string
}

export const BANK_PLANS: BankPlan[] = [
  {
    id: 'everyday',
    label: 'Everyday Checking',
    monthlyFee: 0,
    overdraftFee: 35,
    allowsOverdraft: true,
    apy: 0,
    minBalance: 0,
    belowMinFee: 0,
    note: 'No monthly fee. If a payment is larger than your balance, it still goes through and a $35 overdraft fee is added.',
  },
  {
    id: 'plus',
    label: 'Plus Checking',
    monthlyFee: 8,
    overdraftFee: 0,
    allowsOverdraft: true,
    apy: 0,
    minBalance: 500,
    belowMinFee: 12,
    note: '$8 every month. Overdrafts are allowed with no fee. If your balance is under $500 on the fee date, a $12 below-minimum fee is added.',
  },
  {
    id: 'online',
    label: 'Online Account',
    monthlyFee: 0,
    overdraftFee: 0,
    allowsOverdraft: false,
    apy: 0.012,
    minBalance: 0,
    belowMinFee: 0,
    note: 'No monthly fee. 1.2% APY, paid monthly on whatever is in checking. Payments that exceed the balance are declined. ATM access is limited — cash withdrawals at the branch still work.',
  },
]

export function bankPlan(id: BankPlanId | null): BankPlan | null {
  return BANK_PLANS.find((p) => p.id === id) ?? null
}

export interface Employer {
  id: EmployerId
  name: string
  role: string
  hourly: number
  hoursPerWeek: number
  needsChecking: boolean
  where: string
  conceptIds: string[]
}

export const EMPLOYERS: Record<EmployerId, Employer> = {
  bean: {
    id: 'bean',
    name: 'Bean Street Café',
    role: 'Barista',
    hourly: 14.5,
    hoursPerWeek: 16,
    needsChecking: false,
    where: 'Help Wanted board, west sidewalk',
    conceptIds: ['get-hired', 'human-capital', 'paycheck-story'],
  },
  summit: {
    id: 'summit',
    name: 'Summit Tower',
    role: 'Office Assistant',
    hourly: 20,
    hoursPerWeek: 18.5,
    needsChecking: true,
    where: 'Diane, Summit Tower',
    conceptIds: ['get-hired', 'paycheck-story', 'pay-forms'],
  },
  freshmart: {
    id: 'freshmart',
    name: 'FreshMart',
    role: 'Stocker',
    hourly: 13,
    hoursPerWeek: 14,
    needsChecking: false,
    where: 'Andre, FreshMart',
    conceptIds: ['get-hired', 'paycheck-story'],
  },
}

export interface JobApp {
  status: 'none' | 'scheduled' | 'missed' | 'rejected' | 'offered' | 'declined' | 'hired'
  interviewAt: number
  score: number
  feedback: string
  reschedules: number
}

export interface LifeFacts {
  bankPlanId: BankPlanId | null
  bankOpenedAt: number
  lastFeeAt: number
  overdrafts: number
  legacyBank: boolean
  neighborhoodDiscovered: boolean
  helpedMaya: 'none' | 'well' | 'poorly'
  mayaAt: number
  mayaChain: 'none' | 'texted' | 'intro'
  mayaBonus: boolean
  phoneTier: 'starter' | 'upgraded'
  phoneExpiresAt: number
  phoneDecision: 'open' | 'bought' | 'passed' | 'expired'
  grocerySpent: number | null
  groceryNeeds: number
  groceryAt: number
  groceryUnderBudget: boolean
  groceryKeptReserve: boolean
  surpriseAt: number
  surpriseFired: boolean
  surpriseResolved: boolean
  surpriseKind: 'utility' | 'car'
  surpriseAmount: number
  jordanLoan: number
  jordanLoanTaken: boolean
  apps: Partial<Record<EmployerId, JobApp>>
  employerId: EmployerId | null
  hourly: number
  hoursPerWeek: number
  usesShiftPay: boolean
  shiftsTotal: number
  lastShiftAt: number
  performance: number
  payPenalty: number
  workplaceDone: boolean
  reviewDone: boolean
  carModelId: string | null
  transit: boolean
  rewarded: string[]
  practiceDone: boolean
  rentPaid: boolean
  paycheckSplit: boolean
  savedSlice: boolean
  repairDelayed: boolean
}

export function defaultLifeFacts(now: number): LifeFacts {
  return {
    bankPlanId: null,
    bankOpenedAt: 0,
    lastFeeAt: 0,
    overdrafts: 0,
    legacyBank: false,
    neighborhoodDiscovered: false,
    helpedMaya: 'none',
    mayaAt: 0,
    mayaChain: 'none',
    mayaBonus: false,
    phoneTier: 'starter',
    phoneExpiresAt: now + 5 * MINUTES_PER_DAY,
    phoneDecision: 'open',
    grocerySpent: null,
    groceryNeeds: 0,
    groceryAt: 0,
    groceryUnderBudget: false,
    groceryKeptReserve: false,
    surpriseAt: 0,
    surpriseFired: false,
    surpriseResolved: false,
    surpriseKind: 'utility',
    surpriseAmount: 65,
    jordanLoan: 0,
    jordanLoanTaken: false,
    apps: {},
    employerId: null,
    hourly: 0,
    hoursPerWeek: 0,
    usesShiftPay: false,
    shiftsTotal: 0,
    lastShiftAt: 0,
    performance: 0,
    payPenalty: 1,
    workplaceDone: false,
    reviewDone: false,
    carModelId: null,
    transit: false,
    rewarded: [],
    practiceDone: false,
    rentPaid: false,
    paycheckSplit: false,
    savedSlice: false,
    repairDelayed: false,
  }
}

export function normalizeLifeFacts(raw: Partial<LifeFacts> | null | undefined, now: number, hasChecking: boolean): LifeFacts {
  const base = defaultLifeFacts(now)
  if (!raw) {
    return { ...base, legacyBank: hasChecking, bankPlanId: hasChecking ? 'everyday' : null }
  }
  return {
    ...base,
    ...raw,
    apps: { ...raw.apps },
    rewarded: raw.rewarded ?? [],
  }
}

export interface InterviewChoice {
  id: string
  label: string
  weight: number
  trait: 'reliability' | 'service' | 'integrity'
}

export interface InterviewQuestion {
  id: string
  prompt: string
  choices: InterviewChoice[]
}

export const INTERVIEWS: Record<EmployerId, InterviewQuestion[]> = {
  bean: [
    {
      id: 'late',
      prompt: 'The bus is running late and you will miss the first 10 minutes of a shift. What do you do?',
      choices: [
        { id: 'text', label: 'Text the manager before you arrive and give a time', weight: 2, trait: 'reliability' },
        { id: 'slip', label: 'Slip in and start working, hoping the gap goes unnoticed', weight: 1, trait: 'reliability' },
        { id: 'blame', label: 'Show up and tell coworkers the bus company ruined your day', weight: 0, trait: 'reliability' },
      ],
    },
    {
      id: 'line',
      prompt: 'A regular asks for a drink that is not on the menu. Six people are waiting.',
      choices: [
        { id: 'close', label: 'Offer the closest menu drink and make it now', weight: 2, trait: 'service' },
        { id: 'custom', label: 'Invent the custom drink even if the line waits', weight: 1, trait: 'service' },
        { id: 'read', label: 'Tell them to read the menu board', weight: 0, trait: 'service' },
      ],
    },
    {
      id: 'cover',
      prompt: 'A coworker texts asking you to close for them tonight. You already have plans.',
      choices: [
        { id: 'clear', label: 'Say no clearly, and offer a different night you can actually work', weight: 2, trait: 'reliability' },
        { id: 'yes', label: 'Say yes, then decide later if you feel like it', weight: 0, trait: 'reliability' },
        { id: 'ignore', label: 'Leave the text unread', weight: 0, trait: 'reliability' },
      ],
    },
    {
      id: 'short',
      prompt: 'The register is $8 short at close. Nobody else saw it.',
      choices: [
        { id: 'tell', label: 'Tell the manager tonight and write down the count', weight: 2, trait: 'integrity' },
        { id: 'pocket', label: 'Put in $8 of your own and say nothing', weight: 1, trait: 'integrity' },
        { id: 'leave', label: 'Lock up and let the morning person find it', weight: 0, trait: 'integrity' },
      ],
    },
  ],
  summit: [
    {
      id: 'angry',
      prompt: 'A caller is angry that a form is late. You do not know where it is yet.',
      choices: [
        { id: 'listen', label: 'Listen, apologize, and tell them you will check and call back', weight: 2, trait: 'service' },
        { id: 'dept', label: 'Say it is another department and hang up', weight: 0, trait: 'service' },
        { id: 'guess', label: 'Guess a date so they calm down', weight: 0, trait: 'integrity' },
      ],
    },
    {
      id: 'email',
      prompt: 'An email asks you to wire funds today and “keep it quiet.” The sender looks almost like your manager.',
      choices: [
        { id: 'verify', label: 'Do not send it. Ask your manager in person', weight: 2, trait: 'integrity' },
        { id: 'send', label: 'Send it — it uses the manager’s name', weight: 0, trait: 'integrity' },
        { id: 'later', label: 'Ignore the inbox until tomorrow', weight: 1, trait: 'reliability' },
      ],
    },
    {
      id: 'skip',
      prompt: 'A friend wants you to skip a scheduled afternoon. The work is already on your desk.',
      choices: [
        { id: 'stay', label: 'Keep the shift, or ask the manager for a real swap', weight: 2, trait: 'reliability' },
        { id: 'ghost', label: 'Don’t show up and explain later', weight: 0, trait: 'reliability' },
        { id: 'dump', label: 'Leave the pile on a coworker’s chair', weight: 0, trait: 'integrity' },
      ],
    },
    {
      id: 'mistake',
      prompt: 'You filed a packet in the wrong folder. The client appointment is in an hour.',
      choices: [
        { id: 'own', label: 'Tell Diane now and start looking', weight: 2, trait: 'integrity' },
        { id: 'quiet', label: 'Search quietly and hope you find it in time', weight: 1, trait: 'reliability' },
        { id: 'blame', label: 'Say the intern must have moved it', weight: 0, trait: 'integrity' },
      ],
    },
  ],
  freshmart: [
    {
      id: 'pallet',
      prompt: 'A pallet is blocking the milk cooler and the store opens in 20 minutes.',
      choices: [
        { id: 'move', label: 'Move the milk first, then the rest of the pallet', weight: 2, trait: 'reliability' },
        { id: 'break', label: 'Take your break — someone else will notice', weight: 0, trait: 'reliability' },
        { id: 'hide', label: 'Shove the pallet into the aisle so the cooler door opens', weight: 1, trait: 'service' },
      ],
    },
    {
      id: 'spill',
      prompt: 'You drop a case of jars. The aisle is wet and a shopper is coming.',
      choices: [
        { id: 'block', label: 'Warn the shopper, block the spot, then clean it up', weight: 2, trait: 'service' },
        { id: 'walk', label: 'Go find a manager and leave the aisle', weight: 1, trait: 'reliability' },
        { id: 'kick', label: 'Kick the glass aside and keep stocking', weight: 0, trait: 'integrity' },
      ],
    },
    {
      id: 'hours',
      prompt: 'Andre asks if you can stay an extra hour. You can, but you did not plan on it.',
      choices: [
        { id: 'yes', label: 'Stay, since you actually can', weight: 2, trait: 'reliability' },
        { id: 'no', label: 'Say you can’t today and name a day you can', weight: 2, trait: 'reliability' },
        { id: 'maybe', label: 'Say “maybe” and leave at the normal time', weight: 0, trait: 'reliability' },
      ],
    },
    {
      id: 'scan',
      prompt: 'A price tag says $2. The shelf label says $4. A customer asks which is real.',
      choices: [
        { id: 'check', label: 'Check with the lead before you promise a price', weight: 2, trait: 'integrity' },
        { id: 'low', label: 'Tell them $2 so they stay happy', weight: 0, trait: 'integrity' },
        { id: 'shrug', label: 'Shrug and walk away', weight: 0, trait: 'service' },
      ],
    },
  ],
}

export interface ShiftField {
  id: string
  label: string
  options: string[]
  answer: string
}

export interface ShiftTicket {
  prompt: string
  fields: ShiftField[]
}

export const SHIFTS: Record<EmployerId, ShiftTicket[]> = {
  bean: [
    {
      prompt: 'Ticket: small oat latte, no sugar.',
      fields: [
        { id: 'size', label: 'Size', options: ['small', 'medium', 'large'], answer: 'small' },
        { id: 'milk', label: 'Milk', options: ['whole', 'oat', 'almond'], answer: 'oat' },
        { id: 'sugar', label: 'Sugar', options: ['none', 'regular', 'extra'], answer: 'none' },
      ],
    },
    {
      prompt: 'Ticket: medium iced coffee, whole milk, regular sugar.',
      fields: [
        { id: 'size', label: 'Size', options: ['small', 'medium', 'large'], answer: 'medium' },
        { id: 'milk', label: 'Milk', options: ['whole', 'oat', 'almond'], answer: 'whole' },
        { id: 'sugar', label: 'Sugar', options: ['none', 'regular', 'extra'], answer: 'regular' },
      ],
    },
    {
      prompt: 'Ticket: large tea, almond milk, no sugar.',
      fields: [
        { id: 'size', label: 'Size', options: ['small', 'medium', 'large'], answer: 'large' },
        { id: 'milk', label: 'Milk', options: ['whole', 'oat', 'almond'], answer: 'almond' },
        { id: 'sugar', label: 'Sugar', options: ['none', 'regular', 'extra'], answer: 'none' },
      ],
    },
    {
      prompt: 'Ticket: small hot chocolate, whole milk, extra.',
      fields: [
        { id: 'size', label: 'Size', options: ['small', 'medium', 'large'], answer: 'small' },
        { id: 'milk', label: 'Milk', options: ['whole', 'oat', 'almond'], answer: 'whole' },
        { id: 'sugar', label: 'Sugar', options: ['none', 'regular', 'extra'], answer: 'extra' },
      ],
    },
  ],
  summit: [
    {
      prompt: 'Desk pile: invoice from Northwind, a flyer, and a wire request.',
      fields: [
        { id: 'first', label: 'Do first', options: ['file invoice', 'toss flyer', 'send wire'], answer: 'file invoice' },
        { id: 'wire', label: 'Wire request', options: ['ask Diane', 'send it', 'delete it'], answer: 'ask Diane' },
        { id: 'flyer', label: 'Flyer', options: ['bulletin board', 'client folder', 'shred as invoice'], answer: 'bulletin board' },
      ],
    },
    {
      prompt: 'A client packet is due at 3. The copier is jammed. The lobby guest is early.',
      fields: [
        { id: 'guest', label: 'Guest', options: ['seat them and say 3pm', 'ignore them', 'send them away'], answer: 'seat them and say 3pm' },
        { id: 'copier', label: 'Copier', options: ['clear the jam', 'print later', 'hand them a blank page'], answer: 'clear the jam' },
        { id: 'packet', label: 'Packet', options: ['copy then deliver', 'promise it tomorrow', 'hide it'], answer: 'copy then deliver' },
      ],
    },
    {
      prompt: 'Phone log: return Mrs. Adeyemi, order toner, delete a spam prize.',
      fields: [
        { id: 'call', label: 'Call', options: ['Mrs. Adeyemi', 'the prize line', 'nobody'], answer: 'Mrs. Adeyemi' },
        { id: 'toner', label: 'Toner', options: ['order it', 'ignore it', 'buy it yourself'], answer: 'order it' },
        { id: 'spam', label: 'Spam', options: ['delete', 'reply', 'forward to clients'], answer: 'delete' },
      ],
    },
    {
      prompt: 'Closing list from Diane.',
      fields: [
        { id: 'lock', label: 'Files', options: ['lock the cabinet', 'leave them out', 'take them home'], answer: 'lock the cabinet' },
        { id: 'note', label: 'Tomorrow', options: ['leave a note', 'nothing', 'a joke'], answer: 'leave a note' },
        { id: 'lights', label: 'Lights', options: ['off in the back', 'all on', 'only the lobby off'], answer: 'off in the back' },
      ],
    },
  ],
  freshmart: [
    {
      prompt: 'Cooler run. Milk goes in front. Eggs stay level. Bread stays off the floor.',
      fields: [
        { id: 'milk', label: 'Milk', options: ['front of cooler', 'back room', 'produce bin'], answer: 'front of cooler' },
        { id: 'eggs', label: 'Eggs', options: ['flat on the shelf', 'on their side', 'on the milk'], answer: 'flat on the shelf' },
        { id: 'bread', label: 'Bread', options: ['shelf', 'floor', 'freezer'], answer: 'shelf' },
      ],
    },
    {
      prompt: 'Aisle 4 is a mess before the evening rush.',
      fields: [
        { id: 'spill', label: 'Spill', options: ['cone then mop', 'mop with no cone', 'leave it'], answer: 'cone then mop' },
        { id: 'boxes', label: 'Empty boxes', options: ['break down', 'stack in the aisle', 'hide in cereal'], answer: 'break down' },
        { id: 'dates', label: 'Old yogurt', options: ['pull it', 'bury it', 're-sticker it'], answer: 'pull it' },
      ],
    },
    {
      prompt: 'Delivery door. The driver is waiting.',
      fields: [
        { id: 'count', label: 'Count', options: ['count the cases', 'sign blind', 'refuse all'], answer: 'count the cases' },
        { id: 'cold', label: 'Frozen', options: ['freezer first', 'after your break', 'leave on the dock'], answer: 'freezer first' },
        { id: 'note', label: 'Short case', options: ['mark it on the slip', 'ignore it', 'argue and walk off'], answer: 'mark it on the slip' },
      ],
    },
    {
      prompt: 'Close the stockroom.',
      fields: [
        { id: 'pallet', label: 'Pallet jack', options: ['park it', 'leave it in the aisle', 'take it outside'], answer: 'park it' },
        { id: 'trash', label: 'Cardboard', options: ['baler', 'cooler', 'parking lot'], answer: 'baler' },
        { id: 'light', label: 'Stockroom', options: ['lights off, door shut', 'door open', 'lights on'], answer: 'lights off, door shut' },
      ],
    },
  ],
}

export const MAYA_BASKET = [
  { id: 'milk', name: 'Milk', price: 3.49, need: true },
  { id: 'bread', name: 'Bread', price: 2.79, need: true },
  { id: 'eggs', name: 'Eggs', price: 3.29, need: true },
  { id: 'juice', name: 'Bottle juice', price: 6.49, need: false },
  { id: 'chips', name: 'Chips', price: 4.29, need: false },
  { id: 'rice', name: 'Rice', price: 2.19, need: true },
  { id: 'candy', name: 'Candy', price: 3.99, need: false },
  { id: 'beans', name: 'Beans', price: 1.49, need: true },
]

export const MAYA_BUDGET = 24

export interface GroceryProduct {
  id: string
  name: string
  price: number
  color: string
  needKey: string | null
  shelf: string
}

export const GROCERY_PRODUCTS: GroceryProduct[] = [
  { id: 'milk-store', name: 'Store milk', price: 3.29, color: '#f8fafc', needKey: 'milk', shelf: 'Dairy' },
  { id: 'milk-brand', name: 'Brand milk', price: 5.49, color: '#e0f2fe', needKey: 'milk', shelf: 'Dairy' },
  { id: 'eggs', name: 'Eggs', price: 3.49, color: '#fde68a', needKey: 'eggs', shelf: 'Dairy' },
  { id: 'bread-store', name: 'Store bread', price: 2.49, color: '#d9a066', needKey: 'bread', shelf: 'Bakery' },
  { id: 'bread-bakery', name: 'Bakery loaf', price: 5.99, color: '#b45309', needKey: 'bread', shelf: 'Bakery' },
  { id: 'rice', name: 'Rice', price: 2.19, color: '#f5f5f4', needKey: 'rice', shelf: 'Dry' },
  { id: 'beans', name: 'Beans', price: 1.49, color: '#a16207', needKey: 'protein', shelf: 'Dry' },
  { id: 'chicken', name: 'Chicken', price: 8.99, color: '#f4c7b0', needKey: 'protein', shelf: 'Meat' },
  { id: 'energy', name: 'Energy drink', price: 3.49, color: '#84cc16', needKey: null, shelf: 'Drinks' },
  { id: 'candy', name: 'Candy', price: 2.29, color: '#f472b6', needKey: null, shelf: 'Checkout' },
  { id: 'brew', name: 'Cold brew', price: 4.75, color: '#44403c', needKey: null, shelf: 'Drinks' },
  { id: 'shampoo', name: 'Name shampoo', price: 8.49, color: '#38bdf8', needKey: null, shelf: 'Home' },
]

export interface CarModel {
  id: string
  name: string
  price: number
  insurance: number
  upkeep: number
  note: string
}

export const CARS: CarModel[] = [
  {
    id: 'hatch',
    name: '2014 Hatchback',
    price: 5800,
    insurance: 70,
    upkeep: 55,
    note: 'Cheap to insure and sip fuel. Higher chance of a repair bill.',
  },
  {
    id: 'sedan',
    name: '2021 Sedan',
    price: 17500,
    insurance: 110,
    upkeep: 40,
    note: 'Reliable daily car. Insurance sits in the middle.',
  },
  {
    id: 'coupe',
    name: 'Sports Coupe',
    price: 31000,
    insurance: 210,
    upkeep: 60,
    note: 'Fast. Insurance and repairs are expensive.',
  },
]

export interface FinanceOffer {
  id: 'short' | 'long'
  label: string
  down: number
  months: number
  apr: number
}

export const FINANCE: FinanceOffer[] = [
  { id: 'short', label: '36 months', down: 2000, months: 36, apr: 0.071 },
  { id: 'long', label: '72 months', down: 500, months: 72, apr: 0.104 },
]

export function monthlyPayment(principal: number, apr: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0
  const r = apr / 12
  if (r === 0) return principal / months
  const factor = (1 + r) ** months
  return (principal * r * factor) / (factor - 1)
}

export function financeQuote(price: number, offer: FinanceOffer) {
  const principal = Math.max(0, price - offer.down)
  const monthly = monthlyPayment(principal, offer.apr, offer.months)
  const total = offer.down + monthly * offer.months
  return {
    principal: Math.round(principal),
    monthly: Math.round(monthly),
    total: Math.round(total),
    interest: Math.round(total - price),
  }
}

export function interviewSlot(totalMinutes: number): number {
  const day = Math.floor(totalMinutes / MINUTES_PER_DAY)
  return (day + 1) * MINUTES_PER_DAY + 16 * 60 + 30
}

/** Next 8:00 AM. Sleeping at or after 8:00 lands on the following morning. */
export function nextMorning(totalMinutes: number): number {
  const day = Math.floor(totalMinutes / MINUTES_PER_DAY)
  const morning = day * MINUTES_PER_DAY + 8 * 60
  if (totalMinutes < morning - 1) return morning
  return morning + MINUTES_PER_DAY
}

export function inInterviewWindow(now: number, at: number): 'early' | 'open' | 'late' {
  if (now < at - 40) return 'early'
  if (now > at + 120) return 'late'
  return 'open'
}

export function clockLabel(totalMinutes: number): string {
  const s = stampFromMinutes(totalMinutes)
  return `${s.weekday} ${s.month}/${s.dayOfMonth} ${s.clockLabel}`
}

export function daysUntil(now: number, at: number): number {
  return Math.max(0, Math.ceil((at - now) / MINUTES_PER_DAY))
}

export interface DebitResult {
  ok: boolean
  bank: number
  fee: number
  note: string
}

export function debitChecking(bank: number, amount: number, facts: LifeFacts): DebitResult {
  if (amount <= 0) return { ok: true, bank, fee: 0, note: '' }
  const plan = bankPlan(facts.bankPlanId)
  if (bank >= amount) return { ok: true, bank: roundMoney(bank - amount), fee: 0, note: '' }
  if (!plan || facts.legacyBank || !plan.allowsOverdraft) {
    return {
      ok: false,
      bank,
      fee: 0,
      note: plan?.id === 'online'
        ? 'This online account declines payments that exceed the balance. No fee, and the payment did not go through.'
        : 'Checking does not cover that payment.',
    }
  }
  const fee = plan.overdraftFee
  return {
    ok: true,
    bank: roundMoney(bank - amount - fee),
    fee,
    note:
      fee > 0
        ? `Checking covered it and dropped below $0. An overdraft fee of $${fee} was added because this is ${plan.label}.`
        : `${plan.label} covered the payment with no overdraft fee. Checking is now below $0.`,
  }
}

export function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

export function scoreInterview(employerId: EmployerId, picks: string[], communication: number, mayaBonus: boolean) {
  const questions = INTERVIEWS[employerId]
  let score = 0
  const weak: string[] = []
  questions.forEach((q, i) => {
    const choice = q.choices.find((c) => c.id === picks[i])
    const weight = choice?.weight ?? 0
    score += weight
    if (weight < 2 && choice) weak.push(choice.trait)
  })
  if (communication >= 2) score += 1
  if (mayaBonus && employerId === 'bean') score += 1
  const bar = employerId === 'freshmart' ? 4 : 6
  const hired = score >= bar || (score >= bar - 1 && (mayaBonus || communication >= 2) && employerId !== 'summit')
  const feedback = hired
    ? 'They liked how you handled the real situations.'
    : weak.includes('integrity')
      ? 'They wanted clearer honesty when something went wrong.'
      : weak.includes('reliability')
        ? 'They were not convinced you would show up and communicate.'
        : 'The service answers felt sharp. Slow down and take care of the person in front of you.'
  return { score, hired, feedback, max: questions.length * 2 }
}

export function shiftAccuracy(employerId: EmployerId, answers: Record<string, string>[]): number {
  const tickets = SHIFTS[employerId]
  let correct = 0
  let total = 0
  tickets.forEach((ticket, i) => {
    const given = answers[i] ?? {}
    for (const field of ticket.fields) {
      total += 1
      if (given[field.id] === field.answer) correct += 1
    }
  })
  return total === 0 ? 0 : correct / total
}

export function shiftPay(hourly: number, accuracy: number, penalty: number) {
  const hours = 4
  const gross = roundMoney(hourly * hours * (0.55 + 0.45 * accuracy) * penalty)
  const tax = roundMoney(gross * PAYROLL_TAX_RATE)
  const net = roundMoney(gross - tax)
  return { hours, gross, tax, net, performance: Math.round(accuracy * 100) }
}

export function blankApp(): JobApp {
  return { status: 'none', interviewAt: 0, score: 0, feedback: '', reschedules: 0 }
}

export function appOf(facts: LifeFacts, id: EmployerId): JobApp {
  return facts.apps[id] ?? blankApp()
}

export function withApp(facts: LifeFacts, id: EmployerId, app: JobApp): LifeFacts {
  return { ...facts, apps: { ...facts.apps, [id]: app } }
}

export function upsertMission(list: Mission[], mission: Mission): Mission[] {
  const idx = list.findIndex((m) => m.id === mission.id)
  if (idx < 0) return [...list, mission]
  return list
}

export function patchMission(list: Mission[], id: string, edit: (m: Mission) => Mission): Mission[] {
  return list.map((m) => (m.id === id ? edit(m) : m))
}

export function markObjective(list: Mission[], missionId: string, objectiveId: string, done = true): Mission[] {
  return patchMission(list, missionId, (m) => ({
    ...m,
    objectives: m.objectives.map((o) => (o.id === objectiveId ? { ...o, done } : o)),
  }))
}

export function requiredComplete(m: Mission): boolean {
  const required = m.objectives.filter((o) => !o.optional)
  return required.length > 0 && required.every((o) => o.done)
}

export function finishIfReady(list: Mission[], id: string, status: MissionStatus = 'completed', failReason?: string): Mission[] {
  return patchMission(list, id, (m) => {
    if (m.completed || m.status === 'failed' || m.status === 'expired') return m
    if (status === 'completed' && !requiredComplete(m)) return m
    return {
      ...m,
      completed: status === 'completed',
      status,
      failReason: failReason ?? m.failReason,
    }
  })
}

export function setStatus(list: Mission[], id: string, status: MissionStatus): Mission[] {
  return patchMission(list, id, (m) => {
    if (m.completed || m.status === 'failed' || m.status === 'expired' || m.status === 'completed') return m
    return { ...m, status, completed: false }
  })
}

export function objectiveLabel(list: Mission[], missionId: string, objectiveId: string, label: string): Mission[] {
  return patchMission(list, missionId, (m) => ({
    ...m,
    objectives: m.objectives.map((o) => (o.id === objectiveId && o.label !== label ? { ...o, label } : o)),
  }))
}

export function skillCommunication(skills: Skills): number {
  return skills.communication ?? 1
}
