import { Room, InteriorExit } from './Room'
import { NPC } from '../NPC'
import { box } from '../collision'
import { useGame, type Dialogue } from '../GameState'

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
      extraBoxes={[box(0, -3.4, 9, 1), box(-5.5, -1, 2.5, 3)]}
    >
      {/* Teller counter */}
      <mesh position={[0, 0.6, -3.4]} castShadow>
        <boxGeometry args={[9, 1.2, 1]} />
        <meshStandardMaterial color="#6b4f2a" />
      </mesh>
      <mesh position={[0, 1.25, -3.4]}>
        <boxGeometry args={[9, 0.1, 1.2]} />
        <meshStandardMaterial color="#3f2d18" />
      </mesh>
      {/* Back wall panels / logo strip */}
      <mesh position={[0, 3, -6.3]}>
        <boxGeometry args={[10, 1.4, 0.1]} />
        <meshStandardMaterial color="#0ea5e9" emissive="#0369a1" emissiveIntensity={0.3} />
      </mesh>

      {/* Waiting chairs */}
      {[-5.5, -4, -2.5].map((x) => (
        <group key={x} position={[x, 0, 2]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[0.9, 0.15, 0.9]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[0, 0.9, -0.4]}>
            <boxGeometry args={[0.9, 0.9, 0.12]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          {[-0.35, 0.35].map((lx) =>
            [-0.35, 0.35].map((lz) => (
              <mesh key={`${lx}-${lz}`} position={[lx, 0.2, lz]}>
                <cylinderGeometry args={[0.04, 0.04, 0.4, 6]} />
                <meshStandardMaterial color="#111827" />
              </mesh>
            )),
          )}
        </group>
      ))}

      {/* Employee behind the counter */}
      <NPC
        id="bank-teller"
        scene="bank"
        position={[0, 0, -2.4]}
        rotation={0}
        name="Marcus"
        shirt="#0f766e"
        pants="#1f2937"
        getDialogue={bankDialogue}
      />

      <InteriorExit scene="bank" />
    </Room>
  )
}
