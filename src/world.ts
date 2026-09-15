import type { AABB } from './collision'

let activeBoxes: AABB[] = []

export function setActiveBoxes(boxes: AABB[]) {
  activeBoxes = boxes
}
export function getActiveBoxes(): AABB[] {
  return activeBoxes
}

export function lerpAngle(a: number, b: number, t: number): number {
  let diff = b - a
  while (diff > Math.PI) diff -= Math.PI * 2
  while (diff < -Math.PI) diff += Math.PI * 2
  return a + diff * t
}
