import { useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { normalizeAppearance, type CharacterLook } from './life/characterLook'

interface HumanoidProps {
  look?: Partial<CharacterLook>
  /** @deprecated prefer look */
  skin?: string
  shirt?: string
  pants?: string
  hair?: string
  face?: CharacterLook['face']
  walkRef?: MutableRefObject<number>
  movingRef?: MutableRefObject<boolean>
  anim?: 'idle' | 'walk' | 'talk' | 'phone'
}

/**
 * Stylized-realistic humanoid (proportions + facial features + clothing layers).
 * Shared by player + NPCs. Replaceable later with GLB without changing call sites.
 */
export function Humanoid({
  look: lookProp,
  skin,
  shirt,
  pants,
  hair,
  face,
  walkRef,
  movingRef,
  anim = 'idle',
}: HumanoidProps) {
  const look = normalizeAppearance({
    ...lookProp,
    skin: lookProp?.skin ?? skin,
    shirt: lookProp?.shirt ?? shirt,
    pants: lookProp?.pants ?? pants,
    hair: lookProp?.hair ?? hair,
    face: lookProp?.face ?? face,
  })

  const legL = useRef<Group>(null)
  const legR = useRef<Group>(null)
  const armL = useRef<Group>(null)
  const armR = useRef<Group>(null)
  const root = useRef<Group>(null)

  useFrame((_, dt) => {
    const moving = movingRef ? movingRef.current : anim === 'walk'
    const t = walkRef ? walkRef.current : performance.now() / 160
    const swing = moving ? Math.sin(t) * 0.55 : anim === 'talk' ? Math.sin(performance.now() / 200) * 0.08 : 0
    if (legL.current) legL.current.rotation.x = swing
    if (legR.current) legR.current.rotation.x = -swing
    if (armL.current) armL.current.rotation.x = moving ? -swing * 0.85 : anim === 'phone' ? -0.9 : swing * 0.2
    if (armR.current) armR.current.rotation.x = moving ? swing * 0.85 : anim === 'talk' ? 0.35 + Math.sin(performance.now() / 180) * 0.15 : -swing * 0.15
    if (root.current && !moving && anim === 'idle') {
      root.current.position.y = Math.sin(performance.now() / 500) * 0.008
    }
    void dt
  })

  const bodyScale =
    look.body === 'slim' ? [0.92, 1.02, 0.92] : look.body === 'athletic' ? [1.08, 1.02, 1.06] : look.body === 'plus' ? [1.12, 0.98, 1.1] : [1, 1, 1]
  const headScale = look.face === 'round' ? 1.1 : look.face === 'angular' ? 0.92 : look.face === 'oval' ? 1.04 : 1
  const shoulder = look.body === 'athletic' ? 0.36 : look.body === 'slim' ? 0.28 : 0.32

  return (
    <group ref={root} scale={bodyScale as [number, number, number]}>
      {/* Legs */}
      <group ref={legL} position={[-0.14, 0.92, 0]}>
        <mesh castShadow position={[0, -0.48, 0]}>
          <capsuleGeometry args={[0.105, 0.72, 8, 12]} />
          <meshStandardMaterial color={look.pants} roughness={0.78} />
        </mesh>
        <mesh castShadow position={[0, -0.9, 0.07]}>
          <boxGeometry args={[0.18, 0.1, 0.32]} />
          <meshStandardMaterial color={look.shoes} roughness={0.55} />
        </mesh>
      </group>
      <group ref={legR} position={[0.14, 0.92, 0]}>
        <mesh castShadow position={[0, -0.48, 0]}>
          <capsuleGeometry args={[0.105, 0.72, 8, 12]} />
          <meshStandardMaterial color={look.pants} roughness={0.78} />
        </mesh>
        <mesh castShadow position={[0, -0.9, 0.07]}>
          <boxGeometry args={[0.18, 0.1, 0.32]} />
          <meshStandardMaterial color={look.shoes} roughness={0.55} />
        </mesh>
      </group>

      {/* Hips / torso */}
      <mesh castShadow position={[0, 1.15, 0]}>
        <capsuleGeometry args={[0.2, 0.22, 8, 14]} />
        <meshStandardMaterial color={look.pants} roughness={0.75} />
      </mesh>
      <mesh castShadow position={[0, 1.38, 0]}>
        <capsuleGeometry args={[0.23, 0.42, 8, 16]} />
        <meshStandardMaterial color={look.shirt} roughness={0.62} />
      </mesh>

      {/* Jacket layer */}
      {look.jacket && (
        <mesh castShadow position={[0, 1.4, 0]}>
          <capsuleGeometry args={[0.255, 0.38, 8, 16]} />
          <meshStandardMaterial color={look.jacket} roughness={0.7} />
        </mesh>
      )}

      {/* Arms */}
      <group ref={armL} position={[-shoulder, 1.55, 0]}>
        <mesh castShadow position={[0, -0.34, 0]}>
          <capsuleGeometry args={[0.075, 0.52, 8, 10]} />
          <meshStandardMaterial color={look.jacket ?? look.shirt} />
        </mesh>
        <mesh castShadow position={[0, -0.68, 0]}>
          <sphereGeometry args={[0.075, 12, 12]} />
          <meshStandardMaterial color={look.skin} roughness={0.55} />
        </mesh>
      </group>
      <group ref={armR} position={[shoulder, 1.55, 0]}>
        <mesh castShadow position={[0, -0.34, 0]}>
          <capsuleGeometry args={[0.075, 0.52, 8, 10]} />
          <meshStandardMaterial color={look.jacket ?? look.shirt} />
        </mesh>
        <mesh castShadow position={[0, -0.68, 0]}>
          <sphereGeometry args={[0.075, 12, 12]} />
          <meshStandardMaterial color={look.skin} roughness={0.55} />
        </mesh>
        {anim === 'phone' && (
          <mesh position={[0.02, -0.55, 0.12]}>
            <boxGeometry args={[0.08, 0.14, 0.02]} />
            <meshStandardMaterial color="#0f172a" emissive="#38bdf8" emissiveIntensity={0.3} />
          </mesh>
        )}
      </group>

      {/* Neck + head */}
      <mesh castShadow position={[0, 1.68, 0]}>
        <cylinderGeometry args={[0.07, 0.08, 0.12, 12]} />
        <meshStandardMaterial color={look.skin} />
      </mesh>
      <group position={[0, 1.86, look.face === 'angular' ? 0.03 : 0]} scale={headScale}>
        <mesh castShadow>
          <sphereGeometry args={[0.155, 24, 24]} />
          <meshStandardMaterial color={look.skin} roughness={0.5} />
        </mesh>
        {/* Jaw soften */}
        <mesh castShadow position={[0, -0.08, 0.02]} scale={[0.85, 0.55, 0.8]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={look.skin} roughness={0.5} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.045, 0.02, 0.13]}>
          <sphereGeometry args={[0.028, 12, 12]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[0.045, 0.02, 0.13]}>
          <sphereGeometry args={[0.028, 12, 12]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[-0.045, 0.02, 0.15]}>
          <sphereGeometry args={[0.016, 10, 10]} />
          <meshStandardMaterial color={look.eyeColor} />
        </mesh>
        <mesh position={[0.045, 0.02, 0.15]}>
          <sphereGeometry args={[0.016, 10, 10]} />
          <meshStandardMaterial color={look.eyeColor} />
        </mesh>
        {/* Brows */}
        <mesh position={[-0.045, 0.055, 0.14]} rotation={[0, 0, look.brow === 'arched' ? 0.25 : 0]} scale={[1, look.brow === 'strong' ? 1.3 : 1, 1]}>
          <boxGeometry args={[0.05, 0.01, 0.015]} />
          <meshStandardMaterial color={look.hair} />
        </mesh>
        <mesh position={[0.045, 0.055, 0.14]} rotation={[0, 0, look.brow === 'arched' ? -0.25 : 0]} scale={[1, look.brow === 'strong' ? 1.3 : 1, 1]}>
          <boxGeometry args={[0.05, 0.01, 0.015]} />
          <meshStandardMaterial color={look.hair} />
        </mesh>
        {/* Nose */}
        <mesh position={[0, -0.01, 0.155]}>
          <sphereGeometry args={[0.022, 10, 10]} />
          <meshStandardMaterial color={look.skin} />
        </mesh>
        {/* Mouth */}
        <mesh position={[0, -0.055, 0.14]}>
          <boxGeometry args={[0.045, 0.012, 0.01]} />
          <meshStandardMaterial color="#a1625a" />
        </mesh>
      </group>

      <Hair look={look} />
      <Accessory look={look} />
    </group>
  )
}

