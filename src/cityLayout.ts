import { box, type AABB } from './collision'
import type { SceneId, Spawn } from './GameState'

export interface BuildingDef {
  id: string
  name: string
  sign: string
  signColor: string
  scene: SceneId | null // enterable target scene (null = home / not enterable)
  x: number
  z: number
  w: number
  d: number
  h: number
  color: string
  glass?: boolean
  facing: 1 | -1 // door faces +z (1) or -z (-1)
  enterable: boolean
}

export const BUILDINGS: BuildingDef[] = [
  {
    id: 'home',
    name: 'Home',
    sign: 'MAPLE APARTMENTS',
    signColor: '#e8c07a',
    scene: null,
    x: -25,
    z: -13,
    w: 11,
    d: 9,
    h: 9,
    color: '#8a5a44',
    facing: 1,
    enterable: false,
  },
  {
    id: 'bank',
    name: 'FirstCity Bank',
    sign: 'FIRSTCITY BANK',
    signColor: '#7dd3fc',
    scene: 'bank',
    x: -9,
    z: -13,
    w: 11,
    d: 9,
    h: 7.5,
    color: '#b9c2cf',
    facing: 1,
    enterable: true,
  },
  {
    id: 'college',
    name: 'Merridian College',
    sign: 'MERRIDIAN COLLEGE',
    signColor: '#fca5a5',
    scene: 'college',
    x: 11,
    z: -15,
    w: 17,
    d: 12,
    h: 10,
    color: '#c9a27a',
    facing: 1,
    enterable: true,
  },
  {
    id: 'grocery',
    name: 'FreshMart Grocery',
    sign: 'FRESHMART',
    signColor: '#86efac',
    scene: 'grocery',
    x: -16,
    z: 13,
    w: 14,
    d: 9,
    h: 6.5,
    color: '#a8b0bd',
    facing: -1,
    enterable: true,
  },
  {
    id: 'office',
    name: 'Summit Office',
    sign: 'SUMMIT TOWER',
    signColor: '#93c5fd',
    scene: 'office',
    x: 9,
    z: 14,
    w: 12,
    d: 11,
    h: 16,
    color: '#5b6b86',
    glass: true,
    facing: -1,
    enterable: true,
  },
]

export function doorPosition(b: BuildingDef): [number, number, number] {
  return [b.x, 0, b.z + b.facing * (b.d / 2)]
}

/** Where to place the player (outside) after leaving the building. */
export function exitSpawn(b: BuildingDef): Spawn {
  return {
    pos: [b.x, 0, b.z + b.facing * (b.d / 2 + 2.4)],
    yaw: b.facing === 1 ? 0 : Math.PI,
  }
}

const WORLD = { minX: -42, maxX: 42, minZ: -32, maxZ: 32 }

export function cityCollision(): AABB[] {
  const boxes: AABB[] = []
  for (const b of BUILDINGS) boxes.push(box(b.x, b.z, b.w, b.d))
  // world boundary walls (thick boxes just outside the play area)
  const t = 2
  boxes.push({ minX: WORLD.minX - t, maxX: WORLD.minX, minZ: WORLD.minZ - t, maxZ: WORLD.maxZ + t })
  boxes.push({ minX: WORLD.maxX, maxX: WORLD.maxX + t, minZ: WORLD.minZ - t, maxZ: WORLD.maxZ + t })
  boxes.push({ minX: WORLD.minX - t, maxX: WORLD.maxX + t, minZ: WORLD.minZ - t, maxZ: WORLD.minZ })
  boxes.push({ minX: WORLD.minX - t, maxX: WORLD.maxX + t, minZ: WORLD.maxZ, maxZ: WORLD.maxZ + t })
  return boxes
}

// Spawn directly in front of the bank so the first door is straight ahead.
export const CITY_START: Spawn = { pos: [-9, 0, 3.5], yaw: Math.PI }

export { WORLD }
