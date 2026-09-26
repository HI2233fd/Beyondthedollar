import { stampFromMinutes } from '../../simulation/time'
import type { DayLife, FoodId, OwnedFood, OutfitId } from './types'
import { OUTFIT_CATALOG } from './types'
import { nextMorningSeven, periodAt } from './schedule'

export type DayAction =
  | { type: 'tick-needs'; deltaMinutes: number }
  | { type: 'eat'; foodId: string }
  | { type: 'buy-food'; items: OwnedFood[] }
  | { type: 'change-outfit'; outfitId: OutfitId }
  | { type: 'unlock-outfit'; outfitId: OutfitId }
  | { type: 'sit'; seatId: string | null }
  | { type: 'school-seat'; seated: boolean }
  | { type: 'raise-hand'; raised: boolean }
  | { type: 'answer-class'; correct: boolean; periodId: string }
  | { type: 'attend-period'; periodId: string }
  | { type: 'eat-lunch' }
  | { type: 'sleep' }
  | { type: 'park-vehicle'; vehicleId: string; x: number; z: number; yaw: number }
  | { type: 'enter-vehicle'; vehicleId: string }
  | { type: 'exit-vehicle' }
  | { type: 'add-vehicle'; vehicle: DayLife['vehicles'][number] }
  | { type: 'meet-friend'; id: string }
  | { type: 'roll-day' }

export interface DayResult {
  dayLife: DayLife
  notice: string | null
  advanceMinutes: number
  appearancePatch: { shirt?: string; pants?: string; jacket?: string | null } | null
  education: string[]
  error: string | null
}

function clamp(n: number, a = 0, b = 100) {
  return Math.max(a, Math.min(b, n))
}

