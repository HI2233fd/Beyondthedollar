import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { Car } from '../../props'
import { useGame } from '../../GameState'
import { useInteractable } from '../../InteractionSystem'
import { pressed, consumeInteract } from '../../keyboard'
import { collides, resolveMovement } from '../../collision'
import { getActiveBoxes } from '../../world'
import { useRig } from '../../rig'
import { useWorldUi } from '../../world/simStore'
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
    prompt: driving === vehicle.id ? 'Already driving' : `Drive ${vehicle.label}`,
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
  const testFuel = useRef(30)
  const fuelWrite = useRef(0)

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

    const testing = vehicle.id === 'testdrive'
    const fuel = testing ? testFuel.current : useGame.getState().worldSim.fuel
    const target = fuel <= 0 ? 0 : throttle * 11
    speed.current += (target - speed.current) * Math.min(1, dt * 2.2)
    if (fuel <= 0) speed.current *= Math.max(0, 1 - dt * 1.4)
    if (pressed.has('Space')) speed.current *= Math.max(0, 1 - dt * 4)
    if (Math.abs(speed.current) > 0.4) {
      yaw.current += steer * dt * 1.6 * Math.sign(speed.current || 1)
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

    if (Math.abs(speed.current) > 0.3 && fuel > 0) {
      const burn = Math.abs(speed.current) * dt * 0.05
      if (testing) testFuel.current = Math.max(0, testFuel.current - burn)
      else {
        fuelWrite.current += burn
        if (fuelWrite.current > 1.5) {
          const next = Math.max(0, useGame.getState().worldSim.fuel - fuelWrite.current)
          useGame.getState().patchWorld({ fuel: Math.round(next * 10) / 10 })
          fuelWrite.current = 0
        }
      }
    }
    const shown = Math.abs(speed.current)
    if (Math.abs(useWorldUi.getState().carSpeed - shown) > 0.5) useWorldUi.setState({ carSpeed: shown })

    if (consumeInteract() && Math.abs(speed.current) < 0.8) {
      const side = yaw.current + Math.PI / 2
      const sx = g.position.x + Math.sin(side) * 2.4
      const sz = g.position.z + Math.cos(side) * 2.4
      if (collides(sx, sz, 0.45, getActiveBoxes())) {
        useGame.getState().openDialogue({
          name: 'Car',
          text: 'No clear ground beside the car. Roll to an open curb, then press E.',
          options: [{ label: 'Back', close: true }],
        })
      } else {
        dayAct({
          type: 'park-vehicle',
          vehicleId: vehicle.id,
          x: g.position.x,
          z: g.position.z,
          yaw: yaw.current,
        })
        g.position.x = sx
        g.position.z = sz
        if (testing) useGame.getState().patchWorld({ testDrive: false })
      }
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
