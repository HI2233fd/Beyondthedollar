import { MINUTES_PER_DAY, stampFromMinutes } from '../../simulation/time'

export type PeriodKind = 'home-morning' | 'travel' | 'class' | 'passing' | 'lunch' | 'dismissal' | 'afternoon' | 'evening' | 'night'

export interface SchoolPeriod {
  id: string
  kind: PeriodKind
  label: string
  startMin: number
  endMin: number
  room?: 'classroom-a' | 'classroom-b' | 'cafeteria' | 'hall'
  subject?: string
  conceptId?: string
}

/** Weekday school schedule in minutes-from-midnight. */
export const SCHOOL_DAY: SchoolPeriod[] = [
  { id: 'morning', kind: 'home-morning', label: 'Morning at home', startMin: 7 * 60, endMin: 7 * 60 + 50 },
  { id: 'commute-in', kind: 'travel', label: 'Get to campus', startMin: 7 * 60 + 50, endMin: 8 * 60 + 5 },
  {
    id: 'p1',
    kind: 'class',
    label: 'Period 1 · Personal Finance',
    startMin: 8 * 60 + 10,
    endMin: 9 * 60,
    room: 'classroom-a',
    subject: 'Personal Finance',
    conceptId: 'choices-cost',
  },
  { id: 'pass1', kind: 'passing', label: 'Passing period', startMin: 9 * 60, endMin: 9 * 60 + 8, room: 'hall' },
  {
    id: 'p2',
    kind: 'class',
    label: 'Period 2 · Algebra',
    startMin: 9 * 60 + 8,
    endMin: 9 * 60 + 55,
    room: 'classroom-b',
    subject: 'Algebra',
  },
  { id: 'pass2', kind: 'passing', label: 'Passing period', startMin: 9 * 60 + 55, endMin: 10 * 60 + 5, room: 'hall' },
  {
    id: 'p3',
    kind: 'class',
    label: 'Period 3 · Economics Lab',
    startMin: 10 * 60 + 5,
    endMin: 10 * 60 + 55,
    room: 'classroom-a',
    subject: 'Economics',
    conceptId: 'cashflow-budget',
  },
  { id: 'lunch', kind: 'lunch', label: 'Lunch', startMin: 10 * 60 + 55, endMin: 11 * 60 + 40, room: 'cafeteria' },
  {
    id: 'p4',
    kind: 'class',
    label: 'Period 4 · Civics',
    startMin: 11 * 60 + 45,
    endMin: 12 * 60 + 35,
    room: 'classroom-b',
    subject: 'Civics',
  },
  { id: 'dismissal', kind: 'dismissal', label: 'Dismissal', startMin: 12 * 60 + 35, endMin: 12 * 60 + 50, room: 'hall' },
  { id: 'afternoon', kind: 'afternoon', label: 'Afternoon free', startMin: 12 * 60 + 50, endMin: 17 * 60 },
  { id: 'evening', kind: 'evening', label: 'Evening', startMin: 17 * 60, endMin: 22 * 60 },
  { id: 'night', kind: 'night', label: 'Night', startMin: 22 * 60, endMin: 24 * 60 },
]

export function periodAt(totalMinutes: number): SchoolPeriod {
  const stamp = stampFromMinutes(totalMinutes)
  const weekend = stamp.weekdayIndex >= 5
  if (weekend) {
    const m = stamp.minuteOfDay
    if (m < 12 * 60) return { id: 'weekend-am', kind: 'afternoon', label: 'Weekend morning', startMin: 0, endMin: 12 * 60 }
    if (m < 17 * 60) return { id: 'weekend-pm', kind: 'afternoon', label: 'Weekend afternoon', startMin: 12 * 60, endMin: 17 * 60 }
    if (m < 22 * 60) return { id: 'weekend-eve', kind: 'evening', label: 'Weekend evening', startMin: 17 * 60, endMin: 22 * 60 }
    return { id: 'weekend-night', kind: 'night', label: 'Weekend night', startMin: 22 * 60, endMin: 24 * 60 }
  }
  const m = stamp.minuteOfDay
  for (const p of SCHOOL_DAY) {
    if (m >= p.startMin && m < p.endMin) return p
  }
  if (m < 7 * 60) return SCHOOL_DAY[SCHOOL_DAY.length - 1]
  return SCHOOL_DAY[SCHOOL_DAY.length - 1]
}

