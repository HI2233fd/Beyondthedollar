import { Room, InteriorExit } from './Room'
import { NPC } from '../NPC'
import { Chair, Guest, Plant, Rug, WallClock } from '../props'
import { box } from '../collision'
import { useGame, type Dialogue, type DialogueOption } from '../GameState'
import { LearningStation } from '../curriculum/LearningStation'
import { useInteractable } from '../InteractionSystem'
import { stampFromMinutes } from '../simulation/time'
import {
  OFFICE_HOURS_PER_WEEK,
  OFFICE_HOURLY,
  OFFICE_WEEKLY_GROSS,
  PAYROLL_TAX_RATE,
} from '../simulation/progression'

const NAME = 'Manager — Diane'
const NET_EST = Math.round(OFFICE_WEEKLY_GROSS * (1 - PAYROLL_TAX_RATE))

function stampLabel(totalMinutes: number) {
  const s = stampFromMinutes(totalMinutes)
  return `${s.weekday} ${s.month}/${s.dayOfMonth} ${s.clockLabel}`
}

function officeDialogue(): Dialogue {
  const g = useGame.getState()
  const leave: DialogueOption = { label: 'Leave', close: true }

  if (g.hasJob && !g.lifeFacts.usesShiftPay) {
    const weekly = Math.round(g.weeklyIncome * g.incomeFactor)
    const net = Math.round(weekly * (1 - PAYROLL_TAX_RATE))
    const pay = stampLabel(g.nextPaydayAt)
    return {
      name: NAME,
      text: `You’re on the roster as ${g.career}. ~$${weekly}/wk gross → ~$${net} take-home after tax. Next direct deposit: ${pay}.`,
      options: [
        {
          label: 'Skip ahead to payday',
          action: () => {
            useGame.getState().advanceToPayday()
            useGame.getState().closeDialogue()
          },
        },
        leave,
      ],
    }
  }

  const facts = g.lifeFacts
  const worksHere = g.hasJob && facts.employerId === 'summit'
  const app = facts.apps.summit
  if (worksHere) {
    return {
      name: NAME,
      text: `You’re on the desk as ${g.career}. Shifts pay from the work you do here, after tax.`,
      options: [
        {
          label: 'Clock in',
          action: () => {
            const err = useGame.getState().play({ type: 'open', activity: { kind: 'shift', employerId: 'summit' } })
            if (err) useGame.getState().openDialogue({ name: NAME, text: err, options: [leave] })
          },
        },
        {
          label: 'The drawer problem',
          action: () => useGame.getState().play({ type: 'open', activity: { kind: 'workplace' } }),
          close: true,
        },
        {
          label: 'Performance review',
          action: () => useGame.getState().play({ type: 'open', activity: { kind: 'review' } }),
          close: true,
        },
        leave,
      ],
    }
  }

  return {
    name: NAME,
    text: `Office Assistant, $${OFFICE_HOURLY}/hr, about ${OFFICE_HOURS_PER_WEEK} hrs/week. Direct deposit only. Interview is situational — I want to see how you handle a real desk, not a slogan.`,
    options: [
      {
        label: app?.status === 'scheduled' ? 'Start the interview' : app?.status === 'offered' ? 'Talk about the offer' : 'Read the posting',
        action: () => {
          const state = useGame.getState()
          const status = state.lifeFacts.apps.summit?.status
          if (status === 'scheduled') {
            const err = state.play({ type: 'open', activity: { kind: 'interview', employerId: 'summit' } })
            if (err) state.openDialogue({ name: NAME, text: err, options: [leave] })
          } else {
            state.play({ type: 'open', activity: { kind: 'posting', employerId: 'summit' } })
          }
        },
      },
      {
        label: 'Ask about pay',
        next: {
          name: NAME,
          text: `$${OFFICE_HOURLY}/hour. A 4-hour shift is taxed at about 18% (around $${NET_EST} is a full week, not one shift). You get paid when you clock out.`,
          options: [leave],
        },
      },
      leave,
    ],
  }
}

