import { Room, InteriorExit } from '../../Interiors/Room'
import { Chair, Plant, WallClock } from '../../props'
import { Counter, EspressoMachine } from '../../world/furniture'
import { useGame } from '../../GameState'
import { useInteractable } from '../../InteractionSystem'
import { LivingCrowd } from './LivingCrowd'
import { businessOpen } from './schedule'
import { applyMoney } from '../../world/pay'

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
        const err = applyMoney(-price, label)
        if (err) {
          s.openDialogue({ name: 'Dev', text: err, options: [{ label: 'Back', close: true }] })
          return
        }
        const foodId = `cafe-${s.totalMinutes}`
        dayAct({
          type: 'buy-food',
          items: [{ id: foodId, kind: 'cafe-meal', label, hungerRestore: hunger, boughtAt: s.totalMinutes }],
        })
        dayAct({ type: 'eat', foodId })
      }
      openDialogue({
        name: 'Dev',
        text: hasJob && employer === 'bean'
          ? 'Buying food and working are separate. The shift is the ticket, the machine, then the table. Payroll runs once when you serve.'
          : `I'm Dev. Food is separate from the job. Menu: oat latte $4.50 · sandwich $6.25 · combo $9. You have $${cash.toFixed(2)} cash, and checking is used when it can cover the bill.`,
        options: [
          { label: 'Oat latte $4.50', action: () => buyMeal(4.5, 'Oat latte', 10), close: true },
          { label: 'Sandwich $6.25', action: () => buyMeal(6.25, 'Breakfast sandwich', 22), close: true },
          { label: 'Combo $9', action: () => buyMeal(9, 'Café combo', 32), close: true },
          ...(!hasJob
            ? [
                {
                  label: 'Ask about the job',
                  action: () => {
                    const err = play({ type: 'open', activity: { kind: 'posting', employerId: 'bean' as const } })
                    if (err) openDialogue({ name: 'Dev', text: err, options: [{ label: 'Back', close: true }] })
                  },
                },
              ]
            : []),
          { label: 'Cancel', close: true },
        ],
      })
    },
  })

  return <Counter position={[-1.2, 0, -2.6]} width={3.4} top="#e7e5e4" body="#78350f" />
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
    <group position={[-3.2, 0, -1]}>
      <Counter position={[0, 0, 0]} width={1.1} top="#a8a29e" body="#44403c" />
      <EspressoMachine position={[0, 0.95, 0]} />
    </group>
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