export function minutesUntilPeriodEnd(totalMinutes: number): number {
  const p = periodAt(totalMinutes)
  const m = stampFromMinutes(totalMinutes).minuteOfDay
  return Math.max(0, p.endMin - m)
}

export type BusinessId = 'bank' | 'grocery' | 'office' | 'cafe' | 'college' | 'automart'

export function businessOpen(id: BusinessId, totalMinutes: number): boolean {
  const stamp = stampFromMinutes(totalMinutes)
  const h = stamp.hour + stamp.minute / 60
  const weekend = stamp.weekdayIndex >= 5
  if (id === 'college') return !weekend && h >= 7.5 && h < 15
  if (id === 'bank') return !weekend && h >= 9 && h < 17
  if (id === 'office') return !weekend && h >= 8.5 && h < 18
  if (id === 'grocery') return h >= 7 && h < 22
  if (id === 'cafe') return h >= 7 && h < 20
  if (id === 'automart') return !weekend && h >= 9 && h < 19
  return true
}

export interface NpcWaypoint {
  scene: string
  x: number
  z: number
  yaw?: number
  sit?: boolean
  label?: string
}

export interface LivingNpcDef {
  id: string
  name: string
  role: 'student' | 'teacher' | 'worker' | 'friend' | 'customer'
  shirt: string
  pants: string
  hair?: string
  skin?: string
  /** minuteOfDay -> waypoint while on campus / city */
  route: { from: number; to: number; at: NpcWaypoint }[]
  chatter: string[]
  opportunityHint?: string
}