function Hair({ look }: { look: CharacterLook }) {
  const c = look.hair
  if (look.hairStyle === 'bun') {
    return (
      <group>
        <mesh castShadow position={[0, 1.95, -0.02]}>
          <sphereGeometry args={[0.17, 18, 18, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color={c} roughness={0.85} />
        </mesh>
        <mesh castShadow position={[0, 2.08, -0.08]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color={c} />
        </mesh>
      </group>
    )
  }
  if (look.hairStyle === 'long') {
    return (
      <group>
        <mesh castShadow position={[0, 1.94, -0.02]}>
          <sphereGeometry args={[0.175, 18, 18, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
          <meshStandardMaterial color={c} roughness={0.85} />
        </mesh>
        <mesh castShadow position={[0, 1.55, -0.12]}>
          <capsuleGeometry args={[0.12, 0.35, 6, 10]} />
          <meshStandardMaterial color={c} roughness={0.9} />
        </mesh>
      </group>
    )
  }
  if (look.hairStyle === 'medium') {
    return (
      <mesh castShadow position={[0, 1.92, -0.01]}>
        <sphereGeometry args={[0.18, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
        <meshStandardMaterial color={c} roughness={0.85} />
      </mesh>
    )
  }
  if (look.hairStyle === 'fade') {
    return (
      <mesh castShadow position={[0, 1.97, -0.02]}>
        <sphereGeometry args={[0.155, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
        <meshStandardMaterial color={c} roughness={0.9} />
      </mesh>
    )
  }
  return (
    <mesh castShadow position={[0, 1.94, -0.02]}>
      <sphereGeometry args={[0.17, 18, 18, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
      <meshStandardMaterial color={c} roughness={0.85} />
    </mesh>
  )
}

function Accessory({ look }: { look: CharacterLook }) {
  if (look.accessory === 'glasses') {
    return (
      <group position={[0, 1.88, 0.14]}>
        <mesh position={[-0.05, 0, 0]}>
          <torusGeometry args={[0.035, 0.006, 8, 16]} />
          <meshStandardMaterial color="#111827" metalness={0.6} />
        </mesh>
        <mesh position={[0.05, 0, 0]}>
          <torusGeometry args={[0.035, 0.006, 8, 16]} />
          <meshStandardMaterial color="#111827" metalness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.04, 0.008, 0.008]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
      </group>
    )
  }
  if (look.accessory === 'hat') {
    return (
      <group position={[0, 2.02, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.16, 0.17, 0.12, 16]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.02, 16]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>
    )
  }
  if (look.accessory === 'earrings') {
    return (
      <group>
        <mesh position={[-0.15, 1.82, 0.02]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} />
        </mesh>
        <mesh position={[0.15, 1.82, 0.02]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} />
        </mesh>
      </group>
    )
  }
  return null
}
