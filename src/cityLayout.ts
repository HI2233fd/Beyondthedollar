import { box, type AABB } from './collision'
import type { SceneId, Spawn } from './GameState'

export interface BuildingDef {
  id: string
  name: string
  sign: string
  signColor: string
  scene: SceneId | null
  x: number
  z: number
  w: number
  d: number
  h: number
  color: string
  accent: string
  roof: 'flat' | 'gable' | 'step' | 'shed'
  glass?: boolean
  facing: 1 | -1
  enterable: boolean
  neighborhood: string
}

export interface BackgroundBlock {
  id: string
  x: number
  z: number
  w: number
  d: number
  h: number
  color: string
  accent: string
}

/**
 * Bellwether. X is east, negative Z is north.
 * Centers follow the reference layout. Footprints are tightened so they miss
 * the road bands (half-width 3.1) and each other.
 */
export const BUILDINGS: BuildingDef[] = [
  {
    id: 'home',
    name: 'Your family home',
    sign: 'FAMILY HOME',
    signColor: '#e8c07a',
    scene: 'home',
    x: -13,
    z: 14,
    w: 11,
    d: 9,
    h: 6.5,
    color: '#c4a484',
    accent: '#8a5a44',
    roof: 'gable',
    facing: 1,
    enterable: true,
    neighborhood: 'Oak Walk',
  },
  {
    id: 'high',
    name: 'Bellwether High',
    sign: 'BELLWETHER HIGH',
    signColor: '#f0c9a0',
    scene: 'high',
    x: -13,
    z: -13,
    w: 16,
    d: 11,
    h: 8,
    color: '#c4a484',
    accent: '#7c4a32',
    roof: 'step',
    facing: 1,
    enterable: true,
    neighborhood: 'Oak Walk',
  },
  {
    id: 'bank',
    name: 'Bellwether Bank',
    sign: 'BELLWETHER BANK',
    signColor: '#5eead4',
    scene: 'bank',
    x: 13,
    z: -13,
    w: 13,
    d: 10,
    h: 8,
    color: '#d5ddd8',
    accent: '#0f766e',
    roof: 'flat',
    facing: 1,
    enterable: true,
    neighborhood: 'Oak Walk',
  },
  {
    id: 'grocery',
    name: 'Juniper Market',
    sign: 'JUNIPER MARKET',
    signColor: '#86efac',
    scene: 'grocery',
    x: 13,
    z: 2,
    w: 14,
    d: 9,
    h: 6,
    color: '#d9e7d6',
    accent: '#166534',
    roof: 'flat',
    facing: -1,
    enterable: true,
    neighborhood: 'Oak Walk',
  },
  {
    id: 'cafe',
    name: 'Corner Café',
    sign: 'CORNER CAFÉ',
    signColor: '#93c5fd',
    scene: 'cafe',
    x: -13,
    z: 1,
    w: 11,
    d: 8,
    h: 5.5,
    color: '#dbe7f5',
    accent: '#1d4ed8',
    roof: 'shed',
    facing: -1,
    enterable: true,
    neighborhood: 'Oak Walk',
  },
  {
    id: 'commons',
    name: 'Downtown Commons',
    sign: 'COMMONS',
    signColor: '#fde68a',
    scene: 'commons',
    x: 0,
    z: -36,
    w: 14,
    d: 8,
    h: 7,
    color: '#e7e5e4',
    accent: '#b45309',
    roof: 'flat',
    facing: 1,
    enterable: true,
    neighborhood: 'Oak Walk',
  },
  {
    id: 'apartments',
    name: 'Juniper Apartments',
    sign: 'JUNIPER APTS',
    signColor: '#fdba74',
    scene: 'apartments',
    x: 13,
    z: 15,
    w: 12,
    d: 9,
    h: 12,
    color: '#e7d3c0',
    accent: '#9a3412',
    roof: 'flat',
    facing: 1,
    enterable: true,
    neighborhood: 'Oak Walk',
  },
  {
    id: 'college',
    name: 'Bellwether College',
    sign: 'BELLWETHER COLLEGE',
    signColor: '#fecaca',
    scene: 'college',
    x: -13,
    z: -64,
    w: 18,
    d: 12,
    h: 10,
    color: '#e8d7c3',
    accent: '#9a3412',
    roof: 'step',
    facing: 1,
    enterable: true,
    neighborhood: 'North Campus',
  },
  {
    id: 'office',
    name: 'Meridian Offices',
    sign: 'MERIDIAN',
    signColor: '#93c5fd',
    scene: 'office',
    x: 13,
    z: -64,
    w: 14,
    d: 12,
    h: 16,
    color: '#8ea0b5',
    accent: '#334155',
    roof: 'flat',
    glass: true,
    facing: 1,
    enterable: true,
    neighborhood: 'North Campus',
  },
  {
    id: 'motors',
    name: 'Horizon Motors',
    sign: 'HORIZON MOTORS',
    signColor: '#bae6fd',
    scene: 'motors',
    x: 53,
    z: 0,
    w: 16,
    d: 12,
    h: 6.5,
    color: '#dbeafe',
    accent: '#0369a1',
    roof: 'flat',
    glass: true,
    facing: 1,
    enterable: true,
    neighborhood: 'East Quarter',
  },
  {
    id: 'kitchen',
    name: 'Harbor Kitchen',
    sign: 'HARBOR KITCHEN',
    signColor: '#fdba74',
    scene: 'kitchen',
    x: 53,
    z: 23,
    w: 13,
    d: 10,
    h: 6,
    color: '#e8c4b0',
    accent: '#9a3412',
    roof: 'gable',
    facing: 1,
    enterable: true,
    neighborhood: 'East Quarter',
  },
  {
    id: 'lantern',
    name: 'The Lantern',
    sign: 'THE LANTERN',
    signColor: '#e9d5ff',
    scene: 'lantern',
    x: 53,
    z: -24,
    w: 14,
    d: 11,
    h: 9,
    color: '#3f3448',
    accent: '#7f1d1d',
    roof: 'step',
    facing: -1,
    enterable: true,
    neighborhood: 'East Quarter',
  },
  {
    id: 'townhouse',
    name: 'Willow Townhouse',
    sign: 'WILLOW',
    signColor: '#fde68a',
    scene: 'townhouse',
    x: -53,
    z: 0,
    w: 12,
    d: 10,
    h: 8,
    color: '#e4d2be',
    accent: '#92400e',
    roof: 'gable',
    facing: 1,
    enterable: true,
    neighborhood: 'West Park',
  },
  {
    id: 'clinic',
    name: 'Community Clinic',
    sign: 'COMMUNITY CLINIC',
    signColor: '#99f6e4',
    scene: 'clinic',
    x: -53,
    z: -24,
    w: 13,
    d: 10,
    h: 6.5,
    color: '#e7e5e4',
    accent: '#0f766e',
    roof: 'flat',
    facing: 1,
    enterable: true,
    neighborhood: 'West Park',
  },
  {
    id: 'workshop',
    name: 'Foundry Workshop',
    sign: 'FOUNDRY',
    signColor: '#fdba74',
    scene: 'workshop',
    x: -53,
    z: 23,
    w: 14,
    d: 11,
    h: 7,
    color: '#a1624a',
    accent: '#44403c',
    roof: 'shed',
    facing: 1,
    enterable: true,
    neighborhood: 'West Park',
  },
]

