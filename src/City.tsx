import { useEffect, useMemo } from 'react'
import { Building } from './Buildings/Building'
import { Car, Streetlight, Tree, Pedestrian } from './props'
import { BUILDINGS, cityCollision, WORLD } from './cityLayout'
import { box } from './collision'
import { setActiveBoxes } from './world'

const ROAD_HALF = 4.5
const SIDEWALK_OUTER = 8
const NS_ROAD_HALF = 4.0

const PARKED_CARS: { x: number; z: number; color: string; rot?: number }[] = [
  // East-west curb — leave the center intersection clear for spawn/walking
  { x: -48, z: -3.5, color: '#c0392b' },
  { x: -34, z: -3.5, color: '#2c3e50' },
  { x: -20, z: -3.5, color: '#ecf0f1' },
  { x: 20, z: -3.5, color: '#7f8c8d' },
  { x: 34, z: -3.5, color: '#2980b9' },
  { x: 48, z: -3.5, color: '#27ae60' },
  { x: -48, z: 3.5, color: '#34495e' },
  { x: -34, z: 3.5, color: '#8e44ad' },
  { x: -20, z: 3.5, color: '#16a085' },
  { x: 20, z: 3.5, color: '#d35400' },
  { x: 34, z: 3.5, color: '#c0392b' },
  { x: 48, z: 3.5, color: '#2c3e50' },
  // north-south curb (away from z=0 intersection)
  { x: -3.4, z: -34, color: '#1abc9c', rot: 0 },
  { x: 3.4, z: -22, color: '#9b59b6', rot: 0 },
  { x: -3.4, z: 22, color: '#e67e22', rot: 0 },
  { x: 3.4, z: 34, color: '#3498db', rot: 0 },
]

