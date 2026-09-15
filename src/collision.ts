export interface AABB {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

export function box(cx: number, cz: number, w: number, d: number): AABB {
  return { minX: cx - w / 2, maxX: cx + w / 2, minZ: cz - d / 2, maxZ: cz + d / 2 }
}

/** Circle (player) vs expanded AABB test. */
export function hits(x: number, z: number, radius: number, b: AABB): boolean {
  return (
    x > b.minX - radius &&
    x < b.maxX + radius &&
    z > b.minZ - radius &&
    z < b.maxZ + radius
  )
}

export function collides(x: number, z: number, radius: number, boxes: AABB[]): boolean {
  for (const b of boxes) {
    if (hits(x, z, radius, b)) return true
  }
  return false
}

/**
 * Resolve movement from (curX,curZ) toward (nextX,nextZ) against a set of
 * boxes, allowing sliding along walls by testing each axis independently.
 */
export function resolveMovement(
  curX: number,
  curZ: number,
  nextX: number,
  nextZ: number,
  radius: number,
  boxes: AABB[],
): { x: number; z: number } {
  let x = curX
  let z = curZ
  if (!collides(nextX, z, radius, boxes)) x = nextX
  if (!collides(x, nextZ, radius, boxes)) z = nextZ
  return { x, z }
}
