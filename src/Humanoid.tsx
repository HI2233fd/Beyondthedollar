import { useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { normalizeAppearance, type CharacterLook } from './life/characterLook'

export type HumanAnim = 'idle' | 'walk' | 'jog' | 'talk' | 'sit' | 'reach' | 'pickup' | 'phone'

interface HumanoidProps {
  look?: Partial<CharacterLook>
  skin?: string
  shirt?: string
  pants?: string
  hair?: string
  face?: CharacterLook['face']
  walkRef?: MutableRefObject<number>
  movingRef?: MutableRefObject<boolean>
  anim?: HumanAnim
  animRef?: MutableRefObject<HumanAnim>
}

const HEIGHT_SCALE: Record<CharacterLook['height'], number> = {
  short: 0.94,
  average: 1,
  tall: 1.07,
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/**
 * Stylized humanoid built in-engine.
 * The Codex glTF set (Superhero_Male_FullBody, simpleparted/buzzed/long/buns, Idle_Loop and the
 * other named clips) is not in this repository. This mesh is the stand-in: separate limbs, hair
 * parented to the head, and the same animation states crossfaded over ~0.2s.
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
  animRef,
}: HumanoidProps) {
  const look = normalizeAppearance({
    ...lookProp,
    skin: lookProp?.skin ?? skin,
    shirt: lookProp?.shirt ?? shirt,
    pants: lookProp?.pants ?? pants,
    hair: lookProp?.hair ?? hair,
    face: lookProp?.face ?? face,
  })

  const thighL = useRef<Group>(null)
  const thighR = useRef<Group>(null)
  const calfL = useRef<Group>(null)
  const calfR = useRef<Group>(null)
  const armL = useRef<Group>(null)
  const armR = useRef<Group>(null)
  const foreL = useRef<Group>(null)
  const foreR = useRef<Group>(null)
  const root = useRef<Group>(null)
  const chest = useRef<Group>(null)
  const pose = useRef({
    thigh: 0,
    calf: 0,
    arm: 0,
    fore: 0,
    waist: 0,
    breath: 0,
  })

  useFrame((_, dt) => {
    const step = Math.min(dt, 0.05)
    const mode: HumanAnim = animRef?.current ?? (movingRef?.current ? 'walk' : anim)
    const moving = mode === 'walk' || mode === 'jog'
    const t = walkRef ? walkRef.current : performance.now() / 180
    const swing = moving ? Math.sin(t) : 0
    const amp = mode === 'jog' ? 0.85 : mode === 'walk' ? 0.55 : 0
    const reduced = prefersReducedMotion()
    const blend = reduced ? 1 : 1 - Math.exp(-step / 0.2)

    let thigh = swing * amp
    let calf = Math.max(0, -swing) * amp * 0.85
    let arm = -swing * amp * 0.9
    let fore = moving ? 0.25 : 0.15
    let waist = 0
    if (mode === 'talk') {
      thigh = 0
      calf = 0
      arm = 0.35 + Math.sin(t * 1.4) * 0.18
      fore = 0.8
    } else if (mode === 'sit') {
      thigh = -1.25
      calf = 1.35
      arm = 0.15
      fore = 0.4
    } else if (mode === 'reach') {
      thigh = 0
      arm = -1.15
      fore = 0.15
    } else if (mode === 'pickup') {
      thigh = -0.45
      calf = 0.7
      waist = 0.7
      arm = -0.9
      fore = 0.5
    } else if (mode === 'phone') {
      arm = -0.9
      fore = 1.2
    } else if (!moving) {
      thigh = 0
      calf = 0
      arm = Math.sin(t * 0.35) * 0.04
      fore = 0.12
    }

    const p = pose.current
    p.thigh += (thigh - p.thigh) * blend
    p.calf += (calf - p.calf) * blend
    p.arm += (arm - p.arm) * blend
    p.fore += (fore - p.fore) * blend
    p.waist += (waist - p.waist) * blend
    const breathTarget = !moving && mode === 'idle' && !reduced ? Math.sin(performance.now() / 520) * 0.012 : 0
    p.breath += (breathTarget - p.breath) * blend

    if (thighL.current) thighL.current.rotation.x = p.thigh
    if (thighR.current) thighR.current.rotation.x = -p.thigh
    if (calfL.current) calfL.current.rotation.x = p.calf
    if (calfR.current) calfR.current.rotation.x = p.calf
    if (armL.current) armL.current.rotation.x = mode === 'talk' || mode === 'phone' || mode === 'reach' ? p.arm * 0.25 : -p.arm
    if (armR.current) armR.current.rotation.x = p.arm
    if (foreL.current) foreL.current.rotation.x = p.fore
    if (foreR.current) foreR.current.rotation.x = mode === 'talk' || mode === 'reach' || mode === 'phone' ? p.fore : p.fore * 0.5
    if (root.current) root.current.rotation.x = p.waist
    if (chest.current) chest.current.scale.y = 1 + p.breath
  })

  const bodyScale =
    look.body === 'slim' ? 0.92 : look.body === 'athletic' ? 1.08 : look.body === 'plus' ? 1.12 : 1
  const headScale = look.face === 'round' ? 1.08 : look.face === 'angular' ? 0.94 : look.face === 'oval' ? 1.03 : 1
  const shoulder = look.body === 'athletic' ? 0.24 : look.body === 'slim' ? 0.19 : 0.22
  const h = HEIGHT_SCALE[look.height]
  const top = look.jacket ?? look.shirt

  return (
    <group scale={h}>
      <group ref={root}>
        <group ref={thighL} position={[-0.11, 0.86, 0]}>
          <mesh castShadow position={[0, -0.2, 0]}>
            <capsuleGeometry args={[0.075, 0.28, 6, 8]} />
            <meshStandardMaterial color={look.pants} roughness={0.78} />
          </mesh>
          <group ref={calfL} position={[0, -0.38, 0]}>
            <mesh castShadow position={[0, -0.18, 0]}>
              <capsuleGeometry args={[0.06, 0.26, 6, 8]} />
              <meshStandardMaterial color={look.pants} roughness={0.78} />
            </mesh>
            <mesh castShadow position={[0, -0.36, 0.05]}>
              <boxGeometry args={[0.12, 0.07, 0.24]} />
              <meshStandardMaterial color={look.shoes} roughness={0.55} />
            </mesh>
          </group>
        </group>
        <group ref={thighR} position={[0.11, 0.86, 0]}>
          <mesh castShadow position={[0, -0.2, 0]}>
            <capsuleGeometry args={[0.075, 0.28, 6, 8]} />
            <meshStandardMaterial color={look.pants} roughness={0.78} />
          </mesh>
          <group ref={calfR} position={[0, -0.38, 0]}>
            <mesh castShadow position={[0, -0.18, 0]}>
              <capsuleGeometry args={[0.06, 0.26, 6, 8]} />
              <meshStandardMaterial color={look.pants} roughness={0.78} />
            </mesh>
            <mesh castShadow position={[0, -0.36, 0.05]}>
              <boxGeometry args={[0.12, 0.07, 0.24]} />
              <meshStandardMaterial color={look.shoes} roughness={0.55} />
            </mesh>
          </group>
        </group>

        <mesh castShadow position={[0, 0.96, 0]} scale={[bodyScale, 1, bodyScale]}>
          <capsuleGeometry args={[0.15, 0.16, 6, 10]} />
          <meshStandardMaterial color={look.pants} roughness={0.75} />
        </mesh>
        <group ref={chest} position={[0, 1.22, 0]} scale={[bodyScale, 1, bodyScale]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.18, 0.32, 6, 12]} />
            <meshStandardMaterial color={top} roughness={0.62} />
          </mesh>
        </group>

        <group ref={armL} position={[-shoulder * bodyScale, 1.38, 0]}>
          <mesh castShadow position={[0, -0.16, 0]}>
            <capsuleGeometry args={[0.05, 0.2, 5, 8]} />
            <meshStandardMaterial color={top} />
          </mesh>
          <group ref={foreL} position={[0, -0.32, 0]}>
            <mesh castShadow position={[0, -0.14, 0]}>
              <capsuleGeometry args={[0.042, 0.18, 5, 8]} />
              <meshStandardMaterial color={look.skin} roughness={0.55} />
            </mesh>
            <mesh castShadow position={[0, -0.28, 0]}>
              <sphereGeometry args={[0.05, 10, 10]} />
              <meshStandardMaterial color={look.skin} roughness={0.55} />
            </mesh>
          </group>
        </group>
        <group ref={armR} position={[shoulder * bodyScale, 1.38, 0]}>
          <mesh castShadow position={[0, -0.16, 0]}>
            <capsuleGeometry args={[0.05, 0.2, 5, 8]} />
            <meshStandardMaterial color={top} />
          </mesh>
          <group ref={foreR} position={[0, -0.32, 0]}>
            <mesh castShadow position={[0, -0.14, 0]}>
              <capsuleGeometry args={[0.042, 0.18, 5, 8]} />
              <meshStandardMaterial color={look.skin} roughness={0.55} />
            </mesh>
            <mesh castShadow position={[0, -0.28, 0]}>
              <sphereGeometry args={[0.05, 10, 10]} />
              <meshStandardMaterial color={look.skin} roughness={0.55} />
            </mesh>
            {anim === 'phone' && (
              <mesh position={[0.02, -0.22, 0.06]}>
                <boxGeometry args={[0.06, 0.1, 0.015]} />
                <meshStandardMaterial color="#0f172a" emissive="#38bdf8" emissiveIntensity={0.3} />
              </mesh>
            )}
          </group>
        </group>

        <mesh castShadow position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.05, 0.06, 0.1, 10]} />
          <meshStandardMaterial color={look.skin} />
        </mesh>
        <group position={[0, 1.64, 0]} scale={headScale}>
          <mesh castShadow>
            <sphereGeometry args={[0.13, 20, 20]} />
            <meshStandardMaterial color={look.skin} roughness={0.5} />
          </mesh>
          <mesh position={[-0.12, 0, 0]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color={look.skin} />
          </mesh>
          <mesh position={[0.12, 0, 0]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color={look.skin} />
          </mesh>
          <mesh position={[-0.04, 0.02, 0.11]}>
            <sphereGeometry args={[0.022, 10, 10]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[0.04, 0.02, 0.11]}>
            <sphereGeometry args={[0.022, 10, 10]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[-0.04, 0.02, 0.125]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshStandardMaterial color={look.eyeColor} />
          </mesh>
          <mesh position={[0.04, 0.02, 0.125]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshStandardMaterial color={look.eyeColor} />
          </mesh>
          <mesh position={[-0.04, 0.05, 0.115]} rotation={[0, 0, look.brow === 'arched' ? 0.3 : 0.08]}>
            <boxGeometry args={[0.04, 0.008, 0.01]} />
            <meshStandardMaterial color={look.hair} />
          </mesh>
          <mesh position={[0.04, 0.05, 0.115]} rotation={[0, 0, look.brow === 'arched' ? -0.3 : -0.08]}>
            <boxGeometry args={[0.04, 0.008, 0.01]} />
            <meshStandardMaterial color={look.hair} />
          </mesh>
          <mesh position={[0, -0.01, 0.125]}>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshStandardMaterial color={look.skin} />
          </mesh>
          <mesh position={[0, -0.045, 0.115]}>
            <boxGeometry args={[0.04, 0.01, 0.01]} />
            <meshStandardMaterial color="#a1625a" />
          </mesh>
          <Hair look={look} />
          <Accessory look={look} />
        </group>
      </group>
    </group>
  )
}

function Hair({ look }: { look: CharacterLook }) {
  const c = look.hair
  const style = look.hairStyle
  if (style === 'buns' || style === 'bun') {
    return (
      <group>
        <mesh castShadow position={[0, 0.08, -0.02]}>
          <sphereGeometry args={[0.135, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color={c} roughness={0.85} />
        </mesh>
        <mesh castShadow position={[-0.1, 0.12, -0.02]}>
          <sphereGeometry args={[0.055, 10, 10]} />
          <meshStandardMaterial color={c} />
        </mesh>
        <mesh castShadow position={[0.1, 0.12, -0.02]}>
          <sphereGeometry args={[0.055, 10, 10]} />
          <meshStandardMaterial color={c} />
        </mesh>
      </group>
    )
  }
  if (style === 'long') {
    return (
      <group>
        <mesh castShadow position={[0, 0.07, -0.02]}>
          <sphereGeometry args={[0.145, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
          <meshStandardMaterial color={c} roughness={0.85} />
        </mesh>
        <mesh castShadow position={[0, -0.12, -0.06]}>
          <capsuleGeometry args={[0.09, 0.22, 4, 8]} />
          <meshStandardMaterial color={c} roughness={0.9} />
        </mesh>
      </group>
    )
  }
  if (style === 'buzz' || style === 'fade') {
    return (
      <mesh castShadow position={[0, 0.09, -0.01]}>
        <sphereGeometry args={[0.132, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
        <meshStandardMaterial color={c} roughness={0.9} />
      </mesh>
    )
  }
  return (
    <group>
      <mesh castShadow position={[0.02, 0.09, -0.01]}>
        <sphereGeometry args={[0.14, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color={c} roughness={0.85} />
      </mesh>
      <mesh castShadow position={[0.06, 0.12, 0.04]} rotation={[0.2, 0, -0.4]}>
        <boxGeometry args={[0.08, 0.02, 0.06]} />
        <meshStandardMaterial color={c} />
      </mesh>
    </group>
  )
}

function Accessory({ look }: { look: CharacterLook }) {
  if (look.accessory === 'glasses') {
    return (
      <group position={[0, 0.02, 0.12]}>
        <mesh position={[-0.042, 0, 0]}>
          <torusGeometry args={[0.028, 0.005, 6, 12]} />
          <meshStandardMaterial color="#111827" metalness={0.6} />
        </mesh>
        <mesh position={[0.042, 0, 0]}>
          <torusGeometry args={[0.028, 0.005, 6, 12]} />
          <meshStandardMaterial color="#111827" metalness={0.6} />
        </mesh>
      </group>
    )
  }
  if (look.accessory === 'hat') {
    return (
      <group position={[0, 0.16, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.13, 0.14, 0.1, 12]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.015, 12]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>
    )
  }
  if (look.accessory === 'earrings') {
    return (
      <group>
        <mesh position={[-0.125, -0.02, 0.02]}>
          <sphereGeometry args={[0.014, 8, 8]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} />
        </mesh>
        <mesh position={[0.125, -0.02, 0.02]}>
          <sphereGeometry args={[0.014, 8, 8]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} />
        </mesh>
      </group>
    )
  }
  return null
}
