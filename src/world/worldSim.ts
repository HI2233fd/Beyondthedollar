/** Saved Bellwether world progress. Old saves omit this and receive defaults. */

export interface CourierJob {
  id: string
  dest: 'home' | 'clinic' | 'kitchen'
  stage: 'accepted' | 'carrying'
}

export interface WorldSim {
  basket: boolean
  gardenStage: number
  stallStock: number
  claimed: string[]
  cafeStep: number
  officeStep: number
  commonsStep: number
  workshopStep: number
  lanternStep: number
  courier: CourierJob | null
  neighborOrder: 'ready' | 'carrying' | 'done'
  trackedId: string | null
  testDrive: boolean
  fuel: number
  apartmentToured: boolean
  townhouseToured: boolean
}

export function defaultWorldSim(): WorldSim {
  return {
    basket: false,
    gardenStage: 0,
    stallStock: 0,
    claimed: [],
    cafeStep: 0,
    officeStep: 0,
    commonsStep: 0,
    workshopStep: 0,
    lanternStep: 0,
    courier: null,
    neighborOrder: 'ready',
    trackedId: null,
    testDrive: false,
    fuel: 40,
    apartmentToured: false,
    townhouseToured: false,
  }
}

export function normalizeWorldSim(raw: Partial<WorldSim> | null | undefined): WorldSim {
  const base = defaultWorldSim()
  if (!raw) return base
  return {
    ...base,
    ...raw,
    claimed: Array.isArray(raw.claimed) ? raw.claimed : [],
    courier: raw.courier && raw.courier.id ? raw.courier : null,
    gardenStage: typeof raw.gardenStage === 'number' ? raw.gardenStage : 0,
    stallStock: typeof raw.stallStock === 'number' ? raw.stallStock : 0,
    fuel: typeof raw.fuel === 'number' ? raw.fuel : base.fuel,
    neighborOrder: raw.neighborOrder ?? base.neighborOrder,
  }
}
