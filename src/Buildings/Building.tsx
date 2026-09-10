import { Billboard, Text } from '@react-three/drei'
import { useGame } from '../GameState'
import { useInteractable } from '../InteractionSystem'
import { doorPosition, type BuildingDef } from '../cityLayout'
import { INTERIOR_SPAWN } from '../Interiors/spawns'

export function Building({ def }: { def: BuildingDef }) {
  const enterScene = useGame((s) => s.enterScene)
  const front = def.z + def.facing * (def.d / 2 + 0.02)
  const door = doorPosition(def)

  // Window grid on the front facade
  const floors = Math.max(1, Math.floor(def.h / 2.6))
  const cols = Math.max(2, Math.floor(def.w / 3))
  const windows: { x: number; y: number }[] = []
  for (let f = 0; f < floors; f++) {
    for (let c = 0; c < cols; c++) {
      const wx = def.x - def.w / 2 + (def.w / (cols + 1)) * (c + 1)
      const wy = 2.2 + f * 2.6
      if (wy > def.h - 0.8) continue
      windows.push({ x: wx, y: wy })
    }
  }

  return (
    <group>
      {/* Main structure */}
      <mesh castShadow receiveShadow position={[def.x, def.h / 2, def.z]}>
        <boxGeometry args={[def.w, def.h, def.d]} />
        <meshStandardMaterial
          color={def.color}
          roughness={def.glass ? 0.15 : 0.85}
          metalness={def.glass ? 0.6 : 0.05}
        />
      </mesh>

      {/* Roof cap */}
      <mesh position={[def.x, def.h + 0.15, def.z]}>
        <boxGeometry args={[def.w + 0.4, 0.3, def.d + 0.4]} />
        <meshStandardMaterial color="#2b3444" roughness={0.9} />
      </mesh>

      {/* Windows */}
      {windows.map((w, i) => (
        <mesh key={i} position={[w.x, w.y, front]}>
          <planeGeometry args={[1.1, 1.4]} />
          <meshStandardMaterial
            color={def.glass ? '#bfe3ff' : '#8fb7d6'}
            emissive="#3a5a72"
            emissiveIntensity={0.25}
            metalness={0.4}
            roughness={0.15}
          />
        </mesh>
      ))}

      {/* Ground-floor storefront glass around the door */}
      <mesh position={[def.x, 1.4, front]}>
        <planeGeometry args={[def.w - 1.2, 2.6]} />
        <meshStandardMaterial color="#26333f" metalness={0.5} roughness={0.1} transparent opacity={0.85} />
      </mesh>

      {/* Door frame */}
      <mesh position={[door[0], 1.2, front + def.facing * 0.03]}>
        <planeGeometry args={[1.7, 2.4]} />
        <meshStandardMaterial color="#12181f" metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Sign backing + text */}
      <mesh position={[def.x, def.h - 0.9, front + def.facing * 0.05]}>
        <planeGeometry args={[Math.min(def.w - 0.6, def.sign.length * 0.62 + 1.4), 1.1]} />
        <meshStandardMaterial color="#0f1620" />
      </mesh>
      <Text
        position={[def.x, def.h - 0.9, front + def.facing * 0.1]}
        rotation={[0, def.facing === 1 ? 0 : Math.PI, 0]}
        fontSize={0.62}
        color={def.signColor}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {def.sign}
      </Text>

      {/* Entrance mat to guide the player to the door */}
      {def.enterable && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[door[0], 0.03, door[2] + def.facing * 1.6]}>
          <planeGeometry args={[4, 3.2]} />
          <meshStandardMaterial color={def.signColor} emissive={def.signColor} emissiveIntensity={0.4} transparent opacity={0.6} />
        </mesh>
      )}

      {/* Tall floating label so the building is easy to find from anywhere */}
      <Billboard position={[def.x, def.h + 2.2, def.z]}>
        <Text fontSize={1.0} color={def.signColor} anchorX="center" anchorY="middle" outlineWidth={0.03} outlineColor="#05070c">
          {def.name}
        </Text>
      </Billboard>

      {def.enterable && def.scene && (
        <DoorTrigger def={def} onEnter={() => enterScene(def.scene!, INTERIOR_SPAWN[def.scene as 'bank'])} />
      )}
    </group>
  )
}

function DoorTrigger({ def, onEnter }: { def: BuildingDef; onEnter: () => void }) {
  const door = doorPosition(def)
  console.log(`DoorTrigger for ${def.name} at position:`, [door[0], 0, door[2] + def.facing * 1.5], 'radius:', 4)
  useInteractable({
    scene: 'city',
    position: [door[0], 0, door[2] + def.facing * 1.8],
    radius: 5,
    prompt: `Enter ${def.name}`,
    onInteract: onEnter,
    id: `door-${def.id}`,
  })
  return null
}
