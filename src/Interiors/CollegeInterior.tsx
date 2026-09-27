import { Room, InteriorExit } from './Room'
import { NPC } from '../NPC'
import { Chair, Plant, WallClock } from '../props'
import { box } from '../collision'
import { useGame, type Dialogue, type DialogueOption } from '../GameState'
import { LearningStation } from '../curriculum/LearningStation'
import { useInteractable } from '../InteractionSystem'
import { LivingCrowd } from '../life/day/LivingCrowd'
import { periodAt } from '../life/day/schedule'

const COUNSELOR = 'Counselor — Ms. Alvarez'

function counselorDialogue(): Dialogue {
  const leave: DialogueOption = { label: 'Leave', close: true }
  const menu: Dialogue = { name: COUNSELOR, text: 'Office hours. Classes are down the hall — sit when the period starts.', options: [] }
  menu.options = [
    {
      label: 'Where is my class?',
      next: {
        name: COUNSELOR,
        text: 'Classroom A is left of the hall for Finance and Economics. Classroom B is right for Algebra and Civics. Cafeteria is the bright tables near the windows.',
        options: [{ label: 'Ask something else', next: menu }, leave],
      },
    },
    {
      label: 'Tuition question',
      next: {
        name: COUNSELOR,
        text: 'Community college is cheaper than a four-year. Scholarships are free money — apply early.',
        options: [{ label: 'Ask something else', next: menu }, leave],
      },
    },
    leave,
  ]
  return menu
}

function SchoolDesk({ id, x, z }: { id: string; x: number; z: number }) {
  const dayAct = useGame((s) => s.dayAct)
  const openClass = useGame((s) => s.openClassSession)
  const totalMinutes = useGame((s) => s.totalMinutes)
  const seated = useGame((s) => s.dayLife.schoolSeated)

  useInteractable({
    id: `desk-${id}`,
    scene: 'college',
    position: [x, 0, z],
    radius: 1.5,
    prompt: seated ? 'Already seated' : 'Sit at desk',
    onInteract: () => {
      const period = periodAt(totalMinutes)
      dayAct({ type: 'school-seat', seated: true })
      dayAct({ type: 'sit', seatId: `desk-${id}` })
      if (period.kind === 'class') {
        dayAct({ type: 'attend-period', periodId: period.id })
        openClass()
      } else {
        useGame.getState().openDialogue({
          name: 'Desk',
          text:
            period.kind === 'lunch'
              ? 'Lunch is in the cafeteria wing — grab a tray first.'
              : period.kind === 'passing'
                ? 'Passing period. Next class is soon.'
                : 'No class right now. Come back when the period starts.',
          options: [{ label: 'OK', close: true }],
        })
      }
    },
  })

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.9, 0.08, 0.6]} />
        <meshStandardMaterial color="#7c5a3a" />
      </mesh>
      <Chair position={[0, 0, 0.55]} rotation={Math.PI} color="#475569" />
    </group>
  )
}

function LunchLine() {
  const dayAct = useGame((s) => s.dayAct)
  const cash = useGame((s) => s.cash)
  const totalMinutes = useGame((s) => s.totalMinutes)
  const lunchDone = useGame((s) => s.dayLife.lunchEatenToday)

  useInteractable({
    id: 'lunch-line',
    scene: 'college',
    position: [6.5, 0, 4.5],
    radius: 2.2,
    prompt: lunchDone ? 'Already ate lunch' : 'Get cafeteria tray ($3.50)',
    onInteract: () => {
      const period = periodAt(totalMinutes)
      if (period.kind !== 'lunch' && period.kind !== 'afternoon') {
        useGame.getState().openDialogue({
          name: 'Cafeteria',
          text: 'Line is for lunch period. Come back when the schedule says lunch.',
          options: [{ label: 'OK', close: true }],
        })
        return
      }
      if (lunchDone) return
      if (cash + 0.001 < 3.5) {
        useGame.getState().openDialogue({
          name: 'Cafeteria',
          text: 'Tray is $3.50. You are short on cash.',
          options: [{ label: 'OK', close: true }],
        })
        return
      }
      useGame.setState({ cash: Math.round((cash - 3.5) * 100) / 100 })
      dayAct({ type: 'eat-lunch' })
      useGame.getState().openDialogue({
        name: 'Cafeteria',
        text: 'Tray is yours. Sit with Riley or Sam if they are at the tables.',
        options: [{ label: 'Thanks', close: true }],
      })
    },
  })

  return (
    <mesh position={[6.5, 0.55, 4.2]} castShadow>
      <boxGeometry args={[3.2, 1.1, 1.2]} />
      <meshStandardMaterial color="#94a3b8" />
    </mesh>
  )
}