export function City() {
  useEffect(() => {
    const carBoxes = PARKED_CARS.map((c) =>
      c.rot === 0 ? box(c.x, c.z, 2.0, 4.4) : box(c.x, c.z, 4.4, 2.0),
    )
    setActiveBoxes([...cityCollision(), ...carBoxes])
  }, [])

  const ewDashes = useMemo(() => {
    const arr: number[] = []
    for (let x = WORLD.minX + 2; x < WORLD.maxX; x += 4) arr.push(x)
    return arr
  }, [])

  const nsDashes = useMemo(() => {
    const arr: number[] = []
    for (let z = WORLD.minZ + 2; z < WORLD.maxZ; z += 4) arr.push(z)
    return arr
  }, [])

  const streetProps = useMemo(() => {
    const lights: { x: number; z: number }[] = []
    const trees: { x: number; z: number }[] = []
    for (let x = WORLD.minX + 6; x <= WORLD.maxX - 6; x += 14) {
      lights.push({ x, z: -SIDEWALK_OUTER + 0.6 })
      lights.push({ x: x + 7, z: SIDEWALK_OUTER - 0.6 })
      trees.push({ x: x + 3, z: -SIDEWALK_OUTER - 2.5 })
      trees.push({ x: x + 5, z: SIDEWALK_OUTER + 2.5 })
    }
    for (let z = WORLD.minZ + 8; z <= WORLD.maxZ - 8; z += 14) {
      lights.push({ x: -NS_ROAD_HALF - 3.2, z })
      lights.push({ x: NS_ROAD_HALF + 3.2, z: z + 7 })
      trees.push({ x: -NS_ROAD_HALF - 5, z: z + 2 })
      trees.push({ x: NS_ROAD_HALF + 5, z: z + 4 })
    }
    // pocket parks / corner greens
    for (const p of [
      [-48, -34],
      [48, -34],
      [-48, 34],
      [48, 34],
      [-50, 0],
      [50, 0],
    ] as [number, number][]) {
      trees.push({ x: p[0], z: p[1] })
      trees.push({ x: p[0] + 3, z: p[1] + 2 })
    }
    return { lights, trees }
  }, [])

  const worldW = WORLD.maxX - WORLD.minX + 4
  const worldD = WORLD.maxZ - WORLD.minZ + 4

  return (
    <group>
      {/* Grass base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[worldW + 24, worldD + 24]} />
        <meshStandardMaterial color="#3f5e3a" roughness={1} />
      </mesh>

      {/* East-west avenue */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[worldW, ROAD_HALF * 2]} />
        <meshStandardMaterial color="#2a2d33" roughness={0.95} />
      </mesh>

      {/* North-south cross street */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
        <planeGeometry args={[NS_ROAD_HALF * 2, worldD]} />
        <meshStandardMaterial color="#2a2d33" roughness={0.95} />
      </mesh>

      {/* EW sidewalks */}
      {[-1, 1].map((s) => (
        <mesh
          key={`ew-sw-${s}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.01, s * (ROAD_HALF + (SIDEWALK_OUTER - ROAD_HALF) / 2)]}
          receiveShadow
        >
          <planeGeometry args={[worldW, SIDEWALK_OUTER - ROAD_HALF]} />
          <meshStandardMaterial color="#9aa0a8" roughness={0.9} />
        </mesh>
      ))}

      {/* NS sidewalks */}
      {[-1, 1].map((s) => (
        <mesh
          key={`ns-sw-${s}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[s * (NS_ROAD_HALF + 2.2), 0.012, 0]}
          receiveShadow
        >
          <planeGeometry args={[3.2, worldD]} />
          <meshStandardMaterial color="#9aa0a8" roughness={0.9} />
        </mesh>
      ))}

      {/* Curbs EW */}
      {[-1, 1].map((s) => (
        <mesh key={`ew-curb-${s}`} position={[0, 0.08, s * ROAD_HALF]}>
          <boxGeometry args={[worldW, 0.16, 0.2]} />
          <meshStandardMaterial color="#c7ccd2" />
        </mesh>
      ))}
      {/* Curbs NS */}
      {[-1, 1].map((s) => (
        <mesh key={`ns-curb-${s}`} position={[s * NS_ROAD_HALF, 0.08, 0]}>
          <boxGeometry args={[0.2, 0.16, worldD]} />
          <meshStandardMaterial color="#c7ccd2" />
        </mesh>
      ))}

      {/* Center dashed lines */}
      {ewDashes.map((x) => (
        <mesh key={`ewd-${x}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02, 0]}>
          <planeGeometry args={[2, 0.18]} />
          <meshStandardMaterial color="#e9d27a" />
        </mesh>
      ))}
      {nsDashes.map((z) => (
        <mesh key={`nsd-${z}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.021, z]}>
          <planeGeometry args={[0.18, 2]} />
          <meshStandardMaterial color="#e9d27a" />
        </mesh>
      ))}

      {/* Crosswalks near enterable buildings */}
      {BUILDINGS.filter((b) => b.enterable).map((b) => (
        <group key={b.id}>
          {[-1.2, -0.6, 0, 0.6, 1.2].map((o) => (
            <mesh
              key={o}
              rotation={[-Math.PI / 2, 0, 0]}
              position={[b.x + o, 0.02, b.z + b.facing * (b.d / 2 + 2.2)]}
            >
              <planeGeometry args={[0.4, 3.2]} />
              <meshStandardMaterial color="#dfe3e8" />
            </mesh>
          ))}
        </group>
      ))}

      {/* Intersection crosswalks */}
      {[-1.2, -0.6, 0, 0.6, 1.2].map((o) => (
        <mesh key={`ix-n-${o}`} rotation={[-Math.PI / 2, 0, 0]} position={[o, 0.022, -6]}>
          <planeGeometry args={[0.4, 3.5]} />
          <meshStandardMaterial color="#dfe3e8" />
        </mesh>
      ))}
      {[-1.2, -0.6, 0, 0.6, 1.2].map((o) => (
        <mesh key={`ix-s-${o}`} rotation={[-Math.PI / 2, 0, 0]} position={[o, 0.022, 6]}>
          <planeGeometry args={[0.4, 3.5]} />
          <meshStandardMaterial color="#dfe3e8" />
        </mesh>
      ))}

      {BUILDINGS.map((b) => (
        <Building key={b.id} def={b} />
      ))}

      {PARKED_CARS.map((c, i) => (
        <Car
          key={i}
          position={[c.x, 0, c.z]}
          rotation={c.rot === 0 ? 0 : Math.PI / 2}
          color={c.color}
        />
      ))}

      {streetProps.lights.map((l, i) => (
        <Streetlight key={`l${i}`} position={[l.x, 0, l.z]} />
      ))}
      {streetProps.trees.map((t, i) => (
        <Tree key={`t${i}`} position={[t.x, 0, t.z]} />
      ))}

      <Pedestrian position={[-20, 0, 6.5]} range={14} speed={1.0} phase={0} shirt="#ef4444" />
      <Pedestrian position={[14, 0, -6.6]} range={16} speed={0.8} phase={2} shirt="#22c55e" pants="#374151" />
      <Pedestrian position={[36, 0, 6.4]} range={10} speed={1.2} phase={4} shirt="#eab308" pants="#3f3f46" skin="#8d5a3c" />
      <Pedestrian position={[-42, 0, -6.6]} range={12} speed={0.9} phase={1} shirt="#a855f7" />
      <Pedestrian position={[6.5, 0, -20]} range={14} speed={1.05} phase={3} shirt="#38bdf8" />
      <Pedestrian position={[-6.5, 0, 18]} range={12} speed={0.85} phase={5} shirt="#f472b6" pants="#1f2937" />
    </group>
  )
}
