/** Pure calendar + lighting helpers for the simulation clock. */

export const MINUTES_PER_DAY = 24 * 60

/** Starting calendar: Monday, Sept 1, Year 1 @ 08:00 */
export const EPOCH_WEEKDAY = 0 // Mon=0 … Sun=6
export const EPOCH_MONTH = 9
export const EPOCH_DAY = 1
export const EPOCH_YEAR = 1
export const START_TOTAL_MINUTES = 8 * 60 // 08:00 on day 0

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
export type Weekday = (typeof WEEKDAYS)[number]

export interface CalendarStamp {
  totalMinutes: number
  dayIndex: number
  minuteOfDay: number
  hour: number
  minute: number
  weekday: Weekday
  weekdayIndex: number
  /** 1–31 display day-of-month (simple 30-day months). */
  month: number
  dayOfMonth: number
  year: number
  label: string
  clockLabel: string
}

export function stampFromMinutes(totalMinutes: number): CalendarStamp {
  const t = Math.max(0, Math.floor(totalMinutes))
  const dayIndex = Math.floor(t / MINUTES_PER_DAY)
  const minuteOfDay = t % MINUTES_PER_DAY
  const hour = Math.floor(minuteOfDay / 60)
  const minute = minuteOfDay % 60
  const weekdayIndex = (EPOCH_WEEKDAY + dayIndex) % 7
  const weekday = WEEKDAYS[weekdayIndex]
  // 30-day months from epoch date
  const absDay = EPOCH_DAY - 1 + dayIndex
  const monthOffset = Math.floor(absDay / 30)
  let month = EPOCH_MONTH + monthOffset
  let year = EPOCH_YEAR
  while (month > 12) {
    month -= 12
    year += 1
  }
  const dayOfMonth = (absDay % 30) + 1
  const clockLabel = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  const label = `${weekday} ${month}/${dayOfMonth} · ${clockLabel}`
  return {
    totalMinutes: t,
    dayIndex,
    minuteOfDay,
    hour,
    minute,
    weekday,
    weekdayIndex,
    month,
    dayOfMonth,
    year,
    label,
    clockLabel,
  }
}

export type DayPhase = 'night' | 'dawn' | 'day' | 'dusk'

export function dayPhase(minuteOfDay: number): DayPhase {
  const h = minuteOfDay / 60
  if (h >= 6 && h < 8) return 'dawn'
  if (h >= 8 && h < 17) return 'day'
  if (h >= 17 && h < 20) return 'dusk'
  return 'night'
}

export interface LightingState {
  phase: DayPhase
  sunPosition: [number, number, number]
  sunIntensity: number
  hemiSky: string
  hemiGround: string
  hemiIntensity: number
  fogColor: string
  fogNear: number
  fogFar: number
  skyTurbidity: number
  skyRayleigh: number
  ambientBoost: number
}

/** Lighting-only day/night (no geometry changes). */
export function lightingForMinuteOfDay(minuteOfDay: number): LightingState {
  const phase = dayPhase(minuteOfDay)
  const h = minuteOfDay / 60
  // Sun arcs east→west; y peaks at noon.
  const angle = ((h - 6) / 12) * Math.PI // 6am=0, noon=π/2, 6pm=π
  const sunY = Math.sin(angle)
  const sunX = Math.cos(angle) * 40
  const sunZ = 20
  const sunPosition: [number, number, number] = [sunX, Math.max(sunY * 45, -8), sunZ]

  if (phase === 'day') {
    return {
      phase,
      sunPosition,
      sunIntensity: 2.1,
      hemiSky: '#dce8ff',
      hemiGround: '#4a5a44',
      hemiIntensity: 0.7,
      fogColor: '#cdd8e6',
      fogNear: 45,
      fogFar: 120,
      skyTurbidity: 6,
      skyRayleigh: 1.2,
      ambientBoost: 0,
    }
  }
  if (phase === 'dawn') {
    const t = (h - 6) / 2
    return {
      phase,
      sunPosition,
      sunIntensity: 0.6 + t * 1.3,
      hemiSky: '#f7c9a8',
      hemiGround: '#3a3a4a',
      hemiIntensity: 0.35 + t * 0.3,
      fogColor: '#e8c9b0',
      fogNear: 35,
      fogFar: 100,
      skyTurbidity: 8,
      skyRayleigh: 2.2,
      ambientBoost: 0.05,
    }
  }
  if (phase === 'dusk') {
    const t = (h - 17) / 3
    return {
      phase,
      sunPosition,
      sunIntensity: 1.6 * (1 - t),
      hemiSky: '#f0a878',
      hemiGround: '#2a3040',
      hemiIntensity: 0.45,
      fogColor: '#c99a7a',
      fogNear: 30,
      fogFar: 95,
      skyTurbidity: 9,
      skyRayleigh: 2.5,
      ambientBoost: 0.08,
    }
  }
  // night
  return {
    phase,
    sunPosition: [10, -20, 30],
    sunIntensity: 0.05,
    hemiSky: '#1a2240',
    hemiGround: '#0a0c12',
    hemiIntensity: 0.22,
    fogColor: '#0d1220',
    fogNear: 25,
    fogFar: 80,
    skyTurbidity: 2,
    skyRayleigh: 0.4,
    ambientBoost: 0.12,
  }
}

/** Default: 1 game minute per real second → 1 real minute = 1 game hour; 1 game day ≈ 24 real minutes. */
export const DEFAULT_GAME_MINUTES_PER_REAL_SECOND = 1
