import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { Car } from '../props'
import { ROADS_EW, ROADS_NS, ROAD_HALF, WORLD, cityCollision } from '../cityLayout'
import { box } from '../collision'
import { setActiveBoxes } from '../world'

interface Lane {
  axis: 'x' | 'z'
  fixed: number
  min: number
  max: number
  dir: 1 | -1
}

export function Traffic() {
  const lanes = useMemo<Lane[]>(() => {
    const list: Lane[] = []
    for (const z of ROADS_EW) {
      list.push({ axis: 'x', fixed: z - 1.2, min: WORLD.minX + 6, max: WORLD.maxX - 6, dir: 1 })
      list.push({ axis: 'x', fixed: z + 1.2, min: WORLD.minX + 6, max: WORLD.maxX - 6, dir: -1 })
    }
    for (const x of ROADS_NS) {
      list.push({ axis: 'z', fixed: x - 1.2, min: WORLD.minZ + 6, max: WORLD.maxZ - 6, dir: 1 })
      list.push({ axis: 'z', fixed: x + 1.2, min: WORLD.minZ + 6, max: WORLD.maxZ - 6, dir: -1 })
    }
    return list
  }, [])

  const cars = useMemo(() => {
    return lanes.slice(0, 10).map((lane, i) => ({
      lane,
      color: ['#b91c1c', '#1d4ed8', '#e7e5e4', '#111827', '#047857', '#a16207', '#6d28d9', '#0369a1', '#44403c', '#be123c'][i],
      t: (i * 17) % 80,
      speed: 6 + (i % 3),
    }))
  }, [lanes])

  const refs = useRef<(Group | null)[]>([])
  const positions = useRef(cars.map(() => ({ x: 0, z: 0 })))

  useFrame((_, dt) => {
    const step = Math.min(dt, 0.05)
    cars.forEach((car, i) => {
      const g = refs.current[i]
      if (!g) return
      const span = car.lane.max - car.lane.min
      car.t = (car.t + car.speed * step) % span
      let along = car.lane.min + car.t
      if (car.lane.dir < 0) along = car.lane.max - car.t
      const x = car.lane.axis === 'x' ? along : car.lane.fixed
      const z = car.lane.axis === 'z' ? along : car.lane.fixed
      const nearCross = ROADS_NS.some((rx) => Math.abs(x - rx) < ROAD_HALF + 1) && ROADS_EW.some((rz) => Math.abs(z - rz) < ROAD_HALF + 1)
      const blocked = cars.some((_, j) => {
        if (j === i) return false
        const p = positions.current[j]
        return Math.hypot(p.x - x, p.z - z) < 4.2
      })
      if (nearCross || blocked) {
        car.t -= car.speed * step * 0.65
      }
      g.position.set(x, 0, z)
      g.rotation.y = car.lane.axis === 'x' ? (car.lane.dir > 0 ? Math.PI / 2 : -Math.PI / 2) : car.lane.dir > 0 ? 0 : Math.PI
      positions.current[i] = { x, z }
    })
    const carBoxes = positions.current.map((p) => box(p.x, p.z, 2.2, 4.2))
    setActiveBoxes([...cityCollision(), ...carBoxes])
  })

  return (
    <group>
      {cars.map((c, i) => (
        <group key={i} ref={(n) => (refs.current[i] = n)}>
          <Car position={[0, 0, 0]} color={c.color} />
        </group>
      ))}
    </group>
  )
}