function CafeteriaSeat({ id, x, z }: { id: string; x: number; z: number }) {
  const dayAct = useGame((s) => s.dayAct)
  const sitting = useGame((s) => s.dayLife.sittingId)
  useInteractable({
    id: `cafe-table-${id}`,
    scene: 'college',
    position: [x, 0, z],
    radius: 1.7,
    prompt: sitting === id ? 'Stand up' : 'Sit and eat with friends',
    onInteract: () => {
      if (sitting === id) dayAct({ type: 'sit', seatId: null })
      else {
        dayAct({ type: 'sit', seatId: id })
        useGame.getState().advanceTime(8)
        useGame.getState().openDialogue({
          name: 'Lunch table',
          text: 'You sit. Riley talks about a café hiring; Sam mentions used cars. Normal lunch — not a worksheet.',
          options: [{ label: 'Listen', close: true }],
        })
      }
    },
  })
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[1.6, 0.1, 1.6]} />
        <meshStandardMaterial color="#d6d3d1" />
      </mesh>
      <Chair position={[0, 0, 0.9]} rotation={Math.PI} color="#64748b" />
    </group>
  )
}

function Locker() {
  useInteractable({
    id: 'locker-row',
    scene: 'college',
    position: [-7.2, 0, 2],
    radius: 2,
    prompt: 'Open locker',
    onInteract: () => {
      useGame.getState().openDialogue({
        name: 'Locker',
        text: 'Binder, gum, a crumpled schedule. Passing period is when the hall fills.',
        options: [{ label: 'Close', close: true }],
      })
      useGame.getState().advanceTime(2)
    },
  })
  return (
    <mesh position={[-7.4, 1.2, 2]} castShadow>
      <boxGeometry args={[0.4, 2.4, 4]} />
      <meshStandardMaterial color="#334155" />
    </mesh>
  )
}

/** Functional high-school campus: classrooms, hall, cafeteria, living NPCs. */
export function CollegeInterior() {
  return (
    <Room
      w={18}
      d={14}
      floor="#cdd6df"
      wall="#eef2f6"
      extraBoxes={[box(-5.5, -4.5, 6, 0.4), box(5.5, -4.5, 6, 0.4), box(0, -5.6, 4, 0.5)]}
    >
      {/* Hall strip */}
      <mesh position={[0, 0.02, 1.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[4, 8]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>

      {/* Classroom A (left) desks */}
      <SchoolDesk id="a1" x={-5.2} z={-2.2} />
      <SchoolDesk id="a2" x={-3.6} z={-2.2} />
      <SchoolDesk id="a3" x={-5.2} z={-3.6} />
      <SchoolDesk id="a4" x={-3.6} z={-3.6} />
      <mesh position={[-5.5, 0.9, -5.4]} castShadow>
        <boxGeometry args={[4.5, 0.12, 0.8]} />
        <meshStandardMaterial color="#57534e" />
      </mesh>

      {/* Classroom B (right) */}
      <SchoolDesk id="b1" x={3.6} z={-2.0} />
      <SchoolDesk id="b2" x={5.2} z={-2.0} />
      <SchoolDesk id="b3" x={3.6} z={-3.6} />
      <SchoolDesk id="b4" x={5.2} z={-3.6} />
      <mesh position={[5.5, 0.9, -5.2]} castShadow>
        <boxGeometry args={[4.5, 0.12, 0.8]} />
        <meshStandardMaterial color="#57534e" />
      </mesh>

      <LunchLine />
      <CafeteriaSeat id="l1" x={4.2} z={4.2} />
      <CafeteriaSeat id="l2" x={5.8} z={4.2} />
      <Locker />

      <WallClock position={[0, 3.3, -6.7]} />
      <Plant position={[7.5, 0, 0]} />
      <Plant position={[-7.5, 0, -1]} />

      <NPC
        id="college-counselor"
        scene="college"
        position={[0.5, 0, -5.8]}
        rotation={0}
        name="Ms. Alvarez"
        shirt="#b91c1c"
        pants="#1f2937"
        getDialogue={counselorDialogue}
      />

      <LearningStation buildingId="college" scene="college" position={[-7.2, 0, -4.5]} />
      <LivingCrowd />
      <InteriorExit scene="college" />
    </Room>
  )
}
