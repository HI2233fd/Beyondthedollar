import { Text } from '@react-three/drei'
import { useInteractable } from '../InteractionSystem'
import type { SceneId } from '../GameState'

/** Simple menu/kiosk prop — no new building geometry, just an interactable desk. */
export function KioskStation({
  id,
  scene,
  position,
  label,
  prompt,
  color = '#1e293b',
  emissive = '#38bdf8',
  onOpen,
}: {
  id: string
  scene: SceneId
  position: [number, number, number]
  label: string
  prompt: string
  color?: string
  emissive?: string
  onOpen: () => void
}) {
  useInteractable({
    id,
    scene,
    position,
    radius: 2.2,
    prompt,
    onInteract: onOpen,
  })

  return (
    <group position={position}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[1.0, 1.1, 0.65]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, 1.15, 0.08]}>
        <boxGeometry args={[0.75, 0.5, 0.06]} />
        <meshStandardMaterial color="#0b1220" emissive={emissive} emissiveIntensity={0.55} />
      </mesh>
      <Text position={[0, 1.75, 0]} fontSize={0.22} color="#e2e8f0" anchorX="center">
        {label}
      </Text>
    </group>
  )
}
