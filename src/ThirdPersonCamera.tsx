import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useRig } from './rig'
import { collides } from './collision'
import { getActiveBoxes } from './world'
import { useGame } from './GameState'

const CAM_RADIUS = 0.35
const MIN_DIST = 0.9

const desired = new Vector3()
const lookAt = new Vector3()
const head = new Vector3()
const dir = new Vector3()

export function ThirdPersonCamera() {
  const rig = useRig()
  const { camera } = useThree()
  const scene = useGame((s) => s.scene)
  const interior = scene !== 'city'

  // Interiors use a closer, lower camera that stays under the ceiling.
  const DIST = interior ? 4 : 6.5
  const HEIGHT = interior ? 1.4 : 2.4
  const LOOK_HEIGHT = interior ? 1.2 : 1.3

  useFrame(() => {
    const g = rig.groupRef.current
    if (!g) return
    const yaw = rig.yaw.current
    const pitch = interior ? Math.min(0.6, Math.max(0.22, rig.pitch.current)) : rig.pitch.current

    const horiz = DIST * Math.cos(pitch)
    const fwdX = Math.sin(yaw)
    const fwdZ = Math.cos(yaw)

    head.set(g.position.x, g.position.y + LOOK_HEIGHT, g.position.z)
    desired.set(
      g.position.x - fwdX * horiz,
      g.position.y + HEIGHT + DIST * Math.sin(pitch),
      g.position.z - fwdZ * horiz,
    )

    // Camera collision: march from the player toward the desired position and
    // stop before entering a wall/building so the camera never clips outside.
    dir.copy(desired).sub(head)
    const maxDist = dir.length()
    dir.normalize()
    const boxes = getActiveBoxes()
    let allowed = maxDist
    for (let d = MIN_DIST; d <= maxDist; d += 0.3) {
      const px = head.x + dir.x * d
      const py = head.y + dir.y * d
      const pz = head.z + dir.z * d
      if (py < 0.4 || collides(px, pz, CAM_RADIUS, boxes)) {
        allowed = Math.max(MIN_DIST, d - 0.3)
        break
      }
    }
    desired.copy(head).add(dir.multiplyScalar(allowed))

    camera.position.lerp(desired, 0.16)
    lookAt.set(g.position.x, g.position.y + LOOK_HEIGHT, g.position.z)
    camera.lookAt(lookAt)
  })

  return null
}
