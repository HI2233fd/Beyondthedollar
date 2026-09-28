import { Room, InteriorExit } from './Room'
import { NPC } from '../NPC'
import { Chair, Plant, Rug, WallClock } from '../props'
import { Bed, Counter, Fridge as FridgeUnit, Shelf, Sink, Sofa, Stove, Wardrobe } from '../world/furniture'
import { box } from '../collision'
import { LearningStation } from '../curriculum/LearningStation'
import { KioskStation } from '../simulation/KioskStation'
import { useGame, type Dialogue } from '../GameState'
import { useInteractable } from '../InteractionSystem'
import { LIFE_GOALS } from '../life/types'
import { OUTFIT_CATALOG } from '../life/day/types'
import { handNeighborHome } from '../world/deliver'

function BedRest() {
  useInteractable({
    id: 'home-bed',
    scene: 'home',
    position: [-4.4, 0, -3],
    radius: 2.2,
    prompt: 'Rest in your bedroom',
    onInteract: () => {
      const err = useGame.getState().dayAct({ type: 'sleep' })
      if (err) useGame.getState().openDialogue({ name: 'Apartment', text: err, options: [{ label: 'OK', close: true }] })
    },
  })
  return null
}

function Fridge() {
  useInteractable({
    id: 'home-fridge',
    scene: 'home',
    position: [5.2, 0, 1.5],
    radius: 2,
    prompt: 'Cook a meal',
    onInteract: () => {
      const s = useGame.getState()
      const pantry = s.dayLife.pantry
      if (!pantry.length) {
        s.openDialogue({
          name: 'Fridge',
          text: 'Empty. Buy groceries at FreshMart and they show up here.',
          options: [{ label: 'Close', close: true }],
        })
        return
      }
      s.openDialogue({
        name: 'Fridge',
        text: 'What do you want to eat?',
        options: [
          ...pantry.slice(0, 5).map((f) => ({
            label: `Eat ${f.label}`,
            action: () => useGame.getState().dayAct({ type: 'eat', foodId: f.id }),
            close: true as const,
          })),
          { label: 'Close', close: true as const },
        ],
      })
    },
  })
  return null
}

function Closet() {
  useInteractable({
    id: 'home-closet',
    scene: 'home',
    position: [-5.8, 0, -0.8],
    radius: 2,
    prompt: 'Open your wardrobe',
    onInteract: () => {
      const s = useGame.getState()
      const owned = s.dayLife.outfits
      s.openDialogue({
        name: 'Closet',
        text: 'Pick something to wear. Outfits you buy downtown show up here.',
        options: [
          ...owned.map((o) => ({
            label: o.id === s.dayLife.wearing ? `${o.label} (wearing)` : `Wear ${o.label}`,
            action: () => useGame.getState().dayAct({ type: 'change-outfit', outfitId: o.id }),
            close: true as const,
          })),
          {
            label: 'Buy a casual set later at the café district ($45)',
            action: () => {
              const g = useGame.getState()
              if (g.dayLife.outfits.some((o) => o.id === 'casual')) {
                g.openDialogue({ name: 'Closet', text: 'You already own casual clothes.', options: [{ label: 'OK', close: true }] })
                return
              }
              if (g.cash < 45) {
                g.openDialogue({ name: 'Closet', text: 'Need $45 cash — earn a shift or skip something else.', options: [{ label: 'OK', close: true }] })
                return
              }
              useGame.setState({ cash: Math.round((g.cash - 45) * 100) / 100 })
              g.dayAct({ type: 'unlock-outfit', outfitId: 'casual' })
              g.dayAct({ type: 'change-outfit', outfitId: 'casual' })
            },
            close: true as const,
          },
          { label: 'Close', close: true as const },
        ],
      })
    },
  })
  return null
}