export const BACKGROUND: BackgroundBlock[] = [
  { id: 'bg-n1', x: -88, z: -58, w: 10, d: 8, h: 14, color: '#64748b', accent: '#334155' },
  { id: 'bg-n2', x: 88, z: -58, w: 9, d: 9, h: 18, color: '#475569', accent: '#1e293b' },
  { id: 'bg-s1', x: -88, z: 58, w: 11, d: 8, h: 11, color: '#78716c', accent: '#44403c' },
  { id: 'bg-s2', x: 88, z: 58, w: 10, d: 8, h: 15, color: '#57534e', accent: '#292524' },
  { id: 'bg-w', x: -88, z: 8, w: 8, d: 12, h: 12, color: '#6b7280', accent: '#374151' },
  { id: 'bg-e', x: 88, z: 12, w: 8, d: 10, h: 20, color: '#526070', accent: '#1f2937' },
  { id: 'bg-nw', x: -30, z: -88, w: 12, d: 8, h: 9, color: '#94a3b8', accent: '#64748b' },
  { id: 'bg-ne', x: 30, z: -88, w: 11, d: 8, h: 13, color: '#7c8aa0', accent: '#334155' },
]

export const ROADS_EW = [-75, -45, 40, 75]
export const ROADS_NS = [-75, -40, 0, 40, 75]
export const ROAD_HALF = 3.1

