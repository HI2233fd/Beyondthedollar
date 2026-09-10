import type { SceneId, Spawn } from '../GameState'

// Player is placed just inside the entrance, facing into the room (-z).
export const INTERIOR_SPAWN: Record<Exclude<SceneId, 'city'>, Spawn> = {
  bank: { pos: [0, 0, 4.6], yaw: Math.PI },
  grocery: { pos: [0, 0, 5.2], yaw: Math.PI },
  college: { pos: [0, 0, 4.6], yaw: Math.PI },
  office: { pos: [0, 0, 5.2], yaw: Math.PI },
}