export const CAMPUS_NPCS: LivingNpcDef[] = [
  {
    id: 'friend-riley',
    name: 'Riley',
    role: 'friend',
    shirt: '#f97316',
    pants: '#1f2937',
    hair: '#3b2f2f',
    route: [
      { from: 0, to: 8 * 60 + 5, at: { scene: 'city', x: 18, z: -18, label: 'walking in' } },
      { from: 8 * 60 + 5, to: 9 * 60, at: { scene: 'college', x: -4.5, z: -3.2, yaw: 0, sit: true } },
      { from: 9 * 60, to: 9 * 60 + 8, at: { scene: 'college', x: 0, z: 1.5 } },
      { from: 9 * 60 + 8, to: 9 * 60 + 55, at: { scene: 'college', x: 4.2, z: -3.0, yaw: 0, sit: true } },
      { from: 9 * 60 + 55, to: 10 * 60 + 55, at: { scene: 'college', x: -4.5, z: -3.2, sit: true } },
      { from: 10 * 60 + 55, to: 11 * 60 + 40, at: { scene: 'college', x: 5.5, z: 4.2, sit: true, label: 'lunch' } },
      { from: 11 * 60 + 45, to: 12 * 60 + 35, at: { scene: 'college', x: 4.2, z: -3.0, sit: true } },
      { from: 12 * 60 + 35, to: 17 * 60, at: { scene: 'city', x: -16, z: 8, label: 'after school' } },
      { from: 17 * 60, to: 24 * 60, at: { scene: 'city', x: -34, z: -16 } },
    ],
    chatter: [
      'My brother said Bean Street is still hiring if you want evening hours.',
      'Want to hang after dismissal? We could walk through FreshMart.',
      'I keep meaning to open a bank account. Marcus at FirstCity is patient.',
    ],
    opportunityHint: 'Bean Street Café is hiring — Riley’s brother works there.',
  },
  {
    id: 'friend-sam',
    name: 'Sam',
    role: 'friend',
    shirt: '#0ea5e9',
    pants: '#334155',
    skin: '#8d5a3c',
    route: [
      { from: 0, to: 8 * 60 + 5, at: { scene: 'city', x: 20, z: -20 } },
      { from: 8 * 60 + 5, to: 9 * 60, at: { scene: 'college', x: -3.2, z: -3.2, sit: true } },
      { from: 9 * 60 + 8, to: 9 * 60 + 55, at: { scene: 'college', x: 5.4, z: -3.0, sit: true } },
      { from: 10 * 60 + 5, to: 10 * 60 + 55, at: { scene: 'college', x: -3.2, z: -3.2, sit: true } },
      { from: 10 * 60 + 55, to: 11 * 60 + 40, at: { scene: 'college', x: 4.2, z: 4.2, sit: true } },
      { from: 11 * 60 + 45, to: 12 * 60 + 35, at: { scene: 'college', x: 5.4, z: -3.0, sit: true } },
      { from: 12 * 60 + 35, to: 18 * 60, at: { scene: 'city', x: -26, z: 18, label: 'FreshMart aisle' } },
      { from: 18 * 60, to: 24 * 60, at: { scene: 'city', x: 4, z: 12 } },
    ],
    chatter: [
      'I am thinking about a used car. Insurance is the part nobody mentions.',
      'Cafeteria pizza is somehow always lukewarm. Still better than being hungry in Civics.',
      'If you sit with us at lunch, grab a tray first or the line swallows you.',
    ],
    opportunityHint: 'Sam is browsing used cars after school.',
  },
  {
    id: 'teacher-park',
    name: 'Ms. Park',
    role: 'teacher',
    shirt: '#1e3a5f',
    pants: '#111827',
    hair: '#1a1a1a',
    route: [
      { from: 0, to: 8 * 60, at: { scene: 'college', x: -5.5, z: -5.2 } },
      { from: 8 * 60, to: 9 * 60, at: { scene: 'college', x: -5.5, z: -5.2, label: 'teaching A' } },
      { from: 9 * 60 + 8, to: 9 * 60 + 55, at: { scene: 'college', x: 5.5, z: -5.0, label: 'teaching B' } },
      { from: 10 * 60 + 5, to: 10 * 60 + 55, at: { scene: 'college', x: -5.5, z: -5.2 } },
      { from: 10 * 60 + 55, to: 11 * 60 + 40, at: { scene: 'college', x: 2, z: 3.5, label: 'duty' } },
      { from: 11 * 60 + 45, to: 12 * 60 + 35, at: { scene: 'college', x: 5.5, z: -5.0 } },
      { from: 12 * 60 + 35, to: 24 * 60, at: { scene: 'college', x: -6.5, z: 1.2, label: 'grading' } },
    ],
    chatter: [
      'Sit down when the bell rings. Participation is optional — zoning out is also a choice with a cost.',
      'Raise your hand if you want a turn. I will not call on people who are texting.',
    ],
  },
  {
    id: 'teacher-nguyen',
    name: 'Mr. Nguyen',
    role: 'teacher',
    shirt: '#14532d',
    pants: '#1f2937',
    route: [
      { from: 0, to: 9 * 60 + 5, at: { scene: 'college', x: 5.5, z: -5.0 } },
      { from: 9 * 60 + 8, to: 9 * 60 + 55, at: { scene: 'college', x: 5.5, z: -5.0 } },
      { from: 10 * 60 + 5, to: 12 * 60 + 35, at: { scene: 'college', x: -5.5, z: -5.2 } },
      { from: 12 * 60 + 35, to: 24 * 60, at: { scene: 'city', x: 24, z: -18 } },
    ],
    chatter: ['Warm-up is on the board. Copy it even if you already know it.'],
  },
  {
    id: 'student-a',
    name: 'Jordan K.',
    role: 'student',
    shirt: '#dc2626',
    pants: '#374151',
    route: [
      { from: 8 * 60, to: 9 * 60, at: { scene: 'college', x: -2.0, z: -2.0, sit: true } },
      { from: 9 * 60 + 8, to: 9 * 60 + 55, at: { scene: 'college', x: 3.0, z: -2.0, sit: true } },
      { from: 10 * 60 + 5, to: 10 * 60 + 55, at: { scene: 'college', x: -2.0, z: -2.0, sit: true } },
      { from: 10 * 60 + 55, to: 11 * 60 + 40, at: { scene: 'college', x: 6.5, z: 3.5, sit: true } },
      { from: 11 * 60 + 45, to: 12 * 60 + 35, at: { scene: 'college', x: 3.0, z: -2.0, sit: true } },
      { from: 12 * 60 + 35, to: 24 * 60, at: { scene: 'city', x: 10, z: 6 } },
    ],
    chatter: ['Did you finish the worksheet?'],
  },
  {
    id: 'student-b',
    name: 'Pri',
    role: 'student',
    shirt: '#db2777',
    pants: '#4c1d95',
    hair: '#241a12',
    route: [
      { from: 8 * 60, to: 9 * 60, at: { scene: 'college', x: -0.8, z: -2.0, sit: true } },
      { from: 9 * 60 + 8, to: 9 * 60 + 55, at: { scene: 'college', x: 2.0, z: -3.8, sit: true } },
      { from: 10 * 60 + 55, to: 11 * 60 + 40, at: { scene: 'college', x: 3.2, z: 5.0, sit: true } },
      { from: 11 * 60 + 45, to: 12 * 60 + 35, at: { scene: 'college', x: 2.0, z: -3.8, sit: true } },
      { from: 12 * 60 + 35, to: 24 * 60, at: { scene: 'city', x: -10, z: -8 } },
    ],
    chatter: ['Library after school if you want quiet.'],
  },
]

