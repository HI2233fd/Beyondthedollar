import { Room, InteriorExit } from './Room'
import { NPC } from '../NPC'
import { Guest, Plant, WallClock } from '../props'
import { box } from '../collision'
import { useGame, type Dialogue, type DialogueOption } from '../GameState'
import { LearningStation } from '../curriculum/LearningStation'

const NAME = 'Manager — Diane'

function showResult() {
  const result = useGame.getState().finishInterview()
  useGame.setState({
    dialogue: {
      name: NAME,
      text: result.message,
      options: [{ label: result.hired ? 'Thanks!' : 'I’ll try again later', close: true }],
    },
  })
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
    return {
      name: NAME,
      text: `Good to see you! Office Assistant at $16/hour. This week’s expected gross is about $${weekly} before taxes — stubs are on your phone.`,
      options: [leave],
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
        text: '$16/hour, ~15 hours/week (~$240 gross). Direct deposit only. Paystubs appear on your phone after payday.',
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
      <mesh position={[0, 2.2, -6.7]}>
        <planeGeometry args={[14, 3.4]} />
        <meshStandardMaterial color="#bfe3ff" metalness={0.5} roughness={0.1} transparent opacity={0.5} />
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
        </group>
      ))}

      <WallClock position={[0, 3.4, -6.6]} />
      <Plant position={[-7, 0, 5]} />
      <Plant position={[7, 0, -5]} scale={0.9} />
      <Guest position={[-4, 0, -1.2]} rotation={0} shirt="#64748b" />
      <Guest position={[4, 0, -1.2]} rotation={0} shirt="#0ea5e9" />

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