export const POIS = {
  fountain: { x: 0, z: -26, name: 'Commons fountain' },
  garden: { x: -70, z: 34, name: 'Community garden' },
  stall: { x: -68, z: 10, name: 'West Park craft stall' },
  fuel: { x: 68, z: 12, name: 'Fuel station' },
  buses: [
    { id: 'bus-oak', name: 'Oak Walk stop', neighborhood: 'Oak Walk', x: 0, z: 24 },
    { id: 'bus-north', name: 'North Campus stop', neighborhood: 'North Campus', x: 0, z: -52 },
    { id: 'bus-east', name: 'East Quarter stop', neighborhood: 'East Quarter', x: 36, z: 12 },
    { id: 'bus-west', name: 'West Park stop', neighborhood: 'West Park', x: -36, z: 12 },
  ],
  benches: [
    { id: 'bench-fountain', x: 4, z: -26 },
    { id: 'bench-garden', x: -66, z: 34 },
    { id: 'bench-oak', x: -4, z: 24 },
  ],
}

export function doorPosition(b: BuildingDef): [number, number, number] {
  return [b.x, 0, b.z + b.facing * (b.d / 2)]
}

export function exitSpawn(b: BuildingDef): Spawn {
  return {
    pos: [b.x, 0, b.z + b.facing * (b.d / 2 + 2.6)],
    yaw: b.facing === 1 ? Math.PI : 0,
  }
}

export function buildingById(id: string) {
  return BUILDINGS.find((b) => b.id === id)
}

const WORLD = { minX: -97, maxX: 97, minZ: -97, maxZ: 97 }

export const WORLD_EAST_GATE = WORLD.maxX

export function cityCollision(): AABB[] {
  const boxes: AABB[] = []
  for (const b of BUILDINGS) boxes.push(box(b.x, b.z, b.w, b.d))
  for (const b of BACKGROUND) boxes.push(box(b.x, b.z, b.w, b.d))
  const t = 2
  boxes.push({ minX: WORLD.minX - t, maxX: WORLD.minX, minZ: WORLD.minZ - t, maxZ: WORLD.maxZ + t })
  boxes.push({ minX: WORLD.maxX, maxX: WORLD.maxX + t, minZ: WORLD.minZ - t, maxZ: WORLD.maxZ + t })
  boxes.push({ minX: WORLD.minX - t, maxX: WORLD.maxX + t, minZ: WORLD.minZ - t, maxZ: WORLD.minZ })
  boxes.push({ minX: WORLD.minX - t, maxX: WORLD.maxX + t, minZ: WORLD.maxZ, maxZ: WORLD.maxZ + t })
  return boxes
}

/** Sidewalk near the Oak Walk fountain, clear of building footprints. */
export const CITY_START: Spawn = { pos: [0, 0, 22], yaw: Math.PI }

export const HOME_BEDROOM_START: Spawn = { pos: [-3.2, 0, -2.8], yaw: 0.4 }

export { WORLD }

/** Roof type 'shed' is accepted as a sloped roof. */
export type RoofKind = BuildingDef['roof']