export const CITY_WORKERS: LivingNpcDef[] = [
  {
    id: 'cafe-worker',
    name: 'Devon',
    role: 'worker',
    shirt: '#78350f',
    pants: '#292524',
    route: [
      { from: 0, to: 7 * 60, at: { scene: 'city', x: -22, z: 6 } },
      { from: 7 * 60, to: 14 * 60, at: { scene: 'cafe', x: -1.5, z: -2.5, label: 'counter' } },
      { from: 14 * 60, to: 15 * 60, at: { scene: 'cafe', x: 2.5, z: 1.5, sit: true, label: 'break' } },
      { from: 15 * 60, to: 20 * 60, at: { scene: 'cafe', x: -1.5, z: -2.5 } },
      { from: 20 * 60, to: 24 * 60, at: { scene: 'city', x: -22, z: 6 } },
    ],
    chatter: ['Order at the counter. Tip jar is optional — not a quiz.'],
  },
  {
    id: 'cafe-customer',
    name: 'Guest',
    role: 'customer',
    shirt: '#64748b',
    pants: '#1e293b',
    route: [
      { from: 8 * 60, to: 9 * 60, at: { scene: 'cafe', x: 2.2, z: 0.5, sit: true } },
      { from: 12 * 60, to: 13 * 60, at: { scene: 'cafe', x: 3.5, z: 2.0, sit: true } },
      { from: 16 * 60, to: 17 * 60, at: { scene: 'cafe', x: 1.0, z: 2.2, sit: true } },
      { from: 0, to: 8 * 60, at: { scene: 'city', x: -14, z: 14 } },
      { from: 9 * 60, to: 12 * 60, at: { scene: 'city', x: -14, z: 14 } },
      { from: 13 * 60, to: 16 * 60, at: { scene: 'city', x: 6, z: -6 } },
      { from: 17 * 60, to: 24 * 60, at: { scene: 'city', x: 6, z: -6 } },
    ],
    chatter: ['The oat latte is worth it once.'],
  },
]

export function npcAt(def: LivingNpcDef, totalMinutes: number): NpcWaypoint | null {
  const m = stampFromMinutes(totalMinutes).minuteOfDay
  for (const leg of def.route) {
    if (m >= leg.from && m < leg.to) return leg.at
  }
  return def.route[0]?.at ?? null
}

export function nextMorningSeven(totalMinutes: number): number {
  const day = Math.floor(totalMinutes / MINUTES_PER_DAY)
  const morning = day * MINUTES_PER_DAY + 7 * 60
  if (totalMinutes < morning - 1) return morning
  return morning + MINUTES_PER_DAY
}
