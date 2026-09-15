import { useEffect, useMemo } from 'react'
import { Building } from './Buildings/Building'
import { Car, Streetlight, Tree, Pedestrian } from './props'
import { BUILDINGS, cityCollision, WORLD } from './cityLayout'
import { box } from './collision'
import { setActiveBoxes } from './world'

const ROAD_HALF = 4.5
const SIDEWALK_OUTER = 8

const PARKED_CARS: { x: number; z: number; color: string }[] = [
  { x: -30, z: -3.4, color: '#c0392b' },
  { x: -18, z: -3.4, color: '#2c3e50' },
  { x: 2, z: -3.4, color: '#ecf0f1' },
  { x: 20, z: -3.4, color: '#7f8c8d' },
  { x: -24, z: 3.4, color: '#34495e' },
  { x: 0, z: 3.4, color: '#8e44ad' },
  { x: 16, z: 3.4, color: '#16a085' },
]

export function City() {
  useEffect(() => {
    const carBoxes = PARKED_CARS.map((c) => box(c.x, c.z, 4.4, 2.0))
    setActiveBoxes([...cityCollision(), ...carBoxes])
  }, [])

  const laneDashes = useMemo(() => {
    const arr: number[] = []
    for (let x = WORLD.minX + 2; x < WORLD.maxX; x += 4) arr.push(x)
    return arr
  }, [])

  const streetProps = useMemo(() => {
    const lights: { x: number; z: number }[] = []
    const trees: { x: number; z: number }[] = []
    for (let x = -36; x <= 36; x += 12) {
      lights.push({ x, z: -SIDEWALK_OUTER + 0.6 })
      lights.push({ x: x + 6, z: SIDEWALK_OUTER - 0.6 })
    }
    for (let x = -34; x <= 36; x += 12) {
      trees.push({ x: x + 3, z: -SIDEWALK_OUTER + 0.7 })
      trees.push({ x, z: SIDEWALK_OUTER - 0.7 })
    }
    return { lights, trees }
  }, [])

  const worldW = WORLD.maxX - WORLD.minX + 4

  return (
    <group>
      {/* Grass base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[worldW + 20, 90]} />
        <meshStandardMaterial color="#3f5e3a" roughness={1} />
      </mesh>

      {/* Road (asphalt) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[worldW, ROAD_HALF * 2]} />
        <meshStandardMaterial color="#2a2d33" roughness={0.95} />
      </mesh>

      {/* Sidewalks */}
      {[-1, 1].map((s) => (
        <mesh key={s} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, s * (ROAD_HALF + (SIDEWALK_OUTER - ROAD_HALF) / 2)]} receiveShadow>
          <planeGeometry args={[worldW, SIDEWALK_OUTER - ROAD_HALF]} />
          <meshStandardMaterial color="#9aa0a8" roughness={0.9} />
        </mesh>
      ))}

      {/* Curbs */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, 0.08, s * ROAD_HALF]}>
          <boxGeometry args={[worldW, 0.16, 0.2]} />
          <meshStandardMaterial color="#c7ccd2" />
        </mesh>
      ))}

      {/* Center dashed line */}
      {laneDashes.map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02, 0]}>
          <planeGeometry args={[2, 0.18]} />
          <meshStandardMaterial color="#e9d27a" />
        </mesh>
      ))}

      {/* Crosswalks near each enterable building */}
      {BUILDINGS.filter((b) => b.enterable).map((b) => (
        <group key={b.id}>
          {[-1.2, -0.6, 0, 0.6, 1.2].map((o) => (
            <mesh key={o} rotation={[-Math.PI / 2, 0, 0]} position={[b.x + o, 0.02, b.facing * 3]}>
              <planeGeometry args={[0.4, 4]} />
              <meshStandardMaterial color="#dfe3e8" />
            </mesh>
          ))}
        </group>
      ))}

      {/* Buildings */}
      {BUILDINGS.map((b) => (
        <Building key={b.id} def={b} />
      ))}

      {/* Parked cars (aligned east-west along the curb) */}
      {PARKED_CARS.map((c, i) => (
        <Car key={i} position={[c.x, 0, c.z]} rotation={Math.PI / 2} color={c.color} />
      ))}

      {/* Streetlights + trees */}
      {streetProps.lights.map((l, i) => (
        <Streetlight key={`l${i}`} position={[l.x, 0, l.z]} />
      ))}
      {streetProps.trees.map((t, i) => (
        <Tree key={`t${i}`} position={[t.x, 0, t.z]} />
      ))}

      {/* Pedestrians */}
      <Pedestrian position={[-12, 0, 6.5]} range={9} speed={1.0} phase={0} shirt="#ef4444" />
      <Pedestrian position={[6, 0, -6.6]} range={10} speed={0.8} phase={2} shirt="#22c55e" pants="#374151" />
      <Pedestrian position={[24, 0, 6.4]} range={7} speed={1.2} phase={4} shirt="#eab308" pants="#3f3f46" skin="#8d5a3c" />
      <Pedestrian position={[-30, 0, -6.6]} range={6} speed={0.9} phase={1} shirt="#a855f7" />
    </group>
  )
}
