import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useRig } from './rig'
import { useGame } from './GameState'
import { useRef } from 'react'
import { collides } from './collision'
import { getActiveBoxes } from './world'

const CAM_RADIUS = 0.28
const MIN_DIST = 0.85
const FOCUS_Y = 1.3

const desired = new Vector3()
const lookAt = new Vector3()
const head = new Vector3()
const dir = new Vector3()
const smoothedLook = new Vector3()

function reducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

export function ThirdPersonCamera() {
  const rig = useRig()
  const { camera } = useThree()
  const scene = useGame((s) => s.scene)
  const prevScene = useRef(scene)

  useFrame((_, delta) => {
    const g = rig.groupRef.current
    if (!g) return
    const dt = Math.min(delta, 0.05)
    const yaw = rig.yaw.current
    const pitch = rig.pitch.current
    const dist = scene === 'city' ? rig.distance.current : Math.min(rig.distance.current, 3.15)
    const snap = prevScene.current !== scene
    prevScene.current = scene

    const horiz = dist * Math.cos(pitch)
    const fwdX = Math.sin(yaw)
    const fwdZ = Math.cos(yaw)

    head.set(g.position.x, g.position.y + FOCUS_Y, g.position.z)
    desired.set(
      g.position.x - fwdX * horiz,
      g.position.y + FOCUS_Y + dist * Math.sin(pitch),
      g.position.z - fwdZ * horiz,
    )

    dir.copy(desired).sub(head)
    const maxDist = dir.length()
    if (maxDist > 0.001) dir.normalize()
    const boxes = getActiveBoxes()
    let allowed = maxDist
    for (let d = MIN_DIST; d <= maxDist; d += 0.25) {
      const px = head.x + dir.x * d
      const py = head.y + dir.y * d
      const pz = head.z + dir.z * d
      if (py < 0.35 || collides(px, pz, CAM_RADIUS, boxes)) {
        allowed = Math.max(MIN_DIST, d - 0.25)
        break
      }
    }
    desired.copy(head).add(dir.multiplyScalar(allowed))
    if (desired.y < 0.4) desired.y = 0.4

    const blend = snap || reducedMotion() ? 1 : 1 - Math.exp(-12 * dt)
    camera.position.lerp(desired, blend)
    lookAt.set(g.position.x, g.position.y + FOCUS_Y, g.position.z)
    if (smoothedLook.lengthSq() < 0.001) smoothedLook.copy(lookAt)
    smoothedLook.lerp(lookAt, blend)
    camera.lookAt(smoothedLook)
  })

  return null
}
