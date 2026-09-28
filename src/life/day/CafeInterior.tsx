import { Room, InteriorExit } from '../../Interiors/Room'
import { Chair, Plant, WallClock } from '../../props'
import { useGame } from '../../GameState'
import { useInteractable } from '../../InteractionSystem'
import { LivingCrowd } from './LivingCrowd'
import { businessOpen } from './schedule'

function CafeCounter() {
  const dayAct = useGame((s) => s.dayAct)
  const openDialogue = useGame((s) => s.openDialogue)
  const cash = useGame((s) => s.cash)
  const hasJob = useGame((s) => s.hasJob)
  const employer = useGame((s) => s.lifeFacts.employerId)
  const play = useGame((s) => s.play)
  const totalMinutes = useGame((s) => s.totalMinutes)

  useInteractable({
    id: 'cafe-counter',
    scene: 'cafe',
    position: [-1.2, 0, -2.2],
    radius: 2.2,
    prompt: 'Talk to Dev',
    onInteract: () => {
      if (!businessOpen('cafe', totalMinutes)) {
        openDialogue({ name: 'Bean Street', text: 'Closed. Come back in the morning.', options: [{ label: 'OK', close: true }] })
        return
      }
      const buyMeal = (price: number, label: string, hunger: number) => {
        const s = useGame.getState()
        if (s.cash + 0.001 < price) {
          s.openDialogue({ name: 'Devon', text: 'Not enough cash for that.', options: [{ label: 'OK', close: true }] })
          return
        }
        const foodId = `cafe-${s.totalMinutes}`
        useGame.setState({ cash: Math.round((s.cash - price) * 100) / 100 })
        dayAct({
          type: 'buy-food',
          items: [{ id: foodId, kind: 'cafe-meal', label, hungerRestore: hunger, boughtAt: s.totalMinutes }],
        })
        dayAct({ type: 'eat', foodId })
      }
      openDialogue({
        name: 'Devon',
        text: `Menu: oat latte $4.50 · breakfast sandwich $6.25 · combo $9. You have $${cash.toFixed(2)}.`,
        options: [
          { label: 'Oat latte $4.50', action: () => buyMeal(4.5, 'Oat latte', 10), close: true },
          { label: 'Sandwich $6.25', action: () => buyMeal(6.25, 'Breakfast sandwich', 22), close: true },
          { label: 'Combo $9', action: () => buyMeal(9, 'Café combo', 32), close: true },
          ...(hasJob && employer === 'bean'
            ? [
                {
                  label: 'Clock in for a shift',
                  action: () => {
                    const err = play({ type: 'open', activity: { kind: 'shift', employerId: 'bean' as const } })
                    if (err) openDialogue({ name: 'Devon', text: err, options: [{ label: 'OK', close: true }] })
                  },
                },
              ]
            : []),
          { label: 'Never mind', close: true },
        ],
      })
    },
  })

  return (
    <mesh position={[-1.2, 0.55, -2.6]} castShadow>
      <boxGeometry args={[4.2, 1.1, 1.2]} />
      <meshStandardMaterial color="#78350f" />
    </mesh>
  )
}

function CafeSeat({ id, x, z }: { id: string; x: number; z: number }) {
  const dayAct = useGame((s) => s.dayAct)
  const sitting = useGame((s) => s.dayLife.sittingId)
  useInteractable({
    id: `cafe-seat-${id}`,
    scene: 'cafe',
    position: [x, 0, z],
    radius: 1.6,
    prompt: sitting === id ? 'Stand up' : 'Sit',
    onInteract: () => {
      if (sitting === id) dayAct({ type: 'sit', seatId: null })
      else {
        dayAct({ type: 'sit', seatId: id })
        useGame.getState().advanceTime(6)
      }
    },
  })
  return <Chair position={[x, 0, z]} rotation={Math.PI} color="#44403c" />
}

function CafeShift() {
  const need = (step: number) => useGame.getState().worldSim.cafeStep >= step
  useInteractable({
    id: 'cafe-ticket',
    scene: 'cafe',
    position: [1.2, 0, -2.2],
    radius: 1.6,
    prompt: 'Read the customer ticket',
    onInteract: () => {
      const s = useGame.getState()
      if (s.lifeFacts.employerId !== 'bean' || !s.hasJob) {
        s.openDialogue({ name: 'Dev', text: 'That ticket is for staff. Talk to Dev if you want the job.', options: [{ label: 'OK', close: true }] })
        return
      }
      s.patchWorld({ cafeStep: Math.max(s.worldSim.cafeStep, 1) })
      s.openDialogue({ name: 'Ticket', text: 'Oat latte, extra hot, for the window table.', options: [{ label: 'OK', close: true }] })
    },
  })
  useInteractable({
    id: 'cafe-prep',
    scene: 'cafe',
    position: [-3.2, 0, -1],
    radius: 1.6,
    prompt: 'Prepare the coffee',
    onInteract: () => {
      const s = useGame.getState()
      if (!need(1)) {
        s.openDialogue({ name: 'Dev', text: 'Read the ticket first.', options: [{ label: 'OK', close: true }] })
        return
      }
      s.patchWorld({ cafeStep: Math.max(s.worldSim.cafeStep, 2) })
      s.openDialogue({ name: 'Espresso machine', text: 'Drink is ready. Serve the waiting customer.', options: [{ label: 'OK', close: true }] })
    },
  })
  useInteractable({
    id: 'cafe-serve',
    scene: 'cafe',
    position: [2.2, 0, 1.2],
    radius: 1.6,
    prompt: 'Serve the waiting customer',
    onInteract: () => {
      const s = useGame.getState()
      if (!need(2)) {
        s.openDialogue({ name: 'Dev', text: 'Prepare the drink before you serve it.', options: [{ label: 'OK', close: true }] })
        return
      }
      s.patchWorld({ cafeStep: 0 })
      const err = s.play({ type: 'shift', employerId: 'bean', accuracy: 1 })
      if (err) s.openDialogue({ name: 'Dev', text: err, options: [{ label: 'OK', close: true }] })
    },
  })
  return (
    <mesh position={[-3.2, 0.9, -1]} castShadow>
      <boxGeometry args={[0.8, 0.7, 0.6]} />
      <meshStandardMaterial color="#44403c" metalness={0.4} />
    </mesh>
  )
}

export function CafeInterior() {
  return (
    <Room w={12} d={10} floor="#d6c7b0" wall="#f5efe6">
      <CafeCounter />
      <CafeSeat id="c1" x={2.2} z={1.2} />
      <CafeSeat id="c2" x={3.6} z={1.2} />
      <CafeSeat id="c3" x={2.2} z={3.0} />
      <Plant position={[4.8, 0, -3.5]} />
      <WallClock position={[0, 3.2, -4.8]} />
      <mesh position={[0, 1.6, -4.7]}>
        <boxGeometry args={[3.2, 0.9, 0.08]} />
        <meshStandardMaterial color="#fef3c7" />
      </mesh>
      <CafeShift />
      <LivingCrowd />
      <InteriorExit scene="cafe" />
    </Room>
  )
}
