import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { Car } from '../../props'
import { useGame } from '../../GameState'
import { useInteractable } from '../../InteractionSystem'
import { pressed, consumeInteract } from '../../keyboard'
import { resolveMovement } from '../../collision'
import { getActiveBoxes } from '../../world'
import { useRig } from '../../rig'
import type { OwnedVehicle } from './types'

function ParkedOwnedCar({ vehicle }: { vehicle: OwnedVehicle }) {
  const dayAct = useGame((s) => s.dayAct)
  const driving = useGame((s) => s.dayLife.drivingVehicleId)
  const scene = useGame((s) => s.scene)

  useInteractable({
    id: `car-${vehicle.id}`,
    scene: 'city',
    position: [vehicle.x, 0, vehicle.z],
    radius: 3.2,
    prompt: driving === vehicle.id ? 'Already driving' : `Enter ${vehicle.label}`,
    onInteract: () => {
      if (driving) return
      dayAct({ type: 'enter-vehicle', vehicleId: vehicle.id })
    },
  })

  if (scene !== 'city' || driving === vehicle.id) return null
  return <Car position={[vehicle.x, 0, vehicle.z]} rotation={vehicle.yaw} color={vehicle.color} />
}

function DrivingController({ vehicle }: { vehicle: OwnedVehicle }) {
  const rig = useRig()
  const dayAct = useGame((s) => s.dayAct)
  const mesh = useRef<Group>(null)
  const yaw = useRef(vehicle.yaw)
  const speed = useRef(0)

  useEffect(() => {
    const g = rig.groupRef.current
    if (!g) return
    g.position.set(vehicle.x, 0, vehicle.z)
    yaw.current = vehicle.yaw
    g.rotation.y = vehicle.yaw
    rig.yaw.current = vehicle.yaw
  }, [vehicle.id])

  useFrame((_, delta) => {
    const g = rig.groupRef.current
    if (!g) return
    const dt = Math.min(delta, 0.05)
    let throttle = 0
    if (pressed.has('KeyW')) throttle += 1
    if (pressed.has('KeyS')) throttle -= 1
    let steer = 0
    if (pressed.has('KeyA')) steer += 1
    if (pressed.has('KeyD')) steer -= 1

    const target = throttle * 11
    speed.current += (target - speed.current) * Math.min(1, dt * 2.2)
    if (Math.abs(speed.current) > 0.4) {
      yaw.current += steer * dt * 1.6 * Math.sign(speed.current)
    }
    const dx = Math.sin(yaw.current) * speed.current * dt
    const dz = Math.cos(yaw.current) * speed.current * dt
    const res = resolveMovement(g.position.x, g.position.z, g.position.x + dx, g.position.z + dz, 1.1, getActiveBoxes())
    g.position.x = res.x
    g.position.z = res.z
    g.position.y = 0
    g.rotation.y = yaw.current
    rig.yaw.current = yaw.current
    if (mesh.current) {
      mesh.current.position.set(g.position.x, 0, g.position.z)
      mesh.current.rotation.y = yaw.current
    }

    if (consumeInteract()) {
      dayAct({
        type: 'park-vehicle',
        vehicleId: vehicle.id,
        x: g.position.x,
        z: g.position.z,
        yaw: yaw.current,
      })
    }
  })

  return (
    <group ref={mesh} position={[vehicle.x, 0, vehicle.z]} rotation={[0, vehicle.yaw, 0]}>
      <Car position={[0, 0, 0]} color={vehicle.color} />
    </group>
  )
}

export function VehicleSystem() {
  const scene = useGame((s) => s.scene)
  const vehicles = useGame((s) => s.dayLife.vehicles)
  const drivingId = useGame((s) => s.dayLife.drivingVehicleId)
  if (scene !== 'city') return null
  const driving = vehicles.find((v) => v.id === drivingId)
  return (
    <>
      {vehicles.map((v) => (
        <ParkedOwnedCar key={v.id} vehicle={v} />
      ))}
      {driving && <DrivingController vehicle={driving} />}
    </>
  )
}
