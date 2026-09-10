import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
import { Humanoid } from './Humanoid'
import { useRig } from './rig'
import { pressed, movementLocked } from './keyboard'
import { resolveMovement } from './collision'
import { getActiveBoxes, lerpAngle } from './world'
import { findNearest } from './InteractionSystem'
import { useGame } from './GameState'

const SPEED = 5.2
const RADIUS = 0.55

export function Player() {
  const rig = useRig()
  const localRef = useRef<Group>(null)
  const wasE = useRef(false)

  const scene = useGame((s) => s.scene)
  const spawn = useGame((s) => s.spawn)

  // Place the player when a scene/spawn is set.
  useEffect(() => {
    const g = rig.groupRef.current
    if (!g || !spawn) return
    g.position.set(spawn.pos[0], 0, spawn.pos[2])
    g.rotation.y = spawn.yaw
    rig.yaw.current = spawn.yaw
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, spawn])

  useFrame((_, delta) => {
    const g = rig.groupRef.current
    if (!g) return
    const dt = Math.min(delta, 0.05)
    const locked = movementLocked()

    let f = 0
    let r = 0
    if (!locked) {
      if (pressed.has('KeyW')) f += 1
      if (pressed.has('KeyS')) f -= 1
      if (pressed.has('KeyD')) r += 1
      if (pressed.has('KeyA')) r -= 1
    }

    const yaw = rig.yaw.current
    const fwdX = Math.sin(yaw)
    const fwdZ = Math.cos(yaw)
    const rgtX = Math.cos(yaw)
    const rgtZ = -Math.sin(yaw)

    let dx = fwdX * f + rgtX * r
    let dz = fwdZ * f + rgtZ * r
    const len = Math.hypot(dx, dz)
    const moving = len > 0.001
    rig.moving.current = moving

    if (moving) {
      dx /= len
      dz /= len
      const nx = g.position.x + dx * SPEED * dt
      const nz = g.position.z + dz * SPEED * dt
      const res = resolveMovement(g.position.x, g.position.z, nx, nz, RADIUS, getActiveBoxes())
      g.position.x = res.x
      g.position.z = res.z
      const target = Math.atan2(dx, dz)
      g.rotation.y = lerpAngle(g.rotation.y, target, 0.22)
      rig.walk.current += dt * 10
    }
    g.position.y = 0

    // Interaction: find nearest, update prompt, handle E edge.
    const store = useGame.getState()
    const near = findNearest(g.position, store.scene)
    store.setPrompt(locked ? null : near ? near.prompt : null)

    const eDown = pressed.has('KeyE')
    if (eDown && !wasE.current && !locked && near) {
      near.onInteract()
    }
    wasE.current = eDown
  })

  return (
    <group ref={mergeRefs(rig.groupRef, localRef)}>
      <Humanoid shirt="#2563eb" pants="#1f2937" skin="#d0996b" hair="#241a12" walkRef={rig.walk} movingRef={rig.moving} />
      {/* soft contact shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.5, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.22} />
      </mesh>
    </group>
  )
}

function mergeRefs<T>(...refs: React.Ref<T>[]) {
  return (node: T) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node)
      else if (ref) (ref as React.MutableRefObject<T | null>).current = node
    }
  }
}
