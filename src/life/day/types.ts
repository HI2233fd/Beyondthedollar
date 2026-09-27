export type FoodId = 'milk' | 'eggs' | 'bread' | 'rice' | 'beans' | 'chicken' | 'oats' | 'leftovers' | 'cafe-meal' | 'cafeteria-tray'
export type OutfitId = 'starter' | 'casual' | 'work' | 'school'

export interface OwnedFood {
  id: string
  kind: FoodId
  label: string
  hungerRestore: number
  boughtAt: number
}

export interface OwnedOutfit {
  id: OutfitId
  label: string
  shirt: string
  pants: string
  jacket: string | null
}

export interface OwnedVehicle {
  id: string
  modelId: string
  label: string
  color: string
  x: number
  z: number
  yaw: number
}

export interface DayLife {
  hunger: number
  energy: number
  pantry: OwnedFood[]
  outfits: OwnedOutfit[]
  wearing: OutfitId
  vehicles: OwnedVehicle[]
  drivingVehicleId: string | null
  sittingId: string | null
  schoolSeated: boolean
  handRaised: boolean
  classParticipation: number
  periodsAttended: string[]
  lunchEatenToday: boolean
  lastAteAt: number
  lastSleptAt: number
  friendsMet: string[]
  dayIndexSeen: number
}

export const OUTFIT_CATALOG: OwnedOutfit[] = [
  { id: 'starter', label: 'Starter clothes', shirt: '#2563eb', pants: '#1f2937', jacket: null },
  { id: 'casual', label: 'Weekend casual', shirt: '#059669', pants: '#334155', jacket: null },
  { id: 'work', label: 'Work polo', shirt: '#0f766e', pants: '#1e293b', jacket: '#1e293b' },
  { id: 'school', label: 'School day fit', shirt: '#7c3aed', pants: '#312e81', jacket: null },
]

export function defaultDayLife(now: number, appearanceShirt?: string, appearancePants?: string): DayLife {
  const starter: OwnedOutfit = {
    id: 'starter',
    label: 'What you woke up in',
    shirt: appearanceShirt ?? '#2563eb',
    pants: appearancePants ?? '#1f2937',
    jacket: null,
  }
  return {
    hunger: 55,
    energy: 78,
    pantry: [
      { id: 'pantry-oats', kind: 'oats', label: 'Instant oats', hungerRestore: 22, boughtAt: now },
      { id: 'pantry-leftovers', kind: 'leftovers', label: 'Fridge leftovers', hungerRestore: 28, boughtAt: now },
    ],
    outfits: [
      starter,
      { id: 'school', label: 'School day fit', shirt: '#7c3aed', pants: '#312e81', jacket: null },
    ],
    wearing: 'starter',
    vehicles: [],
    drivingVehicleId: null,
    sittingId: null,
    schoolSeated: false,
    handRaised: false,
    classParticipation: 0,
    periodsAttended: [],
    lunchEatenToday: false,
    lastAteAt: 0,
    lastSleptAt: now,
    friendsMet: [],
    dayIndexSeen: Math.floor(now / (24 * 60)),
  }
}

export function normalizeDayLife(raw: Partial<DayLife> | undefined, now: number): DayLife {
  const base = defaultDayLife(now)
  if (!raw) return base
  return {
    ...base,
    ...raw,
    pantry: Array.isArray(raw.pantry) ? raw.pantry : base.pantry,
    outfits: Array.isArray(raw.outfits) && raw.outfits.length ? raw.outfits : base.outfits,
    vehicles: Array.isArray(raw.vehicles) ? raw.vehicles : [],
    periodsAttended: Array.isArray(raw.periodsAttended) ? raw.periodsAttended : [],
    friendsMet: Array.isArray(raw.friendsMet) ? raw.friendsMet : [],
    hunger: typeof raw.hunger === 'number' ? raw.hunger : base.hunger,
    energy: typeof raw.energy === 'number' ? raw.energy : base.energy,
    wearing: raw.wearing ?? base.wearing,
    drivingVehicleId: raw.drivingVehicleId ?? null,
    sittingId: raw.sittingId ?? null,
  }
}
