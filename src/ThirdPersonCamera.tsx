import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useRig } from './rig'

const DIST = 6.5
const HEIGHT = 2.4
const LOOK_HEIGHT = 1.3

const desired = new Vector3()
const lookAt = new Vector3()

export function ThirdPersonCamera() {
  const rig = useRig()
  const { camera } = useThree()

  useFrame(() => {
    const g = rig.groupRef.current
    if (!g) return
    const yaw = rig.yaw.current
    const pitch = rig.pitch.current

    const horiz = DIST * Math.cos(pitch)
    const fwdX = Math.sin(yaw)
    const fwdZ = Math.cos(yaw)

    desired.set(
      g.position.x - fwdX * horiz,
      g.position.y + HEIGHT + DIST * Math.sin(pitch),
      g.position.z - fwdZ * horiz,
    )

    camera.position.lerp(desired, 0.12)
    lookAt.set(g.position.x, g.position.y + LOOK_HEIGHT, g.position.z)
    camera.lookAt(lookAt)
  })

  return null
}
