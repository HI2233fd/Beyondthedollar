import { useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'

interface HumanoidProps {
  skin?: string
  shirt?: string
  pants?: string
  hair?: string
  walkRef?: MutableRefObject<number>
  movingRef?: MutableRefObject<boolean>
}

/**
 * A polished low-poly placeholder humanoid built from primitives.
 * If walkRef/movingRef are supplied, limbs swing while moving.
 */
export function Humanoid({
  skin = '#c9956b',
  shirt = '#3b82f6',
  pants = '#334155',
  hair = '#2b2320',
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

  return (
    <group>
      {/* Legs (pivot at hip ~0.9) */}
      <group ref={legL} position={[-0.13, 0.9, 0]}>
        <mesh castShadow position={[0, -0.45, 0]}>
          <capsuleGeometry args={[0.11, 0.7, 4, 8]} />
          <meshStandardMaterial color={pants} />
        </mesh>
        <mesh castShadow position={[0, -0.86, 0.06]}>
          <boxGeometry args={[0.16, 0.1, 0.28]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      </group>
      <group ref={legR} position={[0.13, 0.9, 0]}>
        <mesh castShadow position={[0, -0.45, 0]}>
          <capsuleGeometry args={[0.11, 0.7, 4, 8]} />
          <meshStandardMaterial color={pants} />
        </mesh>
        <mesh castShadow position={[0, -0.86, 0.06]}>
          <boxGeometry args={[0.16, 0.1, 0.28]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      </group>

      {/* Torso */}
      <mesh castShadow position={[0, 1.28, 0]}>
        <capsuleGeometry args={[0.22, 0.5, 4, 12]} />
        <meshStandardMaterial color={shirt} />
      </mesh>

      {/* Arms (pivot at shoulder ~1.5) */}
      <group ref={armL} position={[-0.32, 1.5, 0]}>
        <mesh castShadow position={[0, -0.32, 0]}>
          <capsuleGeometry args={[0.08, 0.55, 4, 8]} />
          <meshStandardMaterial color={shirt} />
        </mesh>
        <mesh castShadow position={[0, -0.66, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color={skin} />
        </mesh>
      </group>
      <group ref={armR} position={[0.32, 1.5, 0]}>
        <mesh castShadow position={[0, -0.32, 0]}>
          <capsuleGeometry args={[0.08, 0.55, 4, 8]} />
          <meshStandardMaterial color={shirt} />
        </mesh>
        <mesh castShadow position={[0, -0.66, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color={skin} />
        </mesh>
      </group>

      {/* Neck + head */}
      <mesh castShadow position={[0, 1.62, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.1, 8]} />
        <meshStandardMaterial color={skin} />
      </mesh>
      <mesh castShadow position={[0, 1.78, 0]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color={skin} />
      </mesh>
      {/* Hair */}
      <mesh castShadow position={[0, 1.85, -0.02]}>
        <sphereGeometry args={[0.17, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <meshStandardMaterial color={hair} />
      </mesh>
    </group>
  )
}
