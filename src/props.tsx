import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
import { Humanoid } from './Humanoid'

export function Car({
  position,
  rotation = 0,
  color = '#9ca3af',
}: {
  position: [number, number, number]
  rotation?: number
  color?: string
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* body */}
      <mesh castShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[1.9, 0.6, 4.3]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* cabin */}
      <mesh castShadow position={[0, 1, -0.15]}>
        <boxGeometry args={[1.72, 0.6, 2.1]} />
        <meshStandardMaterial color="#111827" metalness={0.3} roughness={0.2} />
      </mesh>
      {/* windshield tint */}
      <mesh position={[0, 1.02, 0.9]}>
        <boxGeometry args={[1.66, 0.5, 0.05]} />
        <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.1} />
      </mesh>
      {/* wheels */}
      {([
        [-0.95, 0.32, 1.4],
        [0.95, 0.32, 1.4],
        [-0.95, 0.32, -1.4],
        [0.95, 0.32, -1.4],
      ] as [number, number, number][]).map((p, i) => (
        <mesh key={i} position={p} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.24, 16]} />
          <meshStandardMaterial color="#0b0f19" />
        </mesh>
      ))}
      {/* headlights */}
      <mesh position={[-0.6, 0.55, 2.16]}>
        <boxGeometry args={[0.4, 0.18, 0.05]} />
        <meshStandardMaterial color="#fde68a" emissive="#fde68a" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0.6, 0.55, 2.16]}>
        <boxGeometry args={[0.4, 0.18, 0.05]} />
        <meshStandardMaterial color="#fde68a" emissive="#fde68a" emissiveIntensity={0.4} />
      </mesh>
    </group>
  )
}

export function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.16, 0.22, 2.2, 8]} />
        <meshStandardMaterial color="#6b4f2a" />
      </mesh>
      <mesh castShadow position={[0, 2.7, 0]}>
        <icosahedronGeometry args={[1.15, 1]} />
        <meshStandardMaterial color="#3f7d44" flatShading />
      </mesh>
      <mesh castShadow position={[0.5, 3.3, 0.2]}>
        <icosahedronGeometry args={[0.8, 1]} />
        <meshStandardMaterial color="#4a8a4f" flatShading />
      </mesh>
      <mesh castShadow position={[-0.5, 3.1, -0.2]}>
        <icosahedronGeometry args={[0.75, 1]} />
        <meshStandardMaterial color="#356b3a" flatShading />
      </mesh>
    </group>
  )
}

export function Streetlight({
  position,
  night = false,
}: {
  position: [number, number, number]
  night?: boolean
}) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 2.4, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 4.8, 8]} />
        <meshStandardMaterial color="#3a4252" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0.55, 4.7, 0]}>
        <boxGeometry args={[1.1, 0.14, 0.14]} />
        <meshStandardMaterial color="#3a4252" metalness={0.6} />
      </mesh>
      <mesh position={[1.0, 4.55, 0]}>
        <boxGeometry args={[0.34, 0.16, 0.34]} />
        <meshStandardMaterial
          color="#fff7d6"
          emissive="#ffe9a8"
          emissiveIntensity={night ? 1.4 : 0.3}
        />
      </mesh>
      {night && <pointLight position={[1.0, 4.4, 0]} intensity={12} distance={12} color="#ffe9a8" />}
    </group>
  )
}

/** A static, non-interactive person to make interiors feel populated. */
export function Guest({
  position,
  rotation = 0,
  shirt = '#64748b',
  pants = '#1f2937',
  skin = '#c9956b',
  hair = '#2b2320',
}: {
  position: [number, number, number]
  rotation?: number
  shirt?: string
  pants?: string
  skin?: string
  hair?: string
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Humanoid shirt={shirt} pants={pants} skin={skin} hair={hair} />
    </group>
  )
}

export function Chair({
  position,
  rotation = 0,
  color = '#334155',
}: {
  position: [number, number, number]
  rotation?: number
  color?: string
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.6, 0.12, 0.6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.85, -0.26]}>
        <boxGeometry args={[0.6, 0.7, 0.1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {[
        [-0.24, 0.24],
        [0.24, 0.24],
        [-0.24, -0.24],
        [0.24, -0.24],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.2, z]}>
          <cylinderGeometry args={[0.035, 0.035, 0.4, 6]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
      ))}
    </group>
  )
}