function Couch() {
  useInteractable({
    id: 'home-couch',
    scene: 'home',
    position: [2.4, 0, -3.5],
    radius: 2.2,
    prompt: 'Sit on the couch',
    onInteract: () => {
      const s = useGame.getState()
      if (s.dayLife.sittingId === 'couch') {
        s.dayAct({ type: 'sit', seatId: null })
        return
      }
      s.dayAct({ type: 'sit', seatId: 'couch' })
      s.advanceTime(15)
      s.dayAct({ type: 'tick-needs', deltaMinutes: 0 })
      useGame.setState({
        dayLife: { ...useGame.getState().dayLife, energy: Math.min(100, useGame.getState().dayLife.energy + 6) },
      })
      s.openDialogue({
        name: 'Couch',
        text: 'You sit and scroll. Energy ticks up a little. Phone is still P.',
        options: [{ label: 'Stand', close: true }],
      })
    },
  })
  return null
}

function DeskComputer() {
  useInteractable({
    id: 'home-computer',
    scene: 'home',
    position: [-2.2, 0, -1.4],
    radius: 1.8,
    prompt: 'Use your laptop',
    onInteract: () => {
      useGame.getState().openDialogue({
        name: 'Laptop',
        text: 'Banking, job boards, and class notes live here later. For now: open your phone (P) for accounts and opportunities, or the housing tablet for rent decisions.',
        options: [
          { label: 'Open phone', action: () => useGame.getState().openPhone(), close: true },
          { label: 'Close lid', close: true },
        ],
      })
      useGame.getState().advanceTime(5)
    },
  })
  return null
}

function MailSlot() {
  useInteractable({
    id: 'home-mail',
    scene: 'home',
    position: [0.2, 0, 5],
    radius: 1.8,
    prompt: 'Check your mail',
    onInteract: () => {
      const s = useGame.getState()
      if (handNeighborHome()) return
      const rent = s.recurringBills.find((b) => b.category === 'rent')
      s.openDialogue({
        name: 'Mail',
        text: rent
          ? `Maple reminder: $${rent.amount} rent is on the calendar. Bills clear on your phone when they are due.`
          : 'Nothing waiting.',
        options: [{ label: 'OK', close: true }],
      })
    },
  })
  return null
}

function homeDialogue(): Dialogue {
  const s = useGame.getState()
  const home = s.homeStatus
  const rel = s.relationships['home-jordan']
  const goal = LIFE_GOALS.find((g) => g.id === s.goals[0])
  const tier = rel?.tier ?? 'stranger'

  if (home === 'owned') {
    return {
      name: 'Roommate — Jordan',
      text: 'Wild that we bought this place. Check the housing tablet if you want the payment breakdown.',
      options: [{ label: 'Later', close: true }],
    }
  }

  const intro =
    tier === 'stranger'
      ? `Hey${s.playerName ? `, ${s.playerName}` : ''}! Fridge has food, closet has clothes, bed is sleep. Campus opens for first period — do not skip breakfast if you can help it.`
      : tier === 'acquaintance'
        ? `Morning. ${goal ? `Still chasing ${goal.label}?` : 'How’s the money stuff going?'}`
        : `You’re basically family at this point. I’ve got your back on the next step.`

  const facts = s.lifeFacts
  const options: Dialogue['options'] = []
  if (facts.jordanLoan > 0) {
    options.push({
      label: `Repay $${facts.jordanLoan.toFixed(0)}`,
      action: () => {
        const err = useGame.getState().play({ type: 'repay-jordan' })
        useGame.getState().openDialogue({
          name: 'Roommate — Jordan',
          text: err ?? 'We’re square.',
          options: [{ label: 'OK', close: true }],
        })
      },
    })
  }
  if (!s.hasJob && Object.values(facts.apps).some((a) => a?.status === 'rejected' || a?.status === 'missed')) {
    options.push({
      label: 'Practice an interview',
      action: () => useGame.getState().play({ type: 'open', activity: { kind: 'practice' } }),
      close: true,
    })
  }
  options.push({
    label: 'What’s the day look like?',
    next: {
      name: 'Roommate — Jordan',
      text: 'School in the morning if it is a weekday. Lunch with people who actually talk. After dismissal — work, shop, or drive if you ever buy a car. Sleep here when you are done.',
      options: [{ label: 'Got it', close: true }],
    },
  })
  options.push({ label: 'Later', close: true })

  return { name: 'Roommate — Jordan', text: intro, options }
}

