import type { SceneId, Spawn } from '../GameState'

// Player is placed a few steps inside, facing into the room (-z), with enough
// space behind for the third-person camera and clear of the exit trigger.
export const INTERIOR_SPAWN: Record<Exclude<SceneId, 'city'>, Spawn> = {
  bank: { pos: [0, 0, 2], yaw: Math.PI },
  grocery: { pos: [0, 0, 2.5], yaw: Math.PI },
  college: { pos: [0, 0, 2], yaw: Math.PI },
  office: { pos: [0, 0, 2.5], yaw: Math.PI },
}
