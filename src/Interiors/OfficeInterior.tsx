import { Room, InteriorExit } from './Room'
import { NPC } from '../NPC'
import { Chair, Guest, Plant, Rug, WallClock } from '../props'
import { box } from '../collision'
import { useGame, type Dialogue, type DialogueOption } from '../GameState'
import { LearningStation } from '../curriculum/LearningStation'
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

function showResult() {
  const result = useGame.getState().finishInterview()
  useGame.setState((s) => ({
    dialogue: {
      name: NAME,
      text: result.message,
      options: [{ label: result.hired ? 'Thanks — I’ll check my Phone' : 'I’ll try again later', close: true }],
    },
    ...(result.hired
      ? {
          hasJob: true,
          career: 'Office Assistant' as const,
          weeklyIncome: Math.max(s.weeklyIncome, OFFICE_WEEKLY_GROSS),
        }
      : {}),
  }))
}

function q3(): Dialogue {
  return {
    name: NAME,
    text: 'Last one: A customer is upset about a delayed form. What do you do first?',
    options: [
      {
        label: 'Listen, apologize, then check the status',
        action: () => {
          useGame.getState().answerInterview(true)
          showResult()
        },
      },
      {
        label: 'Tell them it’s not my department',
        action: () => {
          useGame.getState().answerInterview(false)
          showResult()
        },
      },
      {
        label: 'Ignore it until they calm down',
        action: () => {
          useGame.getState().answerInterview(false)
          showResult()
        },
      },
    ],
  }
}

function q2(): Dialogue {
  return {
    name: NAME,
    text: 'If you’re scheduled 15 hours but a friend invites you to skip a shift, you…',
    options: [
      {
        label: 'Keep the shift — or swap it properly with the manager',
        action: () => {
          useGame.getState().answerInterview(true)
          useGame.setState({ dialogue: q3() })
        },
      },
      {
        label: 'Just don’t show up',
        action: () => {
          useGame.getState().answerInterview(false)
          useGame.setState({ dialogue: q3() })
        },
      },
      {
        label: 'Text a coworker at the last minute and hope',
        action: () => {
          useGame.getState().answerInterview(false)
          useGame.setState({ dialogue: q3() })
        },
      },
    ],
  }
}

function q1(): Dialogue {
  return {
    name: NAME,
    text: 'Interview time. Question 1: We’re open weekdays after school. Can you commit to those hours?',
    options: [
      {
        label: 'Yes — I can do weekday afternoons',
        action: () => {
          useGame.getState().answerInterview(true)
          useGame.setState({ dialogue: q2() })
        },
      },
      {
        label: 'Only if I feel like it each week',
        action: () => {
          useGame.getState().answerInterview(false)
          useGame.setState({ dialogue: q2() })
        },
      },
      {
        label: 'I need every afternoon free for gaming',
        action: () => {
          useGame.getState().answerInterview(false)
          useGame.setState({ dialogue: q2() })
        },
      },
    ],
  }
}

function officeDialogue(): Dialogue {
  const g = useGame.getState()
  const leave: DialogueOption = { label: 'Leave', close: true }

  if (g.hasJob) {
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

  const menu: Dialogue = {
    name: NAME,
    text: 'Part-time Office Assistant opening. Requirements: high school diploma, checking for direct deposit, reliable weekday hours. Interview required — we don’t hire on a handshake.',
    options: [],
  }

  menu.options = [
    {
      label: 'Read full requirements',
      next: {
        name: NAME,
        text: 'Must have: (1) HS diploma/GED, (2) checking account for direct deposit, (3) pass a short interview. Experience helps but isn’t required. Wrong answers lower your odds — rejection is real.',
        options: [{ label: 'Back', next: menu }, leave],
      },
    },
    {
      label: 'Start application / interview',
      action: () => {
        const err = useGame.getState().beginInterview()
        if (err) {
          useGame.setState({ dialogue: { name: NAME, text: err, options: [leave] } })
        } else {
          useGame.setState({ dialogue: q1() })
        }
      },
    },
    {
      label: 'Ask about pay',
      next: {
        name: NAME,
        text: `$${OFFICE_HOURLY}/hour, ~${OFFICE_HOURS_PER_WEEK} hours/week (~$${OFFICE_WEEKLY_GROSS} gross / ~$${NET_EST} take-home after ~18% tax). First payday is Sept 2 morning. Direct deposit only.`,
        options: [{ label: 'Back', next: menu }, leave],
      },
    },
    leave,
  ]
  return menu
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

      <LearningStation buildingId="office" scene="office" position={[-5.0, 0, 2.2]} />
      <InteriorExit scene="office" />
    </Room>
  )
}
