import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
import { Humanoid, type HumanAnim } from './Humanoid'
import { useRig } from './rig'
import { pressed, movementLocked, consumeInteract, binding } from './keyboard'
import { resolveMovement } from './collision'
import { getActiveBoxes, lerpAngle } from './world'
import { findNearest } from './InteractionSystem'
import { useGame } from './GameState'
import { cancelGuide, guidingNow, useWorldUi } from './world/simStore'
import { nextGuideStep, destinationPoint } from './world/nav'

const WALK = 2.5
const RUN = 4.6
const RADIUS = 0.42

export function Player() {
  const rig = useRig()
  const localRef = useRef<Group>(null)
  const reachUntil = useRef(0)
  const reachKind = useRef<HumanAnim>('reach')
  const stamina = useRef(100)
  const sprintDelay = useRef(0)
  const sprinting = useRef(false)

  const scene = useGame((s) => s.scene)
  const spawn = useGame((s) => s.spawn)
  const appearance = useGame((s) => s.appearance)
  const basket = useGame((s) => s.worldSim.basket)

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
    const store = useGame.getState()
    const seated = !!store.dayLife?.sittingId
    const drivingNow = !!store.dayLife?.drivingVehicleId

    if (!locked) {
      const turn = 2.2 * dt
      if (pressed.has('ArrowLeft')) rig.yaw.current += turn
      if (pressed.has('ArrowRight')) rig.yaw.current -= turn
    }

    let f = 0
    let r = 0
    const moveKeys =
      pressed.has(binding('forward')) ||
      pressed.has(binding('back')) ||
      pressed.has(binding('left')) ||
      pressed.has(binding('right')) ||
      pressed.has('ArrowUp') ||
      pressed.has('ArrowDown')
    if (moveKeys && guidingNow()) cancelGuide()

    if (!locked) {
      if (pressed.has(binding('forward')) || pressed.has('ArrowUp')) f += 1
      if (pressed.has(binding('back')) || pressed.has('ArrowDown')) f -= 1
      if (pressed.has(binding('right'))) r += 1
      if (pressed.has(binding('left'))) r -= 1
    }

    const yaw = rig.yaw.current
    const fwdX = Math.sin(yaw)
    const fwdZ = Math.cos(yaw)
    const rgtX = -Math.cos(yaw)
    const rgtZ = Math.sin(yaw)

    let dx = fwdX * f + rgtX * r
    let dz = fwdZ * f + rgtZ * r
    let len = Math.hypot(dx, dz)
    let moving = len > 0.001

    if (!moving && !locked && guidingNow()) {
      const dest = destinationPoint(useGame.getState().worldSim.trackedId)
      if (dest) {
        const step = nextGuideStep(g.position.x, g.position.z, dest.x, dest.z)
        if (step.done) cancelGuide(`Arrived at ${dest.name}. Press E to enter.`)
        else if (!step.clear) cancelGuide('No clear route. Move to an open path and try again.')
        else {
          dx = step.x - g.position.x
          dz = step.z - g.position.z
          len = Math.hypot(dx, dz)
          moving = len > 0.08
        }
      }
    }

    rig.moving.current = moving
    const wantSprint = moving && (pressed.has(binding('run')) || pressed.has('ShiftRight')) && !guidingNow()
    if (wantSprint && stamina.current <= 0) sprinting.current = false
    if (wantSprint && (stamina.current > 20 || sprinting.current) && stamina.current > 0) {
      sprinting.current = true
      stamina.current = Math.max(0, stamina.current - 12 * dt)
      sprintDelay.current = 1
      if (stamina.current <= 0) sprinting.current = false
    } else {
      sprinting.current = false
      if (sprintDelay.current > 0) sprintDelay.current -= dt
      else stamina.current = Math.min(100, stamina.current + 18 * dt)
    }
    if (Math.abs(useWorldUi.getState().stamina - stamina.current) > 1.5 || stamina.current === 0 || stamina.current >= 99.5) {
      useWorldUi.setState({ stamina: stamina.current })
    }
    const running = sprinting.current
    const targetSpeed = moving ? (running ? RUN : WALK) : 0
    const velBlend = 1 - Math.exp(-18 * dt)
    rig.speed.current += (targetSpeed - rig.speed.current) * velBlend

    if (moving && len > 0.001) {
      dx /= len
      dz /= len
      const nx = g.position.x + dx * rig.speed.current * dt
      const nz = g.position.z + dz * rig.speed.current * dt
      const res = resolveMovement(g.position.x, g.position.z, nx, nz, RADIUS, getActiveBoxes())
      g.position.x = res.x
      g.position.z = res.z
      const target = Math.atan2(dx, dz)
      g.rotation.y = lerpAngle(g.rotation.y, target, 1 - Math.exp(-10 * dt))
      rig.walk.current += dt * (running ? 14 : 8) * (rig.speed.current / WALK)
    }
    g.position.y = 0

    const near = findNearest(g.position, store.scene)
    store.setPrompt(locked && !seated && !drivingNow ? null : near ? near.prompt : null)

    const wantInteract = consumeInteract()
    if (wantInteract && (!locked || seated) && !drivingNow && near) {
      reachUntil.current = performance.now() + 700
      reachKind.current = /cook|prepare|repair|workbench|workstation|checkout|basket|stock|garden|refuel|bench/i.test(near.prompt)
        ? 'pickup'
        : 'reach'
      near.onInteract()
    }

    let anim: HumanAnim = 'idle'
    if (seated) anim = 'sit'
    else if (performance.now() < reachUntil.current) anim = reachKind.current
    else if (store.dialogue) anim = 'talk'
    else if (running) anim = 'jog'
    else if (moving) anim = 'walk'
    rig.anim.current = anim
  })

  const driving = useGame((s) => !!s.dayLife.drivingVehicleId)

  return (
    <group ref={mergeRefs(rig.groupRef, localRef)} scale={1} visible={!driving}>
      <Humanoid look={appearance} walkRef={rig.walk} movingRef={rig.moving} animRef={rig.anim} />
      {basket && (
        <mesh position={[0.28, 0.7, 0.12]} castShadow>
          <boxGeometry args={[0.28, 0.16, 0.22]} />
          <meshStandardMaterial color="#c4a574" />
        </mesh>
      )}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.42, 16]} />
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
