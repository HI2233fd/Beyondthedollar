import { useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'

interface HumanoidProps {
  skin?: string
  shirt?: string
  pants?: string
  hair?: string
  face?: 'soft' | 'angular' | 'round'
  walkRef?: MutableRefObject<number>
  movingRef?: MutableRefObject<boolean>
}

/**
 * Stylized humanoid with believable proportions (capsule limbs + facial cues).
 * Replaceable later with GLB characters without changing call sites.
 */
export function Humanoid({
  skin = '#c9956b',
  shirt = '#3b82f6',
  pants = '#334155',
  hair = '#2b2320',
  face = 'soft',
  walkRef,
  movingRef,
}: HumanoidProps) {
  const legL = useRef<Group>(null)
  const legR = useRef<Group>(null)
  const armL = useRef<Group>(null)
  const armR = useRef<Group>(null)

  useFrame(() => {
    if (!walkRef) return
    const moving = movingRef ? movingRef.current : true
    const swing = moving ? Math.sin(walkRef.current) * 0.6 : 0
    if (legL.current) legL.current.rotation.x = swing
    if (legR.current) legR.current.rotation.x = -swing
    if (armL.current) armL.current.rotation.x = -swing * 0.8
    if (armR.current) armR.current.rotation.x = swing * 0.8
  })

  const headScale = face === 'round' ? 1.08 : face === 'angular' ? 0.94 : 1
  const jawZ = face === 'angular' ? 0.04 : 0

  return (
    <group>
      {/* Legs (pivot at hip ~0.9) */}
      <group ref={legL} position={[-0.13, 0.9, 0]}>
        <mesh castShadow position={[0, -0.45, 0]}>
          <capsuleGeometry args={[0.11, 0.7, 6, 10]} />
          <meshStandardMaterial color={pants} roughness={0.75} />
        </mesh>
        <mesh castShadow position={[0, -0.86, 0.06]}>
          <boxGeometry args={[0.16, 0.1, 0.28]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      </group>
      <group ref={legR} position={[0.13, 0.9, 0]}>
        <mesh castShadow position={[0, -0.45, 0]}>
          <capsuleGeometry args={[0.11, 0.7, 6, 10]} />
          <meshStandardMaterial color={pants} roughness={0.75} />
        </mesh>
        <mesh castShadow position={[0, -0.86, 0.06]}>
          <boxGeometry args={[0.16, 0.1, 0.28]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      </group>

      {/* Torso */}
      <mesh castShadow position={[0, 1.28, 0]}>
        <capsuleGeometry args={[0.22, 0.5, 6, 14]} />
        <meshStandardMaterial color={shirt} roughness={0.65} />
      </mesh>

      {/* Arms (pivot at shoulder ~1.5) */}
      <group ref={armL} position={[-0.32, 1.5, 0]}>
        <mesh castShadow position={[0, -0.32, 0]}>
          <capsuleGeometry args={[0.08, 0.55, 6, 10]} />
          <meshStandardMaterial color={shirt} />
        </mesh>
        <mesh castShadow position={[0, -0.66, 0]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color={skin} />
        </mesh>
      </group>
      <group ref={armR} position={[0.32, 1.5, 0]}>
        <mesh castShadow position={[0, -0.32, 0]}>
          <capsuleGeometry args={[0.08, 0.55, 6, 10]} />
          <meshStandardMaterial color={shirt} />
        </mesh>
        <mesh castShadow position={[0, -0.66, 0]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color={skin} />
        </mesh>
      </group>

      {/* Neck + head */}
      <mesh castShadow position={[0, 1.62, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.1, 10]} />
        <meshStandardMaterial color={skin} />
      </mesh>
      <group position={[0, 1.78, jawZ]} scale={headScale}>
        <mesh castShadow>
          <sphereGeometry args={[0.16, 20, 20]} />
          <meshStandardMaterial color={skin} roughness={0.55} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.05, 0.02, 0.13]}>
          <sphereGeometry args={[0.025, 10, 10]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0.05, 0.02, 0.13]}>
          <sphereGeometry args={[0.025, 10, 10]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        {/* Soft brow / nose cue */}
        <mesh position={[0, -0.01, 0.145]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial color={skin} />
        </mesh>
      </group>
      {/* Hair */}
      <mesh castShadow position={[0, 1.85, -0.02]}>
        <sphereGeometry args={[0.17, 18, 18, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <meshStandardMaterial color={hair} roughness={0.85} />
      </mesh>
    </group>
  )
}
