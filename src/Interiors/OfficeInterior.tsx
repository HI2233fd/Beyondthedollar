import { Room, InteriorExit } from './Room'
import { NPC } from '../NPC'
import { box } from '../collision'
import { useGame, type Dialogue } from '../GameState'

function officeDialogue(): Dialogue {
  const g = useGame.getState()
  const leave = { label: 'Leave', close: true as const }
  const menu = (): Dialogue => officeDialogue()

  if (g.hasJob) {
    return {
      name: 'Manager — Diane',
      text: 'Good to see you on the team! You’re our Office Assistant at $16/hour, 15 hours a week. Keep it up.',
      options: [leave],
    }
  }

  return {
    name: 'Manager — Diane',
    text: 'We’re currently hiring part-time employees. Would you like to apply?',
    options: [
      {
        label: 'Apply',
        action: () => useGame.getState().applyJob(),
        next: {
          name: 'Manager — Diane',
          text: 'Congratulations — you’re hired! You’re now an Office Assistant at $16/hour for 15 hours a week. Your weekly income is updated to $240.',
          options: [leave],
        },
      },
      {
        label: 'Ask about pay',
        next: {
          name: 'Manager — Diane',
          text: 'It’s $16 an hour, 15 hours a week — about $240 weekly before taxes. We review pay every six months.',
          options: [{ label: 'Back', next: menu() }, leave],
        },
      },
      {
        label: 'Ask about the job',
        next: {
          name: 'Manager — Diane',
          text: 'You’d handle filing, answering the phone, and helping the team stay organized. Flexible hours that work around school.',
          options: [{ label: 'Back', next: menu() }, leave],
        },
      },
      leave,
    ],
  }
}

export function OfficeInterior() {
  const deskPos: [number, number][] = [
    [-4, -2],
    [0, -2],
    [4, -2],
    [-4, 1.5],
    [4, 1.5],
  ]
  return (
    <Room
      w={16}
      d={14}
      h={4}
      floor="#3f4753"
      wall="#dfe6ee"
      extraBoxes={deskPos.map(([x, z]) => box(x, z, 2.2, 1.1))}
    >
      {/* Glass back wall accent */}
      <mesh position={[0, 2.2, -6.7]}>
        <planeGeometry args={[14, 3.4]} />
        <meshStandardMaterial color="#bfe3ff" metalness={0.5} roughness={0.1} transparent opacity={0.5} />
      </mesh>

      {deskPos.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          {/* desk */}
          <mesh position={[0, 0.75, 0]} castShadow>
            <boxGeometry args={[2.2, 0.1, 1.1]} />
            <meshStandardMaterial color="#e5e7eb" />
          </mesh>
          {[-0.95, 0.95].map((lx) => (
            <mesh key={lx} position={[lx, 0.37, 0]}>
              <boxGeometry args={[0.1, 0.75, 1]} />
              <meshStandardMaterial color="#9ca3af" />
            </mesh>
          ))}
          {/* monitor */}
          <mesh position={[0, 1.15, -0.3]} castShadow>
            <boxGeometry args={[0.9, 0.55, 0.06]} />
            <meshStandardMaterial color="#0b1220" emissive="#1e3a5f" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0, 0.86, -0.3]}>
            <boxGeometry args={[0.12, 0.16, 0.12]} />
            <meshStandardMaterial color="#374151" />
          </mesh>
          {/* office chair */}
          <group position={[0, 0, 0.9]}>
            <mesh position={[0, 0.5, 0]} castShadow>
              <boxGeometry args={[0.7, 0.14, 0.7]} />
              <meshStandardMaterial color="#111827" />
            </mesh>
            <mesh position={[0, 0.95, -0.32]}>
              <boxGeometry args={[0.7, 0.8, 0.12]} />
              <meshStandardMaterial color="#111827" />
            </mesh>
            <mesh position={[0, 0.22, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 0.44, 8]} />
              <meshStandardMaterial color="#4b5563" />
            </mesh>
          </group>
        </group>
      ))}

      <NPC
        id="office-manager"
        scene="office"
        position={[5.5, 0, -3.5]}
        rotation={-0.5}
        name="Diane"
        shirt="#b91c1c"
        pants="#1f2937"
        skin="#e0ac69"
        hair="#3b3b3b"
        getDialogue={officeDialogue}
      />

      <InteriorExit scene="office" />
    </Room>
  )
}
