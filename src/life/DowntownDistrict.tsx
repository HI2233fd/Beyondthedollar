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
    <group position={[gateX + 8, 0, 0]}>
      {/* Silhouette towers — close enough to read from the east avenue */}
      {[
        { x: 2, z: -12, w: 7, d: 7, h: 18, c: '#3d4f66' },
        { x: 10, z: -6, w: 9, d: 8, h: 26, c: '#2f4054' },
        { x: 18, z: -14, w: 6, d: 6, h: 14, c: '#455a73' },
        { x: 4, z: 10, w: 8, d: 7, h: 20, c: '#364859' },
        { x: 14, z: 12, w: 10, d: 9, h: 30, c: '#2a3848' },
        { x: 22, z: 2, w: 7, d: 7, h: 16, c: '#3a5168' },
      ].map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, b.z]} castShadow receiveShadow>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshStandardMaterial
            color={b.c}
            roughness={0.55}
            metalness={0.25}
            transparent={!unlocked}
            opacity={unlocked ? 1 : 0.9}
          />
        </mesh>
      ))}

      <mesh position={[14, 18, 12]}>
        <boxGeometry args={[9.2, 16, 0.15]} />
        <meshStandardMaterial
          color="#7dd3fc"
          emissive="#38bdf8"
          emissiveIntensity={nightGlow(unlocked)}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Gate / billboard facing west into starter district */}
      <mesh position={[-6, 4.2, 0]} castShadow>
        <boxGeometry args={[1.4, 8.4, 16]} />
        <meshStandardMaterial color={unlocked ? '#1e3a2f' : '#1f2937'} />
      </mesh>
      <mesh position={[-6.8, 6.2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[10, 4]} />
        <meshStandardMaterial
          color="#0b1220"
          emissive={unlocked ? '#34d399' : '#fbbf24'}
          emissiveIntensity={0.55}
          side={2}
        />
      </mesh>
      <Text
        position={[-7.0, 6.8, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        fontSize={0.7}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={9}
        textAlign="center"
      >
        {unlocked ? 'DOWNTOWN\nOPEN' : `DOWNTOWN\nLOCKED · Lv ${DOWNTOWN_UNLOCK_LEVEL}`}
      </Text>
      {!unlocked && (
        <Text
          position={[-7.0, 5.4, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          fontSize={0.35}
          color="#fde68a"
          anchorX="center"
          anchorY="middle"
        >
          Keep living — XP unlocks the city
        </Text>
      )}
    </group>
  )
}

function nightGlow(unlocked: boolean) {
  return unlocked ? 0.55 : 0.25
}
