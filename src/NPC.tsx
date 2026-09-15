import { Billboard, Text } from '@react-three/drei'
import { Humanoid } from './Humanoid'
import { useGame, type Dialogue, type SceneId } from './GameState'
import { useInteractable } from './InteractionSystem'

interface NPCProps {
  id: string
  scene: SceneId
  position: [number, number, number]
  rotation?: number
  name: string
  shirt?: string
  pants?: string
  skin?: string
  hair?: string
  getDialogue: () => Dialogue
}

export function NPC({
  id,
  scene,
  position,
  rotation = 0,
  name,
  shirt,
  pants,
  skin,
  hair,
  getDialogue,
}: NPCProps) {
  const openDialogue = useGame((s) => s.openDialogue)

  useInteractable({
    id: `npc-${id}`,
    scene,
    position,
    radius: 2.6,
    prompt: `Talk to ${name}`,
    onInteract: () => openDialogue(getDialogue()),
  })

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Humanoid shirt={shirt} pants={pants} skin={skin} hair={hair} />
      <Billboard position={[0, 2.35, 0]}>
        <Text fontSize={0.28} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.012} outlineColor="#0b0f19">
          {name}
        </Text>
      </Billboard>
    </group>
  )
}
