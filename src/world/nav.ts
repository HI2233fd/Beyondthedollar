import { BUILDINGS, BACKGROUND, POIS, WORLD, doorPosition, type BuildingDef } from '../cityLayout'
import { useGame } from '../GameState'

const CELL = 4

export interface DestPoint {
  id: string
  name: string
  neighborhood: string
  x: number
  z: number
  kind: 'building' | 'poi' | 'person' | 'car'
}

function blocked(x: number, z: number) {
  const pad = 1.4
  for (const b of BUILDINGS) {
    if (Math.abs(x - b.x) < b.w / 2 + pad && Math.abs(z - b.z) < b.d / 2 + pad) return true
  }
  for (const b of BACKGROUND) {
    if (Math.abs(x - b.x) < b.w / 2 + pad && Math.abs(z - b.z) < b.d / 2 + pad) return true
  }
  if (x < WORLD.minX + 1 || x > WORLD.maxX - 1 || z < WORLD.minZ + 1 || z > WORLD.maxZ - 1) return true
  return false
}

export function entranceOf(b: BuildingDef): DestPoint {
  const door = doorPosition(b)
  return {
    id: b.id,
    name: b.name,
    neighborhood: b.neighborhood,
    x: door[0],
    z: door[2] + b.facing * 2.6,
    kind: 'building',
  }
}

export function allDestinations(): DestPoint[] {
  const buildings = BUILDINGS.filter((b) => b.enterable).map(entranceOf)
  const pois: DestPoint[] = [
    { id: 'garden', name: POIS.garden.name, neighborhood: 'West Park', x: POIS.garden.x, z: POIS.garden.z, kind: 'poi' },
    { id: 'stall', name: POIS.stall.name, neighborhood: 'West Park', x: POIS.stall.x, z: POIS.stall.z, kind: 'poi' },
    { id: 'fuel', name: POIS.fuel.name, neighborhood: 'East Quarter', x: POIS.fuel.x, z: POIS.fuel.z, kind: 'poi' },
    { id: 'fountain', name: POIS.fountain.name, neighborhood: 'Oak Walk', x: POIS.fountain.x, z: POIS.fountain.z, kind: 'poi' },
    ...POIS.buses.map((b) => ({
      id: b.id,
      name: b.name,
      neighborhood: b.neighborhood,
      x: b.x,
      z: b.z,
      kind: 'poi' as const,
    })),
  ]
  return [...buildings, ...pois]
}

export function destinationPoint(id: string | null): DestPoint | null {
  if (!id) return null
  const known = allDestinations().find((d) => d.id === id)
  if (known) return known
  if (id === 'parked-car') {
    const car = useGame.getState().dayLife.vehicles.find((v) => !v.id.startsWith('testdrive'))
    if (!car) return null
    return { id, name: car.label, neighborhood: 'Street', x: car.x, z: car.z, kind: 'car' }
  }
  if (id.startsWith('person:')) {
    return null
  }
  return null
}

function key(ix: number, iz: number) {
  return `${ix},${iz}`
}

function toCell(v: number) {
  return Math.round((v - WORLD.minX) / CELL)
}

/** A* on a coarse grid. Returns the next world point, or done/clear flags. */
export function nextGuideStep(x: number, z: number, tx: number, tz: number): { x: number; z: number; done: boolean; clear: boolean } {
  if (Math.hypot(tx - x, tz - z) < 3.2) return { x: tx, z: tz, done: true, clear: true }
  const start = { ix: toCell(x), iz: toCell(z) }
  const goal = { ix: toCell(tx), iz: toCell(tz) }
  const span = Math.ceil((WORLD.maxX - WORLD.minX) / CELL)
  if (goal.ix < 1 || goal.iz < 1 || goal.ix > span - 1 || goal.iz > span - 1) return { x, z, done: false, clear: false }

  const open: { ix: number; iz: number; g: number; f: number }[] = [{ ...start, g: 0, f: 0 }]
  const came = new Map<string, string>()
  const best = new Map<string, number>()
  best.set(key(start.ix, start.iz), 0)
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]
  let guard = 0
  while (open.length && guard++ < 4000) {
    open.sort((a, b) => a.f - b.f)
    const cur = open.shift()!
    if (cur.ix === goal.ix && cur.iz === goal.iz) {
      const path: { ix: number; iz: number }[] = [cur]
      let k = key(cur.ix, cur.iz)
      while (came.has(k)) {
        const [px, pz] = came.get(k)!.split(',').map(Number)
        path.push({ ix: px, iz: pz })
        k = key(px, pz)
      }
      path.reverse()
      const step = path[1] ?? path[0]
      return {
        x: WORLD.minX + step.ix * CELL,
        z: WORLD.minZ + step.iz * CELL,
        done: false,
        clear: true,
      }
    }
    for (const [dx, dz] of dirs) {
      const ix = cur.ix + dx
      const iz = cur.iz + dz
      if (ix < 1 || iz < 1 || ix > span - 1 || iz > span - 1) continue
      const wx = WORLD.minX + ix * CELL
      const wz = WORLD.minZ + iz * CELL
      if (blocked(wx, wz) && !(ix === goal.ix && iz === goal.iz)) continue
      const g = cur.g + 1
      const k = key(ix, iz)
      if (g >= (best.get(k) ?? Infinity)) continue
      best.set(k, g)
      came.set(k, key(cur.ix, cur.iz))
      const f = g + Math.abs(goal.ix - ix) + Math.abs(goal.iz - iz)
      open.push({ ix, iz, g, f })
    }
  }
  return { x, z, done: false, clear: false }
}
