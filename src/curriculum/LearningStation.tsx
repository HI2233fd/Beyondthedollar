import { Text } from '@react-three/drei'
import { useGame, type SceneId } from '../GameState'
import { useInteractable } from '../InteractionSystem'
import type { BuildingId } from './types'
import { nextAvailableTopicAtBuilding } from './index'

/**
 * Proximity learning station in building interiors.
 * Press E to open the next available lesson hosted by this building.
 */
export function LearningStation({
  buildingId,
  scene,
  position,
}: {
  buildingId: BuildingId
  scene: SceneId
  position: [number, number, number]
}) {
  const openLesson = useGame((s) => s.openLesson)
  const unlocked = useGame((s) => s.unlockedUnitNumber)
  const completed = useGame((s) => s.completedTopicIds)
  const next = nextAvailableTopicAtBuilding(buildingId, unlocked, completed)
  const active = !!next

  useInteractable({
    id: `learn-${buildingId}`,
    scene,
    position,
    radius: 2.4,
    prompt: active ? 'Start lesson' : 'Lessons complete here',
    onInteract: () => {
      if (next) openLesson(next.topic.lesson.id)
    },
  })

  return (
    <group position={position}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[1.1, 1.1, 0.7]} />
        <meshStandardMaterial
          color="#1e293b"
          emissive={active ? '#38bdf8' : '#0f172a'}
          emissiveIntensity={active ? 0.55 : 0.05}
        />
      </mesh>
      <mesh position={[0, 1.2, 0.05]}>
        <boxGeometry args={[0.85, 0.55, 0.08]} />
        <meshStandardMaterial
          color="#0b1220"
          emissive={active ? '#22d3ee' : '#334155'}
          emissiveIntensity={active ? 0.7 : 0.15}
        />
      </mesh>
      <Text position={[0, 1.85, 0]} fontSize={0.28} color={active ? '#7dd3fc' : '#94a3b8'} anchorX="center">
        {active ? 'LEARN' : 'DONE'}
      </Text>
    </group>
  )
}
