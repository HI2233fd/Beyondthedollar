import type { SceneId, Spawn } from '../GameState'

// A few steps inside the doorway, facing into the room.
const INSIDE: Spawn = { pos: [0, 0, 6], yaw: Math.PI }

export const INTERIOR_SPAWN: Record<Exclude<SceneId, 'city'>, Spawn> = {
  bank: { pos: [0, 0, 4], yaw: Math.PI },
  grocery: { pos: [0, 0, 4.2], yaw: Math.PI },
  college: { pos: [0, 0, 4.5], yaw: Math.PI },
  office: { pos: [0, 0, 4.2], yaw: Math.PI },
  home: { pos: [-3.2, 0, -2.8], yaw: 0.4 },
  cafe: { pos: [0, 0, 3.2], yaw: Math.PI },
  high: INSIDE,
  commons: INSIDE,
  apartments: { pos: [0, 0, 6], yaw: Math.PI },
  motors: INSIDE,
  kitchen: INSIDE,
  lantern: INSIDE,
  townhouse: INSIDE,
  clinic: INSIDE,
  workshop: INSIDE,
}
