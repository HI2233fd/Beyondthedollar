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
 * If already stuck inside a collider, push out before applying the move.
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

  // Escape soft-locks when the player starts overlapping a box (e.g. bad spawn).
  if (collides(x, z, radius, boxes)) {
    const freed = depenetrate(x, z, radius, boxes)
    x = freed.x
    z = freed.z
  }

  if (!collides(nextX, z, radius, boxes)) x = nextX
  if (!collides(x, nextZ, radius, boxes)) z = nextZ
  return { x, z }
}

/** Nudge the circle to the nearest free spot around an overlapping AABB. */
function depenetrate(
  x: number,
  z: number,
  radius: number,
  boxes: AABB[],
): { x: number; z: number } {
  if (!collides(x, z, radius, boxes)) return { x, z }
  const steps = [0.35, 0.7, 1.1, 1.6, 2.2, 3.0]
  const dirs: [number, number][] = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]
  for (const dist of steps) {
    for (const [dx, dz] of dirs) {
      const len = Math.hypot(dx, dz) || 1
      const nx = x + (dx / len) * dist
      const nz = z + (dz / len) * dist
      if (!collides(nx, nz, radius, boxes)) return { x: nx, z: nz }
    }
  }
  return { x, z }
}
