import { Text } from '@react-three/drei'
import { Room, InteriorExit } from './Room'
import { useInteractable } from '../InteractionSystem'
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

  if (!g.hasCheckingAccount || (g.lifeFacts.bankPlanId == null && !g.lifeFacts.legacyBank)) {
    return {
      name: 'Jordan',
      text: 'First time? I can show you three checking products. I will not pick one for you — the fees and overdraft rules become yours.',
      options: [
        {
          label: 'Compare accounts',
          action: () => useGame.getState().play({ type: 'open', activity: { kind: 'bank' } }),
          close: true,
        },
        leave,
      ],
    }
  }

  const plan = g.lifeFacts.bankPlanId
  return {
    name: 'Bank Teller — Marcus',
    text: plan
      ? `You have ${plan === 'everyday' ? 'Everyday Checking' : plan === 'plus' ? 'Plus Checking' : 'the Online Account'}. Those rules are already in effect. What do you need?`
      : 'Checking is open. What do you need?',
    options: [
      {
        label: 'Move $100 into savings',
        action: () => useGame.getState().openSavings(100),
        next: {
          name: 'Jordan',
          text: 'If you had funds, they’re in savings now. A cushion comes before investing.',
          options: [leave],
        },
      },
      {
        label: 'Deposit $50 cash → checking',
        action: () => useGame.getState().deposit(50),
        next: {
          name: 'Jordan',
          text: 'Deposit complete (if you had the cash).',
          options: [leave],
        },
      },
      {
        label: 'Withdraw $50 cash',
        action: () => useGame.getState().withdraw(50),
        next: {
          name: 'Jordan',
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
              name: 'Jordan',
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
          name: 'Jordan',
          text: `Investing unlocks after about $${INVEST_SAVINGS_MIN} in savings. Build that cushion, then use the INVEST desk.`,
          options: [leave],
        },
      },
      leave,
    ],
  }
}

function BankCounters() {
  const hasChecking = useGame((s) => s.hasCheckingAccount)
  useInteractable({
    id: 'bank-open',
    scene: 'bank',
    position: [-3, 0, -2.2],
    radius: 1.6,
    prompt: hasChecking ? 'Talk to Jordan' : 'Open checking account',
    onInteract: () => {
      if (useGame.getState().hasCheckingAccount) {
        useGame.getState().openDialogue({ name: 'Jordan', text: 'Checking is already open. Use the other windows for deposits, withdrawals, and transfers.', options: [{ label: 'OK', close: true }] })
        return
      }
      useGame.getState().play({ type: 'open', activity: { kind: 'bank' } })
    },
  })
  useInteractable({
    id: 'bank-dep',
    scene: 'bank',
    position: [-1, 0, -2.2],
    radius: hasChecking ? 1.6 : 0.2,
    prompt: 'Deposit money',
    onInteract: () => {
      const err = useGame.getState().deposit(50)
      useGame.getState().openDialogue({ name: 'Jordan', text: err ?? 'Deposited $50 from cash into checking.', options: [{ label: 'OK', close: true }] })
    },
  })
  useInteractable({
    id: 'bank-with',
    scene: 'bank',
    position: [1, 0, -2.2],
    radius: hasChecking ? 1.6 : 0.2,
    prompt: 'Withdraw money',
    onInteract: () => {
      const err = useGame.getState().withdraw(50)
      useGame.getState().openDialogue({ name: 'Jordan', text: err ?? 'Withdrew $50 from checking.', options: [{ label: 'OK', close: true }] })
    },
  })
  useInteractable({
    id: 'bank-xfer',
    scene: 'bank',
    position: [3, 0, -2.2],
    radius: hasChecking ? 1.6 : 0.2,
    prompt: 'Transfer money',
    onInteract: () => {
      const err = useGame.getState().transferToSavings(50)
      useGame.getState().openDialogue({ name: 'Jordan', text: err ?? 'Moved $50 from checking into savings.', options: [{ label: 'OK', close: true }] })
    },
  })
  useInteractable({
    id: 'bank-atm',
    scene: 'bank',
    position: [-6.7, 0, 3.4],
    radius: 1.8,
    prompt: 'Use the ATM',
    onInteract: () => {
      const s = useGame.getState()
      if (!s.hasCheckingAccount) {
        s.openDialogue({ name: 'ATM', text: 'The ATM needs an open checking account.', options: [{ label: 'OK', close: true }] })
        return
      }
      s.openDialogue({
        name: 'ATM',
        text: `Checking $${s.bank.toFixed(2)}. Savings $${s.savings.toFixed(2)}. Cash $${s.cash.toFixed(2)}.`,
        options: [
          { label: 'Deposit $20', action: () => useGame.getState().deposit(20), close: true },
          { label: 'Withdraw $20', action: () => useGame.getState().withdraw(20), close: true },
          { label: 'Cancel', close: true },
        ],
      })
    },
  })
  useInteractable({
    id: 'bank-ledger',
    scene: 'bank',
    position: [5.2, 0, 1],
    radius: 1.8,
    prompt: hasChecking ? 'View transactions' : 'Talk to Jordan',
    onInteract: () => {
      const s = useGame.getState()
      if (!s.hasCheckingAccount) return
      const lines = s.ledger.slice(0, 4).map((e) => `${e.label} ${e.amount >= 0 ? '+' : ''}${e.amount.toFixed(2)}`).join('\n') || 'No transactions yet.'
      s.openDialogue({ name: 'Jordan', text: lines, options: [{ label: 'OK', close: true }] })
    },
  })
  return null
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
        <meshStandardMaterial color="#0f766e" emissive="#0f766e" emissiveIntensity={0.25} />
      </mesh>
      <Text position={[0, 3, -6.2]} fontSize={0.28} color="#ecfeff" anchorX="center">
        CHECKING · SAVINGS · A FRESH START
      </Text>
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
        name="Jordan"
        shirt="#0f766e"
        pants="#1f2937"
        getDialogue={bankDialogue}
      />

      <BankCounters />
      <LearningStation buildingId="bank" scene="bank" position={[-6.5, 0, -1.2]} />
      <KioskStation
        id="bank-invest"
        scene="bank"
        position={[5.8, 0, 2.4]}
        label="INVEST"
        prompt="Investments and credit"
        color="#0f766e"
        emissive="#34d399"
        onOpen={() => useGame.getState().openInvestingPanel()}
      />
      <InteriorExit scene="bank" />
    </Room>
  )
}
