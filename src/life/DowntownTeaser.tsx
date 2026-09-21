import { Text } from '@react-three/drei'
import { useGame } from '../GameState'
import { DOWNTOWN_UNLOCK_LEVEL } from './types'

/** In-district billboard so the Downtown lock is obvious while walking the avenue. */
export function DowntownTeaser() {
  const lifeLevel = useGame((s) => s.lifeLevel)
  const unlocked = lifeLevel >= DOWNTOWN_UNLOCK_LEVEL
  if (unlocked) return null

  return (
    <group position={[48, 0, -8]}>
      <mesh position={[0, 3.2, 0]} castShadow>
        <boxGeometry args={[0.35, 6.4, 0.35]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0, 6.6, 0]} rotation={[0, -0.4, 0]}>
        <planeGeometry args={[7.5, 3.2]} />
        <meshStandardMaterial color="#0b1220" emissive="#f59e0b" emissiveIntensity={0.55} side={2} />
      </mesh>
      <Text
        position={[0, 7.0, 0.05]}
        rotation={[0, -0.4, 0]}
        fontSize={0.48}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={7}
        textAlign="center"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {`DOWNTOWN LOCKED\nLife Level ${DOWNTOWN_UNLOCK_LEVEL} required`}
      </Text>
      <Text
        position={[0, 5.9, 0.05]}
        rotation={[0, -0.4, 0]}
        fontSize={0.28}
        color="#fde68a"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.015}
        outlineColor="#000000"
      >
        Skyline ahead — keep living to unlock
      </Text>
    </group>
  )
}