/** Starter home — bedroom + living room with usable furniture. */
function HomeExtras() {
  useInteractable({
    id: 'home-plan',
    scene: 'home',
    position: [0.5, 0, 1.2],
    radius: 1.6,
    prompt: 'Plan your household',
    onInteract: () => {
      const s = useGame.getState()
      const rent = s.recurringBills.find((b) => b.category === 'rent')
      s.openDialogue({
        name: 'Household',
        text: rent ? `Rent of $${rent.amount} is on the calendar. Pay it from the phone when it is due.` : 'No housing bill yet.',
        options: [{ label: 'OK', close: true }],
      })
    },
  })
  useInteractable({
    id: 'home-decor',
    scene: 'home',
    position: [4.2, 0, 1.5],
    radius: 1.6,
    prompt: 'Decorate or manage home',
    onInteract: () => {
      useGame.getState().openDialogue({
        name: 'Home',
        text: 'You straighten the room. Decorating does not change the lease.',
        options: [{ label: 'OK', close: true }],
      })
    },
  })
  return null
}

export function HomeInterior() {
  return (
    <Room w={14} d={12} floor="#d6cfc4" wall="#f3efe8" extraBoxes={[box(-4.2, -3, 1.6, 2.2), box(2.2, -3.6, 2.3, 1), box(5.5, 1.4, 1.1, 3.4), box(-5.6, -0.6, 1.2, 0.7)]}>
      <BedRest />
      <Fridge />
      <Closet />
      <Couch />
      <DeskComputer />
      <MailSlot />

      <Bed position={[-4.2, 0, -3]} />
      <Shelf position={[-6.2, 0, 3.4]} rotation={Math.PI / 2} />
      <Wardrobe position={[-5.8, 0, -0.6]} rotation={Math.PI / 2} />

      <Rug position={[2.2, 0.02, 1.2]} size={[5.5, 4]} color="#b08968" />
      <WallClock position={[2.2, 3.2, -5.8]} />
      <Plant position={[-5.5, 0, 4]} />
      <Chair position={[0.4, 0, -0.8]} rotation={0.4} />
      <Chair position={[3.8, 0, -0.4]} rotation={-0.3} />

      <Sofa position={[2.2, 0, -3.6]} />
      <FridgeUnit position={[6.1, 0, 2.6]} rotation={-Math.PI / 2} />
      <Counter position={[5.5, 0, 1.1]} rotation={-Math.PI / 2} width={1.6} />
      <Stove position={[5.5, 0, 0.1]} rotation={-Math.PI / 2} />
      <Sink position={[5.5, 0, 1.7]} rotation={-Math.PI / 2} />

      <NPC
        id="home-jordan"
        scene="home"
        position={[3.6, 0, 2.0]}
        rotation={Math.PI}
        name="Jordan"
        shirt="#4ade80"
        pants="#1f2937"
        getDialogue={homeDialogue}
      />

      <LearningStation buildingId="home" scene="home" position={[-4.2, 0, 3.6]} />
      <KioskStation
        id="home-automart"
        scene="home"
        position={[5.0, 0, -3.2]}
        label="AUTOMART"
        prompt="Browse car deals"
        color="#7c2d12"
        emissive="#fb923c"
        onOpen={() => useGame.getState().openCarDealScenario()}
      />
      <KioskStation
        id="home-housing"
        scene="home"
        position={[-5.5, 0, -0.2]}
        label="HOUSING"
        prompt="Rent vs buy options"
        color="#1e3a5f"
        emissive="#93c5fd"
        onOpen={() => useGame.getState().openHomeDealScenario()}
      />
      <HomeExtras />
      <NPC
        id="home-mom"
        scene="home"
        position={[-1.2, 0, 2.4]}
        name="Mom"
        shirt="#f59e0b"
        pants="#44403c"
        getDialogue={() => ({
          name: 'Mom',
          text: 'Dinner is whenever you cook it. Rent still shows up whether the place looks decorated.',
          options: [{ label: 'OK', close: true }],
        })}
      />
      <InteriorExit scene="home" />
    </Room>
  )
}

void OUTFIT_CATALOG