function OfficeShift() {
  const gate = (need: number, next: number, line: string, done?: () => void) => {
    const s = useGame.getState()
    if (s.worldSim.officeStep < need) {
      s.openDialogue({ name: 'Diane', text: 'Order is brief, workstation, review, then reception.', options: [{ label: 'OK', close: true }] })
      return
    }
    s.patchWorld({ officeStep: next })
    if (done) done()
    else s.openDialogue({ name: 'Diane', text: line, options: [{ label: 'OK', close: true }] })
  }
  useInteractable({
    id: 'off-brief',
    scene: 'office',
    position: [-4, 0, -2],
    radius: 1.7,
    prompt: 'Read the brief',
    onInteract: () => gate(0, 1, 'Brief is on the desk. Use a workstation next.'),
  })
  useInteractable({
    id: 'off-desk',
    scene: 'office',
    position: [0, 0, -2],
    radius: 1.7,
    prompt: 'Use workstation',
    onInteract: () => gate(1, 2, 'Draft is saved. Diane reviews it.'),
  })
  useInteractable({
    id: 'off-review',
    scene: 'office',
    position: [0, 0, 2],
    radius: 1.7,
    prompt: 'Supervisor review',
    onInteract: () =>
      gate(2, 3, 'Reviewed.', () => {
        const s = useGame.getState()
        if (s.hasJob && s.lifeFacts.employerId === 'summit') {
          const err = s.play({ type: 'shift', employerId: 'summit', accuracy: 1 })
          if (err) s.openDialogue({ name: 'Diane', text: err, options: [{ label: 'OK', close: true }] })
        } else {
          s.openDialogue({ name: 'Diane', text: 'Reviewed. Payroll runs when you are on the Summit schedule. Deliver the folder to reception.', options: [{ label: 'OK', close: true }] })
        }
      }),
  })
  useInteractable({
    id: 'off-reception',
    scene: 'office',
    position: [0, 0, 5],
    radius: 1.7,
    prompt: 'Deliver to reception',
    onInteract: () => gate(3, 0, 'Reception has the folder.'),
  })
  return null
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
      <Rug position={[0, 0.02, 3.2]} size={[5.5, 3.2]} color="#334155" />

      {/* Accent stripe + frosted glass wall */}
      <mesh position={[0, 0.35, -6.7]}>
        <boxGeometry args={[14.5, 0.7, 0.08]} />
        <meshStandardMaterial color="#1d4ed8" emissive="#1e3a8a" emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0, 2.2, -6.7]}>
        <planeGeometry args={[14, 3.4]} />
        <meshStandardMaterial color="#bfe3ff" metalness={0.5} roughness={0.1} transparent opacity={0.5} />
      </mesh>
      {/* Window mullions */}
      {[-4.5, -1.5, 1.5, 4.5].map((x) => (
        <mesh key={x} position={[x, 2.2, -6.68]}>
          <boxGeometry args={[0.08, 3.4, 0.04]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.4} />
        </mesh>
      ))}

      {/* Reception counter */}
      <mesh position={[0, 0.55, 4.6]} castShadow>
        <boxGeometry args={[4.8, 1.1, 0.9]} />
        <meshStandardMaterial color="#64748b" roughness={0.55} />
      </mesh>
      <mesh position={[0, 1.15, 4.6]}>
        <boxGeometry args={[4.8, 0.08, 1.05]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>

      {deskPos.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
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
          <mesh position={[0, 1.15, -0.3]} castShadow>
            <boxGeometry args={[0.9, 0.55, 0.06]} />
            <meshStandardMaterial color="#0b1220" emissive="#1e3a5f" emissiveIntensity={0.5} />
          </mesh>
          {/* keyboard + mug */}
          <mesh position={[0.15, 0.82, 0.15]}>
            <boxGeometry args={[0.55, 0.03, 0.22]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
          <mesh position={[-0.75, 0.86, 0.25]}>
            <cylinderGeometry args={[0.08, 0.07, 0.12, 10]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <Chair position={[0, 0, 0.95]} rotation={Math.PI} color="#1e293b" />
        </group>
      ))}

      {/* Ceiling panels strip */}
      {[-4, -1.3, 1.3, 4].map((x) => (
        <mesh key={x} position={[x, 3.85, 0]}>
          <boxGeometry args={[2.2, 0.06, 10]} />
          <meshStandardMaterial color="#cbd5e1" emissive="#e2e8f0" emissiveIntensity={0.15} />
        </mesh>
      ))}

      <WallClock position={[0, 3.4, -6.6]} />
      <Plant position={[-7, 0, 5]} />
      <Plant position={[7, 0, -5]} scale={0.9} />
      <Plant position={[-7.2, 0, -5.2]} scale={0.75} />
      <Guest position={[-4, 0, -1.2]} rotation={0} shirt="#64748b" />
      <Guest position={[4, 0, -1.2]} rotation={0} shirt="#0ea5e9" />
      <Guest position={[-2.2, 0, 4.2]} rotation={Math.PI} shirt="#f59e0b" pants="#1f2937" />

      <NPC
        id="office-diane"
        scene="office"
        position={[0, 0, 3.2]}
        rotation={Math.PI}
        name="Diane"
        shirt="#1d4ed8"
        pants="#111827"
        getDialogue={officeDialogue}
      />

      <OfficeShift />
      <LearningStation buildingId="office" scene="office" position={[-5.0, 0, 2.2]} />
      <InteriorExit scene="office" />
    </Room>
  )
}
