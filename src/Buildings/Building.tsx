import { Billboard, Text } from '@react-three/drei'
import { useGame } from '../GameState'
import { useInteractable } from '../InteractionSystem'
import { doorPosition, type BuildingDef } from '../cityLayout'
import { INTERIOR_SPAWN } from '../Interiors/spawns'
import { buildingHasActiveCurriculum } from '../curriculum'
import type { BuildingId } from '../curriculum/types'

export function Building({ def }: { def: BuildingDef }) {
  const enterScene = useGame((s) => s.enterScene)
  const unlocked = useGame((s) => s.unlockedUnitNumber)
  const completed = useGame((s) => s.completedTopicIds)
  const learnHere =
    def.enterable &&
    buildingHasActiveCurriculum(def.id as BuildingId, unlocked, completed)

  const front = def.z + def.facing * (def.d / 2 + 0.02)
  const back = def.z - def.facing * (def.d / 2 + 0.02)
  const door = doorPosition(def)
  const left = def.x - def.w / 2 - 0.02
  const right = def.x + def.w / 2 + 0.02

  // Window grids on all four facades
  const floors = Math.max(1, Math.floor(def.h / 2.6))
  const cols = Math.max(2, Math.floor(def.w / 3))
  const sideCols = Math.max(1, Math.floor(def.d / 3.2))
  const windows: { x: number; y: number; z: number; rotY: number; size: [number, number] }[] = []
  for (let f = 0; f < floors; f++) {
    const wy = 2.2 + f * 2.6
    if (wy > def.h - 0.8) continue
    for (let c = 0; c < cols; c++) {
      const wx = def.x - def.w / 2 + (def.w / (cols + 1)) * (c + 1)
      windows.push({ x: wx, y: wy, z: front, rotY: 0, size: [1.1, 1.4] })
      windows.push({ x: wx, y: wy, z: back, rotY: Math.PI, size: [1.1, 1.4] })
    }
    for (let c = 0; c < sideCols; c++) {
      const wz = def.z - def.d / 2 + (def.d / (sideCols + 1)) * (c + 1)
      windows.push({ x: left, y: wy, z: wz, rotY: Math.PI / 2, size: [0.95, 1.25] })
      windows.push({ x: right, y: wy, z: wz, rotY: -Math.PI / 2, size: [0.95, 1.25] })
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
          emissive={learnHere ? def.signColor : '#000000'}
          emissiveIntensity={learnHere ? 0.22 : 0}
        />
      </mesh>

      {/* Facade trim / base course */}
      <mesh position={[def.x, 0.45, front + def.facing * 0.02]}>
        <boxGeometry args={[def.w + 0.15, 0.9, 0.12]} />
        <meshStandardMaterial color="#1f2937" roughness={0.7} />
      </mesh>

      {/* Corner pilasters */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[def.x + s * (def.w / 2 - 0.18), def.h / 2, front + def.facing * 0.04]}>
          <boxGeometry args={[0.28, def.h, 0.16]} />
          <meshStandardMaterial color="#111827" roughness={0.8} />
        </mesh>
      ))}

      {/* Roof cap + slight overhang */}
      <mesh position={[def.x, def.h + 0.15, def.z]}>
        <boxGeometry args={[def.w + 0.55, 0.3, def.d + 0.55]} />
        <meshStandardMaterial color="#2b3444" roughness={0.9} />
      </mesh>
      <mesh position={[def.x, def.h + 0.38, def.z]}>
        <boxGeometry args={[def.w * 0.55, 0.2, def.d * 0.45]} />
        <meshStandardMaterial color="#1e293b" metalness={0.2} roughness={0.7} />
      </mesh>

      {/* Awning over entrance */}
      {def.enterable && (
        <group>
          <mesh position={[door[0], 2.55, front + def.facing * 0.55]} rotation={[def.facing * 0.12, 0, 0]}>
            <boxGeometry args={[3.4, 0.08, 1.4]} />
            <meshStandardMaterial color={def.signColor} roughness={0.55} metalness={0.15} />
          </mesh>
          {[-1.4, 1.4].map((ox) => (
            <mesh key={ox} position={[door[0] + ox, 1.7, front + def.facing * 1.05]}>
              <cylinderGeometry args={[0.04, 0.04, 1.7, 8]} />
              <meshStandardMaterial color="#334155" metalness={0.5} />
            </mesh>
          ))}
        </group>
      )}

      {/* Windows */}
      {windows.map((w, i) => (
        <mesh key={i} position={[w.x, w.y, w.z]} rotation={[0, w.rotY, 0]}>
          <planeGeometry args={w.size} />
          <meshStandardMaterial
            color={def.glass ? '#bfe3ff' : '#8fb7d6'}
            emissive={learnHere ? def.signColor : '#3a5a72'}
            emissiveIntensity={learnHere ? 0.55 : 0.22}
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

      {/* Door frame + handle */}
      <mesh position={[door[0], 1.2, front + def.facing * 0.03]}>
        <planeGeometry args={[1.7, 2.4]} />
        <meshStandardMaterial
          color="#12181f"
          metalness={0.3}
          roughness={0.4}
          emissive={learnHere ? def.signColor : '#000000'}
          emissiveIntensity={learnHere ? 0.35 : 0}
        />
      </mesh>
      <mesh position={[door[0] + 0.55, 1.15, front + def.facing * 0.06]}>
        <boxGeometry args={[0.08, 0.22, 0.06]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.7} roughness={0.25} />
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

      {/* Entrance mat — brighter when this building hosts the next lesson */}
      {def.enterable && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[door[0], 0.03, door[2] + def.facing * 1.6]}>
          <planeGeometry args={[4, 3.2]} />
          <meshStandardMaterial
            color={def.signColor}
            emissive={def.signColor}
            emissiveIntensity={learnHere ? 0.85 : 0.4}
            transparent
            opacity={learnHere ? 0.85 : 0.6}
          />
        </mesh>
      )}

      {/* Tall floating label so the building is easy to find from anywhere */}
      <Billboard position={[def.x, def.h + 2.2, def.z]}>
        <Text fontSize={1.0} color={def.signColor} anchorX="center" anchorY="middle" outlineWidth={0.03} outlineColor="#05070c">
          {def.name}
        </Text>
      </Billboard>

      {learnHere && (
        <Billboard position={[def.x, def.h + 3.6, def.z]}>
          <Text
            fontSize={0.72}
            color="#f8fafc"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.04}
            outlineColor="#0ea5e9"
          >
            LEARN HERE
          </Text>
        </Billboard>
      )}

      {def.enterable && def.scene && (
        <DoorTrigger
          def={def}
          onEnter={() => enterScene(def.scene!, INTERIOR_SPAWN[def.scene as keyof typeof INTERIOR_SPAWN])}
        />
      )}
    </group>
  )
}

function DoorTrigger({ def, onEnter }: { def: BuildingDef; onEnter: () => void }) {
  const door = doorPosition(def)
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
