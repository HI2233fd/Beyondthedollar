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

/** A pedestrian that paces back and forth along the Z axis. */
export function Pedestrian({
  position,
  range = 8,
  speed = 1.1,
  phase = 0,
  shirt = '#ef4444',
  pants = '#1f2937',
  skin = '#a9754f',
}: {
  position: [number, number, number]
  range?: number
  speed?: number
  phase?: number
  shirt?: string
  pants?: string
  skin?: string
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
    g.position.z = position[2] + offset
    // face direction of travel
    const dir = Math.cos(t.current * speed * 0.35)
    g.rotation.y = dir >= 0 ? 0 : Math.PI
  })

  return (
    <group ref={ref} position={position}>
      <Humanoid shirt={shirt} pants={pants} skin={skin} walkRef={walk} movingRef={moving} />
    </group>
  )
}
