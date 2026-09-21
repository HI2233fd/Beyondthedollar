import { Text } from '@react-three/drei'
import { useGame } from '../GameState'
import { WORLD_EAST_GATE } from '../cityLayout'
import { DOWNTOWN_UNLOCK_LEVEL } from './types'

/** Visible locked Downtown skyline east of the starter district. */
export function DowntownDistrict() {
  const lifeLevel = useGame((s) => s.lifeLevel)
  const unlocked = lifeLevel >= DOWNTOWN_UNLOCK_LEVEL
  const gateX = WORLD_EAST_GATE

  return (
    <group position={[gateX + 18, 0, 0]}>
      {/* Silhouette towers */}
      {[
        { x: -6, z: -14, w: 8, d: 8, h: 22, c: '#3d4f66' },
        { x: 4, z: -8, w: 10, d: 9, h: 28, c: '#2f4054' },
        { x: 14, z: -16, w: 7, d: 7, h: 18, c: '#455a73' },
        { x: -4, z: 10, w: 9, d: 8, h: 24, c: '#364859' },
        { x: 10, z: 14, w: 11, d: 10, h: 32, c: '#2a3848' },
        { x: 20, z: 2, w: 8, d: 8, h: 20, c: '#3a5168' },
      ].map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, b.z]} castShadow receiveShadow>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshStandardMaterial
            color={b.c}
            roughness={0.55}
            metalness={0.25}
            transparent={!unlocked}
            opacity={unlocked ? 1 : 0.85}
          />
        </mesh>
      ))}

      {/* Soft glass reflections on tallest */}
      <mesh position={[10, 20, 14]}>
        <boxGeometry args={[10.2, 18, 0.15]} />
        <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={nightGlow(unlocked)} transparent opacity={0.35} />
      </mesh>

      {/* Gate / billboard */}
      <mesh position={[-16, 4.2, 0]} castShadow>
        <boxGeometry args={[1.2, 8.4, 14]} />
        <meshStandardMaterial color={unlocked ? '#1e3a2f' : '#1f2937'} />
      </mesh>
      <mesh position={[-15.2, 6.5, 0]}>
        <planeGeometry args={[8, 3.2]} />
        <meshStandardMaterial color="#0b1220" emissive={unlocked ? '#34d399' : '#fbbf24'} emissiveIntensity={0.45} />
      </mesh>
      <Text
        position={[-14.9, 7.1, 0.1]}
        fontSize={0.55}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={7}
        textAlign="center"
      >
        {unlocked ? 'DOWNTOWN\nOPEN' : `DOWNTOWN\nLOCKED · Lv ${DOWNTOWN_UNLOCK_LEVEL}`}
      </Text>
      {!unlocked && (
        <Text position={[-14.9, 5.6, 0.1]} fontSize={0.32} color="#fde68a" anchorX="center" anchorY="middle">
          Keep living — XP unlocks the city
        </Text>
      )}
    </group>
  )
}

function nightGlow(unlocked: boolean) {
  return unlocked ? 0.55 : 0.25
}