export function Plant({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.26, 0.6, 10]} />
        <meshStandardMaterial color="#8b5e3c" />
      </mesh>
      <mesh position={[0, 1.0, 0]} castShadow>
        <icosahedronGeometry args={[0.7, 1]} />
        <meshStandardMaterial color="#3f7d44" flatShading />
      </mesh>
      <mesh position={[0.3, 1.35, 0.1]} castShadow>
        <icosahedronGeometry args={[0.45, 1]} />
        <meshStandardMaterial color="#4a8a4f" flatShading />
      </mesh>
    </group>
  )
}

export function Rug({
  position,
  size = [4, 3],
  color = '#8ba3c7',
}: {
  position: [number, number, number]
  size?: [number, number]
  color?: string
}) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={position} receiveShadow>
      <planeGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.95} />
    </mesh>
  )
}

export function WallClock({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.08, 20]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[0, 0.12, 0.05]}>
        <boxGeometry args={[0.04, 0.22, 0.02]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      <mesh position={[0.08, 0, 0.05]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.03, 0.3, 0.02]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
    </group>
  )
}

/** A pedestrian that paces back and forth along the Z axis. */
export function Pedestrian({
  position,
  range = 8,
  speed = 1.1,
  phase = 0,
  shirt = '#ef4444',
  pants = '#1f2937',
  skin = '#a9754f',
  hair = '#2b2320',
  axis = 'z',
}: {
  position: [number, number, number]
  range?: number
  speed?: number
  phase?: number
  shirt?: string
  pants?: string
  skin?: string
  hair?: string
  axis?: 'x' | 'z'
}) {
  const ref = useRef<Group>(null)
  const walk = useRef(phase)
  const moving = useRef(true)
  const t = useRef(phase)

  useFrame((_, delta) => {
    t.current += delta
    walk.current += delta * speed * 4
    const g = ref.current
    if (!g) return
    const offset = Math.sin(t.current * speed * 0.35) * range
    if (axis === 'x') {
      g.position.x = position[0] + offset
      const dir = Math.cos(t.current * speed * 0.35)
      g.rotation.y = dir >= 0 ? Math.PI / 2 : -Math.PI / 2
    } else {
      g.position.z = position[2] + offset
      const dir = Math.cos(t.current * speed * 0.35)
      g.rotation.y = dir >= 0 ? 0 : Math.PI
    }
  })

  return (
    <group ref={ref} position={position}>
      <Humanoid shirt={shirt} pants={pants} skin={skin} hair={hair} walkRef={walk} movingRef={moving} anim="walk" />
    </group>
  )
}

/** Traffic car that loops along the east-west avenue. */
export function TrafficCar({
  z = -2.2,
  speed = 6,
  phase = 0,
  color = '#64748b',
  minX = -52,
  maxX = 52,
}: {
  z?: number
  speed?: number
  phase?: number
  color?: string
  minX?: number
  maxX?: number
}) {
  const ref = useRef<Group>(null)
  const t = useRef(phase)

  useFrame((_, delta) => {
    t.current += delta
    const g = ref.current
    if (!g) return
    const span = maxX - minX
    const x = minX + ((t.current * speed + phase * 17) % span)
    g.position.x = x
    g.position.z = z
    g.rotation.y = Math.PI / 2
  })

  return (
    <group ref={ref}>
      <Car position={[0, 0, 0]} rotation={0} color={color} />
    </group>
  )
}

export function Bench({
  position,
  rotation = 0,
}: {
  position: [number, number, number]
  rotation?: number
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[1.4, 0.1, 0.45]} />
        <meshStandardMaterial color="#6b4f2a" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.7, -0.18]}>
        <boxGeometry args={[1.4, 0.45, 0.08]} />
        <meshStandardMaterial color="#5a4124" />
      </mesh>
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} position={[x, 0.22, 0]}>
          <boxGeometry args={[0.08, 0.44, 0.4]} />
          <meshStandardMaterial color="#374151" metalness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

export function Mailbox({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.45, 0.55, 0.28]} />
        <meshStandardMaterial color="#1d4ed8" metalness={0.35} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.44, 8]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0, 0.72, 0.16]}>
        <boxGeometry args={[0.28, 0.08, 0.04]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
    </group>
  )
}

export function Planter({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.36, 0.55, 10]} />
        <meshStandardMaterial color="#78716c" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.62, 0]} castShadow>
        <icosahedronGeometry args={[0.38, 1]} />
        <meshStandardMaterial color="#3f7d44" flatShading />
      </mesh>
      <mesh position={[0.18, 0.78, 0.08]} castShadow>
        <icosahedronGeometry args={[0.22, 1]} />
        <meshStandardMaterial color="#4a8a4f" flatShading />
      </mesh>
    </group>
  )
}
