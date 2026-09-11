import { useEffect, type ReactNode } from 'react'
import { box, type AABB } from '../collision'
import { setActiveBoxes } from '../world'
import { BUILDINGS, exitSpawn } from '../cityLayout'
import { useGame, type SceneId } from '../GameState'
import { useInteractable } from '../InteractionSystem'
import { Text } from '@react-three/drei'

const WALL_T = 0.4

export function Room({
  w,
  d,
  h = 4,
  floor = '#c9c3b8',
  wall = '#e9e7e2',
  extraBoxes = [],
  children,
}: {
  w: number
  d: number
  h?: number
  floor?: string
  wall?: string
  extraBoxes?: AABB[]
  children?: ReactNode
}) {
  const hw = w / 2
  const hd = d / 2

  useEffect(() => {
    const walls: AABB[] = [
      box(0, -hd, w, WALL_T), // back
      box(-hw, 0, WALL_T, d), // left
      box(hw, 0, WALL_T, d), // right
      box(0, hd, w, WALL_T), // front (solid; exit via E)
    ]
    setActiveBoxes([...walls, ...extraBoxes])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w, d])

  return (
    <group>
      <ambientLight intensity={0.7} />
      <pointLight position={[0, h - 0.4, -hd / 2]} intensity={30} distance={30} color="#fff4e0" />
      <pointLight position={[0, h - 0.4, hd / 2]} intensity={24} distance={28} color="#fff4e0" />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color={floor} roughness={0.85} />
      </mesh>
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, h, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#f4f2ee" side={2} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, h / 2, -hd]} receiveShadow>
        <boxGeometry args={[w, h, WALL_T]} />
        <meshStandardMaterial color={wall} />
      </mesh>
      {/* Side walls */}
      <mesh position={[-hw, h / 2, 0]} receiveShadow>
        <boxGeometry args={[WALL_T, h, d]} />
        <meshStandardMaterial color={wall} />
      </mesh>
      <mesh position={[hw, h / 2, 0]} receiveShadow>
        <boxGeometry args={[WALL_T, h, d]} />
        <meshStandardMaterial color={wall} />
      </mesh>
      {/* Front wall with a doorway gap in the center */}
      <mesh position={[-(hw / 2) - 0.6, h / 2, hd]}>
        <boxGeometry args={[w - 2.4, h, WALL_T]} />
        <meshStandardMaterial color={wall} />
      </mesh>
      <mesh position={[(hw / 2) + 0.6, h / 2, hd]}>
        <boxGeometry args={[w - 2.4, h, WALL_T]} />
        <meshStandardMaterial color={wall} />
      </mesh>
      <mesh position={[0, h - 0.6, hd]}>
        <boxGeometry args={[2.6, 1.2, WALL_T]} />
        <meshStandardMaterial color={wall} />
      </mesh>

      {children}
    </group>
  )
}

export function InteriorExit({ scene }: { scene: SceneId }) {
  const enterScene = useGame((s) => s.enterScene)
  const building = BUILDINGS.find((b) => b.scene === scene)!
  useInteractable({
    id: `exit-${scene}`,
    scene,
    position: [0, 0, 5.3],
    radius: 3,
    prompt: 'Exit to street',
    onInteract: () => enterScene('city', exitSpawn(building)),
  })
  return (
    <group>
      {/* Glowing exit mat on the floor by the doorway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 5.3]}>
        <planeGeometry args={[2.6, 2.2]} />
        <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={0.5} transparent opacity={0.5} />
      </mesh>
      {/* EXIT sign above the doorway */}
      <Text position={[0, 3.1, 6.2]} rotation={[0, Math.PI, 0]} fontSize={0.5} color="#34d399" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#05221a">
        EXIT ↓
      </Text>
    </group>
  )
}
