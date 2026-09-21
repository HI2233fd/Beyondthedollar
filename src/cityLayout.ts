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
  glass?: boolean
  facing: 1 | -1
  enterable: boolean
}

/** Same five buildings, spread across a larger block. */
export const BUILDINGS: BuildingDef[] = [
  {
    id: 'home',
    name: 'Home',
    sign: 'MAPLE APARTMENTS',
    signColor: '#e8c07a',
    scene: 'home',
    x: -36,
    z: -22,
    w: 11,
    d: 9,
    h: 9,
    color: '#8a5a44',
    facing: 1,
    enterable: true,
  },
  {
    id: 'bank',
    name: 'FirstCity Bank',
    sign: 'FIRSTCITY BANK',
    signColor: '#7dd3fc',
    scene: 'bank',
    x: -12,
    z: -22,
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
    x: 22,
    z: -24,
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
    x: -28,
    z: 22,
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
    x: 18,
    z: 24,
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

export function exitSpawn(b: BuildingDef): Spawn {
  return {
    pos: [b.x, 0, b.z + b.facing * (b.d / 2 + 2.4)],
    yaw: b.facing === 1 ? 0 : Math.PI,
  }
}

/**
 * Starter district playable bounds.
 * East edge is a soft gate — Downtown skyline is visible beyond but blocked until Life Level 10.
 */
const WORLD = { minX: -58, maxX: 58, minZ: -42, maxZ: 42 }

/** X where the Downtown gate / skyline begins (just past playable maxX). */
export const WORLD_EAST_GATE = WORLD.maxX

export function cityCollision(): AABB[] {
  const boxes: AABB[] = []
  for (const b of BUILDINGS) boxes.push(box(b.x, b.z, b.w, b.d))
  const t = 2
  boxes.push({ minX: WORLD.minX - t, maxX: WORLD.minX, minZ: WORLD.minZ - t, maxZ: WORLD.maxZ + t })
  // Soft east gate — dense wall so Downtown silhouette stays visible but unenterable until unlock.
  boxes.push({ minX: WORLD.maxX, maxX: WORLD.maxX + t, minZ: WORLD.minZ - t, maxZ: WORLD.maxZ + t })
  boxes.push({ minX: WORLD.minX - t, maxX: WORLD.maxX + t, minZ: WORLD.minZ - t, maxZ: WORLD.minZ })
  boxes.push({ minX: WORLD.minX - t, maxX: WORLD.maxX + t, minZ: WORLD.maxZ, maxZ: WORLD.maxZ + t })
  return boxes
}

/** Spawn on the open avenue (keep clear of curb cars). */
export const CITY_START: Spawn = { pos: [0, 0, 0], yaw: Math.PI }

/** Bedroom spawn for new life / home load. */
export const HOME_BEDROOM_START: Spawn = { pos: [-3.2, 0, -2.8], yaw: 0.4 }

export { WORLD }
