import { Room, InteriorExit } from './Room'
import { NPC } from '../NPC'
import { Guest, Chair, Plant, Rug, WallClock } from '../props'
import { box } from '../collision'
import { useGame, type Dialogue } from '../GameState'
import { LearningStation } from '../curriculum/LearningStation'

function bankDialogue(): Dialogue {
  const g = useGame.getState()
  const leave = { label: 'Leave', close: true as const }
  return {
    name: 'Bank Teller — Marcus',
    text: 'Welcome. Are you looking to manage your money or learn about your options?',
    options: [
      {
        label: 'Open a savings account',
        action: () => useGame.getState().openSavings(200),
        next: {
          name: 'Bank Teller — Marcus',
          text: 'Done! I moved $200 from your cash into savings. Saving a little regularly really adds up.',
          options: [leave],
        },
      },
      {
        label: 'Learn about credit cards',
        next: {
          name: 'Bank Teller — Marcus',
          text: 'A credit card lets you borrow up to a limit. Pay the full balance each month and you build credit for free. Carry a balance and you pay interest (APR) — often 20%+.',
          options: [leave],
        },
      },
      {
        label: 'Deposit money',
        action: () => useGame.getState().deposit(100),
        next: {
          name: 'Bank Teller — Marcus',
          text: `I deposited $100 into your checking/bank balance. ${g.cash < 100 ? 'Looked like that was most of your cash — nicely done.' : 'Your money is safe with us.'}`,
          options: [leave],
        },
      },
      leave,
    ],
  }
}

export function BankInterior() {
  return (
    <Room
      w={16}
      d={13}
      floor="#d8d2c4"
      wall="#eef1f5"
      extraBoxes={[box(0, -3.4, 9, 1), box(-6.6, 3.2, 1.4, 4), box(6.6, -2, 1.2, 3)]}
    >
      <Rug position={[0, 0.02, 1.5]} size={[9, 5]} color="#8399bd" />

      {/* Teller counter with glass partitions */}
      <mesh position={[0, 0.6, -3.4]} castShadow>
        <boxGeometry args={[9, 1.2, 1]} />
        <meshStandardMaterial color="#6b4f2a" />
      </mesh>
      <mesh position={[0, 1.25, -3.4]}>
        <boxGeometry args={[9, 0.1, 1.2]} />
        <meshStandardMaterial color="#3f2d18" />
      </mesh>
      {[-3, 0, 3].map((x) => (
        <mesh key={x} position={[x, 1.9, -3.4]}>
          <boxGeometry args={[0.06, 1.1, 1]} />
          <meshStandardMaterial color="#bfe3ff" metalness={0.4} roughness={0.1} transparent opacity={0.35} />
        </mesh>
      ))}
      {/* Monitors on the counter */}
      {[-3, 3].map((x) => (
        <mesh key={x} position={[x, 1.55, -3.7]}>
          <boxGeometry args={[0.6, 0.4, 0.05]} />
          <meshStandardMaterial color="#0b1220" emissive="#1e3a5f" emissiveIntensity={0.5} />
        </mesh>
      ))}

      {/* Back wall logo strip + clock */}
      <mesh position={[0, 3, -6.3]}>
        <boxGeometry args={[10, 1.4, 0.1]} />
        <meshStandardMaterial color="#0ea5e9" emissive="#0369a1" emissiveIntensity={0.3} />
      </mesh>
      <WallClock position={[6.4, 3.2, -6.24]} />

      {/* ATM near the entrance */}
      <group position={[-6.7, 0, 3.4]}>
        <mesh position={[0, 1.1, 0]} castShadow>
          <boxGeometry args={[0.9, 2.2, 0.7]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        <mesh position={[0, 1.5, 0.36]}>
          <boxGeometry args={[0.6, 0.45, 0.05]} />
          <meshStandardMaterial color="#0b1220" emissive="#22c55e" emissiveIntensity={0.4} />
        </mesh>
      </group>

      {/* Queue posts with rope */}
      {[1.2, 2.6, 4].map((z) => (
        <mesh key={z} position={[1.5, 0.5, z]}>
          <cylinderGeometry args={[0.08, 0.1, 1, 8]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.6} />
        </mesh>
      ))}

      {/* Waiting area: chairs + coffee table + plants */}
      {[-6.2, -5, -3.8].map((x) => (
        <Chair key={x} position={[x, 0, 2.2]} rotation={Math.PI} />
      ))}
      {[-6.2, -5, -3.8].map((x) => (
        <Chair key={`b${x}`} position={[x, 0, 3.6]} />
      ))}
      <mesh position={[-5, 0.35, 2.9]} castShadow>
        <boxGeometry args={[1.4, 0.1, 0.8]} />
        <meshStandardMaterial color="#5a4632" />
      </mesh>
      <Plant position={[-7, 0, -5.2]} />
      <Plant position={[7, 0, 4.8]} scale={0.85} />

      {/* Guests / customers */}
      <Guest position={[-6.2, 0, 2.2]} rotation={0} shirt="#b45309" />
      <Guest position={[-3.8, 0, 3.6]} rotation={Math.PI} shirt="#7c3aed" skin="#8d5a3c" />
      <Guest position={[1.5, 0, 0.5]} rotation={Math.PI} shirt="#0891b2" pants="#374151" />
      <Guest position={[3.2, 0, 1.4]} rotation={Math.PI + 0.4} shirt="#be123c" skin="#a9754f" hair="#111" />

      {/* Second teller (non-interactive) */}
      <Guest position={[-3, 0, -2.6]} rotation={0} shirt="#0f766e" />

      {/* Interactive teller */}
      <NPC
        id="bank-teller"
        scene="bank"
        position={[2.5, 0, -2.4]}
        rotation={0}
        name="Marcus"
        shirt="#0f766e"
        pants="#1f2937"
        getDialogue={bankDialogue}
      />


      <LearningStation buildingId="bank" scene="bank" position={[-6.5, 0, -1.2]} />
      <InteriorExit scene="bank" />
    </Room>
  )
}