export function reduceDay(state: DayLife, totalMinutes: number, action: DayAction): DayResult {
  const d: DayLife = {
    ...state,
    pantry: [...state.pantry],
    outfits: [...state.outfits],
    vehicles: state.vehicles.map((v) => ({ ...v })),
    periodsAttended: [...state.periodsAttended],
    friendsMet: [...state.friendsMet],
  }
  let notice: string | null = null
  let advanceMinutes = 0
  let appearancePatch: DayResult['appearancePatch'] = null
  const education: string[] = []
  let error: string | null = null

  const dayIndex = stampFromMinutes(totalMinutes).dayIndex
  if (dayIndex !== d.dayIndexSeen) {
    d.dayIndexSeen = dayIndex
    d.periodsAttended = []
    d.lunchEatenToday = false
    d.handRaised = false
    d.schoolSeated = false
  }

  if (action.type === 'tick-needs') {
    const dm = Math.max(0, action.deltaMinutes)
    if (dm >= 4 * 60) {
      // Overnight jump (sleep / long wait): light hunger drop, keep rested energy.
      d.hunger = clamp(d.hunger - 12)
      d.energy = clamp(Math.max(d.energy, 88))
    } else {
      d.hunger = clamp(d.hunger - dm * 0.045)
      d.energy = clamp(d.energy - dm * 0.028)
    }
  } else if (action.type === 'eat') {
    const idx = d.pantry.findIndex((f) => f.id === action.foodId)
    if (idx < 0) error = 'That food is gone.'
    else {
      const food = d.pantry[idx]
      d.pantry.splice(idx, 1)
      d.hunger = clamp(d.hunger + food.hungerRestore)
      d.lastAteAt = totalMinutes
      notice = `Ate ${food.label}. Hunger is better.`
      advanceMinutes = 8
    }
  } else if (action.type === 'buy-food') {
    d.pantry = [...d.pantry, ...action.items].slice(0, 24)
    notice = action.items.length ? `Brought home ${action.items.map((i) => i.label).join(', ')}.` : null
  } else if (action.type === 'change-outfit') {
    const outfit = d.outfits.find((o) => o.id === action.outfitId)
    if (!outfit) error = 'You do not own that outfit.'
    else {
      d.wearing = outfit.id
      appearancePatch = { shirt: outfit.shirt, pants: outfit.pants, jacket: outfit.jacket }
      notice = `Changed into ${outfit.label}.`
      advanceMinutes = 4
    }
  } else if (action.type === 'unlock-outfit') {
    if (!d.outfits.some((o) => o.id === action.outfitId)) {
      const catalog = OUTFIT_CATALOG.find((o) => o.id === action.outfitId)
      if (catalog) d.outfits.push(catalog)
    }
  } else if (action.type === 'sit') {
    d.sittingId = action.seatId
  } else if (action.type === 'school-seat') {
    d.schoolSeated = action.seated
    d.sittingId = action.seated ? 'school-desk' : null
  } else if (action.type === 'raise-hand') {
    d.handRaised = action.raised
  } else if (action.type === 'answer-class') {
    d.handRaised = false
    if (!d.periodsAttended.includes(action.periodId)) d.periodsAttended.push(action.periodId)
    if (action.correct) {
      d.classParticipation = Math.min(100, d.classParticipation + 8)
      notice = 'Ms. Park nods. Participation ticks up.'
      education.push('choices-cost')
    } else {
      d.classParticipation = Math.min(100, d.classParticipation + 2)
      notice = 'Not quite — she walks through it once more. Showing up still counts.'
    }
    advanceMinutes = 3
  } else if (action.type === 'attend-period') {
    if (!d.periodsAttended.includes(action.periodId)) d.periodsAttended.push(action.periodId)
    d.classParticipation = Math.min(100, d.classParticipation + 1)
  } else if (action.type === 'eat-lunch') {
    if (d.lunchEatenToday) error = 'You already ate lunch today.'
    else {
      d.lunchEatenToday = true
      d.hunger = clamp(d.hunger + 35)
      d.lastAteAt = totalMinutes
      notice = 'Cafeteria tray done. You can sit with friends.'
      advanceMinutes = 12
    }
  } else if (action.type === 'sleep') {
    const until = nextMorningSeven(totalMinutes)
    advanceMinutes = Math.max(1, until - totalMinutes)
    d.energy = clamp(92)
    d.hunger = clamp(d.hunger - 12)
    d.lastSleptAt = until
    d.schoolSeated = false
    d.handRaised = false
    d.sittingId = null
    d.drivingVehicleId = null
    notice = 'You sleep until 7:00.'
  } else if (action.type === 'enter-vehicle') {
    if (!d.vehicles.some((v) => v.id === action.vehicleId)) error = 'That car is not yours.'
    else {
      d.drivingVehicleId = action.vehicleId
      d.sittingId = null
      notice = 'You are driving. WASD to move, E to park and exit.'
    }
  } else if (action.type === 'exit-vehicle') {
    d.drivingVehicleId = null
    notice = 'You stepped out.'
  } else if (action.type === 'park-vehicle') {
    d.vehicles = d.vehicles.map((v) =>
      v.id === action.vehicleId ? { ...v, x: action.x, z: action.z, yaw: action.yaw } : v,
    )
    d.drivingVehicleId = null
    notice = 'Parked.'
  } else if (action.type === 'add-vehicle') {
    if (!d.vehicles.some((v) => v.id === action.vehicle.id)) d.vehicles = [...d.vehicles, action.vehicle]
  } else if (action.type === 'meet-friend') {
    if (!d.friendsMet.includes(action.id)) d.friendsMet = [...d.friendsMet, action.id]
  } else if (action.type === 'roll-day') {
    // noop marker for day rollover already handled above
  }

  return { dayLife: d, notice, advanceMinutes, appearancePatch, education, error }
}

export function groceryToPantry(
  products: { id: string; name: string; needKey?: string | null }[],
  now: number,
): OwnedFood[] {
  const map: Record<string, { kind: FoodId; restore: number }> = {
    milk: { kind: 'milk', restore: 12 },
    eggs: { kind: 'eggs', restore: 18 },
    bread: { kind: 'bread', restore: 16 },
    rice: { kind: 'rice', restore: 20 },
    protein: { kind: 'beans', restore: 22 },
    chicken: { kind: 'chicken', restore: 28 },
  }
  const out: OwnedFood[] = []
  const seen = new Set<string>()
  for (const p of products) {
    const key = p.needKey || p.id
    if (seen.has(key)) continue
    seen.add(key)
    const meta = (p.needKey && map[p.needKey]) || { kind: 'leftovers' as FoodId, restore: 14 }
    out.push({
      id: `food-${p.id}-${now}`,
      kind: meta.kind,
      label: p.name,
      hungerRestore: meta.restore,
      boughtAt: now,
    })
  }
  return out
}

export function periodLabel(totalMinutes: number): string {
  return periodAt(totalMinutes).label
}
