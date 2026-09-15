import { Room, InteriorExit } from './Room'
import { NPC } from '../NPC'
import { Guest, Chair, Plant, Rug, WallClock } from '../props'
import { box } from '../collision'
import { LearningStation } from '../curriculum/LearningStation'
import { KioskStation } from '../simulation/KioskStation'
import { useGame, type Dialogue } from '../GameState'
import { CREDIT_PRODUCT_MIN, INVEST_SAVINGS_MIN } from '../simulation/progression'

function bankDialogue(): Dialogue {
  const g = useGame.getState()
  const leave = { label: 'Leave', close: true as const }

  if (!g.hasCheckingAccount) {
    return {
      name: 'Bank Teller — Marcus',
      text: 'Welcome — first time? Let’s open a free checking account so paychecks and bills have somewhere to land.',
      options: [
        {
          label: 'Open checking (deposit graduation cash)',
          action: () => useGame.getState().openCheckingAccount(),
          next: {
            name: 'Bank Teller — Marcus',
            text: 'You’re set. Checking is open and your graduation gift is deposited. Come back for savings, credit, or the invest desk.',
            options: [leave],
          },
        },
        leave,
      ],
    }
  }

  return {
    name: 'Bank Teller — Marcus',
    text: 'Checking is open. What do you need?',
    options: [
      {
        label: 'Move $100 into savings',
        action: () => useGame.getState().openSavings(100),
        next: {
          name: 'Bank Teller — Marcus',
          text: 'If you had funds, they’re in savings now. A cushion comes before investing.',
          options: [leave],
        },
      },
      {
        label: 'Deposit $50 cash → checking',
        action: () => useGame.getState().deposit(50),
        next: {
          name: 'Bank Teller — Marcus',
          text: 'Deposit complete (if you had the cash).',
          options: [leave],
        },
      },
      {
        label: 'Withdraw $50 cash',
        action: () => useGame.getState().withdraw(50),
        next: {
          name: 'Bank Teller — Marcus',
          text: 'Here’s cash from checking (if available).',
          options: [leave],
        },
      },
      {
        label: 'Apply for a credit card',
        action: () => {
          const msg = useGame.getState().applyForCreditCard()
          useGame.setState({
            dialogue: {
              name: 'Bank Teller — Marcus',
              text: msg
                ? msg
                : `Approved. Card on file. Products need score ≥ ${CREDIT_PRODUCT_MIN} — you cleared it.`,
              options: [leave],
            },
          })
        },
      },
      {
        label: 'Ask about investing',
        next: {
          name: 'Bank Teller — Marcus',
          text: `Investing unlocks after about $${INVEST_SAVINGS_MIN} in savings. Build that cushion, then use the INVEST desk.`,
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
      <Rug position={[5.2, 0.02, -1.2]} size={[3.2, 2.4]} color="#94a3b8" />

      {/* Marble floor accent strip */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, -1.2]} receiveShadow>
        <planeGeometry args={[14, 0.55]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.2} roughness={0.35} />
      </mesh>

      <mesh position={[0, 0.6, -3.4]} castShadow>
        <boxGeometry args={[9, 1.2, 1]} />
        <meshStandardMaterial color="#6b4f2a" />
      </mesh>
      <mesh position={[0, 1.25, -3.4]}>
        <boxGeometry args={[9, 0.1, 1.2]} />
        <meshStandardMaterial color="#3f2d18" />
      </mesh>
      {/* Teller nameplates */}
      {[-3, 0, 3].map((x) => (
        <mesh key={`np${x}`} position={[x, 1.42, -2.95]}>
          <boxGeometry args={[1.1, 0.12, 0.04]} />
          <meshStandardMaterial color="#0f172a" emissive="#0369a1" emissiveIntensity={0.2} />
        </mesh>
      ))}
      {[-3, 0, 3].map((x) => (
        <mesh key={x} position={[x, 1.9, -3.4]}>
          <boxGeometry args={[0.06, 1.1, 1]} />
          <meshStandardMaterial color="#bfe3ff" metalness={0.4} roughness={0.1} transparent opacity={0.35} />
        </mesh>
      ))}
      {[-3, 3].map((x) => (
        <mesh key={x} position={[x, 1.55, -3.7]}>
          <boxGeometry args={[0.6, 0.4, 0.05]} />
          <meshStandardMaterial color="#0b1220" emissive="#1e3a5f" emissiveIntensity={0.5} />
        </mesh>
      ))}

      <mesh position={[0, 3, -6.3]}>
        <boxGeometry args={[10, 1.4, 0.1]} />
        <meshStandardMaterial color="#0ea5e9" emissive="#0369a1" emissiveIntensity={0.3} />
      </mesh>
      <WallClock position={[6.4, 3.2, -6.24]} />

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

      {[1.2, 2.6, 4].map((z) => (
        <mesh key={z} position={[1.5, 0.5, z]}>
          <cylinderGeometry args={[0.08, 0.1, 1, 8]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.6} />
        </mesh>
      ))}

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

      <Guest position={[-6.2, 0, 2.2]} rotation={0} shirt="#b45309" />
      <Guest position={[-3.8, 0, 3.6]} rotation={Math.PI} shirt="#7c3aed" skin="#8d5a3c" />
      <Guest position={[1.5, 0, 0.5]} rotation={Math.PI} shirt="#0891b2" pants="#374151" />
      <Guest position={[3.2, 0, 1.4]} rotation={Math.PI + 0.4} shirt="#be123c" skin="#a9754f" hair="#111" />
      <Guest position={[-3, 0, -2.6]} rotation={0} shirt="#0f766e" />

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
      <KioskStation
        id="bank-invest"
        scene="bank"
        position={[5.8, 0, 2.4]}
        label="INVEST"
        prompt="Open invest desk"
        color="#0f766e"
        emissive="#34d399"
        onOpen={() => useGame.getState().openInvestingPanel()}
      />
      <InteriorExit scene="bank" />
    </Room>
  )
}
