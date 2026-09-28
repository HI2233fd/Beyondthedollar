import { Text } from '@react-three/drei'
import { Room, InteriorExit } from '../Interiors/Room'
import { NPC } from '../NPC'
import { Chair, Plant } from '../props'
import { box } from '../collision'
import { useGame, type Dialogue } from '../GameState'
import { useInteractable } from '../InteractionSystem'
import { RENT_MONTHLY, HOME_DOWN_PAYMENT } from '../GameState'
import { CARS, FINANCE, monthlyPayment } from '../life/play/logic'
import { applyMoney, confirmPurchase } from './pay'

const ROOM = { w: 22, d: 22 }
const EXIT_Z = 9.2

function Station({
  id,
  scene,
  position,
  prompt,
  onInteract,
  color = '#94a3b8',
  size = [1.4, 0.9, 0.8] as [number, number, number],
}: {
  id: string
  scene: Parameters<typeof useInteractable>[0]['scene']
  position: [number, number, number]
  prompt: string
  onInteract: () => void
  color?: string
  size?: [number, number, number]
}) {
  useInteractable({ id, scene, position, radius: 2.1, prompt, onInteract })
  return (
    <mesh position={[position[0], size[1] / 2, position[2]]} castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

function WallSign({ text, z = -10.6, color = '#0f172a' }: { text: string; z?: number; color?: string }) {
  return (
    <Text position={[0, 3.1, z]} fontSize={0.38} color={color} anchorX="center" maxWidth={16}>
      {text}
    </Text>
  )
}

function say(name: string, text: string) {
  useGame.getState().openDialogue({ name, text, options: [{ label: 'OK', close: true }] })
}

export function HighInterior() {
  const desks = [
    [-6, -4],
    [-4.2, -4],
    [-6, -6],
    [-4.2, -6],
    [4.2, -4],
    [6, -4],
    [4.2, -6],
    [6, -6],
  ]
  return (
    <Room w={ROOM.w} d={ROOM.d} floor="#e7e0d6" wall="#f4efe8" extraBoxes={[box(0, -8, 8, 0.4)]}>
      <WallSign text="YOUR NEXT CHAPTER STARTS WITH A CONVERSATION" color="#7c2d12" />
      {desks.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.4, 0]} castShadow>
            <boxGeometry args={[1.1, 0.08, 0.7]} />
            <meshStandardMaterial color="#8a5a3b" />
          </mesh>
          <Chair position={[0, 0, 0.55]} rotation={Math.PI} />
        </group>
      ))}
      <Station
        id="high-jobs"
        scene="high"
        position={[7, 0, 1]}
        prompt="Read the community jobs board"
        color="#fef3c7"
        onInteract={() => useGame.getState().play({ type: 'open', activity: { kind: 'posting', employerId: 'bean' } })}
      />
      <NPC
        id="ms-ortiz"
        scene="high"
        position={[-1.2, 0, -1.2]}
        name="Ms. Ortiz"
        shirt="#b91c1c"
        pants="#1f2937"
        getDialogue={() => ({
          name: 'Ms. Ortiz',
          text: 'I keep office hours here. The jobs board is real work, not a poster.',
          options: [{ label: 'Thanks', close: true }],
        })}
      />
      <Plant position={[-9, 0, 4]} />
      <InteriorExit scene="high" z={EXIT_Z} />
    </Room>
  )
}

export function CommonsInterior() {
  const step = (n: number, label: string) => {
    const s = useGame.getState()
    if (s.worldSim.commonsStep < n - 1) {
      say('Commons', 'Do the stations in order: brief, workstation, commission, then review.')
      return
    }
    s.patchWorld({ commonsStep: n })
    if (n < 4) say('Commons', label)
    else if (s.lifeFacts.employerId === 'summit' && s.hasJob) {
      const err = s.play({ type: 'shift', employerId: 'summit', accuracy: 1 })
      if (err) say('Commons', err)
    } else {
      const err = applyMoney(0, 'Commons review', 'commons-review-xp')
      if (!err) s.awardXp(20, 'Commons review')
      say('Supervisor', err ?? 'Review noted. When you have an office job, this same walk pays through payroll.')
    }
  }
  return (
    <Room w={ROOM.w} d={ROOM.d} floor="#e7e5e4" wall="#f5f5f4" extraBoxes={[box(-4, -3, 3, 1.2), box(4, -3, 3, 1.2)]}>
      <WallSign text="COMMONS / MAKE SOMETHING TOGETHER" />
      <Station id="com-brief" scene="commons" position={[-4, 0, -3]} prompt="Read the brief" color="#44403c" onInteract={() => step(1, 'Brief read. Take it to a workstation.')} />
      <Station id="com-desk" scene="commons" position={[0, 0, -3]} prompt="Use workstation" color="#1e293b" onInteract={() => step(2, 'Workstation is yours. Work the commission next.')} />
      <Station id="com-make" scene="commons" position={[4, 0, -3]} prompt="Work on a design commission" color="#b45309" onInteract={() => step(3, 'Commission drafted. Supervisor review is the last stop.')} />
      <Station id="com-review" scene="commons" position={[0, 0, 2]} prompt="Supervisor review" color="#0f766e" onInteract={() => step(4, '')} />
      <InteriorExit scene="commons" z={EXIT_Z} />
    </Room>
  )
}

function leaseTalk(which: 'apartments' | 'townhouse') {
  const s = useGame.getState()
  const flag = which === 'apartments' ? 'apartmentToured' : 'townhouseToured'
  s.patchWorld({ [flag]: true })
  const rent = s.recurringBills.find((b) => b.category === 'rent')
  s.openDialogue({
    name: which === 'apartments' ? 'Juniper lease' : 'Willow lease',
    text: `Looking is free. Rent on file is $${rent?.amount ?? RENT_MONTHLY}/mo. Buying later asks for about $${HOME_DOWN_PAYMENT} down. Nothing is signed until you confirm the housing decision.`,
    options: [
      { label: 'Review the housing decision', action: () => useGame.getState().openHomeDealScenario(), close: true },
      { label: 'Keep touring', close: true },
    ],
  })
}

export function ApartmentsInterior() {
  return (
    <Room w={ROOM.w} d={ROOM.d} floor="#e8dfd4" wall="#f6f1ea">
      <ResidentialBits scene="apartments" />
      <Station id="apt-lease" scene="apartments" position={[2, 0, 2]} prompt="Read the apartment lease" color="#e7e5e4" onInteract={() => leaseTalk('apartments')} />
      <InteriorExit scene="apartments" z={EXIT_Z} />
    </Room>
  )
}

export function TownhouseInterior() {
  return (
    <Room w={ROOM.w} d={ROOM.d} floor="#e6dccb" wall="#f7f3ec">
      <ResidentialBits scene="townhouse" />
      <mesh position={[3, 0.45, 1]} castShadow>
        <boxGeometry args={[2.2, 0.1, 1.2]} />
        <meshStandardMaterial color="#a16207" />
      </mesh>
      <Station id="th-lease" scene="townhouse" position={[2, 0, 3]} prompt="Review townhouse lease" color="#e7e5e4" onInteract={() => leaseTalk('townhouse')} />
      <InteriorExit scene="townhouse" z={EXIT_Z} />
    </Room>
  )
}

function ResidentialBits({ scene }: { scene: 'apartments' | 'townhouse' }) {
  const rest = scene === 'townhouse' ? 'Rest at home' : 'Rest in your bedroom'
  const clothes = scene === 'townhouse' ? 'Change clothes' : 'Open your wardrobe'
  return (
    <group>
      <mesh position={[-6, 0.4, -5]} castShadow>
        <boxGeometry args={[2.2, 0.5, 1.4]} />
        <meshStandardMaterial color="#e7e5e4" />
      </mesh>
      <mesh position={[-6, 0.7, -5.3]} castShadow>
        <boxGeometry args={[2, 0.2, 0.5]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[5, 0.45, -4]} castShadow>
        <boxGeometry args={[2.4, 0.7, 1]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      <mesh position={[6.5, 0.7, 2]} castShadow>
        <boxGeometry args={[1.2, 1.4, 0.7]} />
        <meshStandardMaterial color="#d6d3d1" />
      </mesh>
      <mesh position={[-2, 0.75, 0]} castShadow>
        <boxGeometry args={[1.2, 1.5, 0.5]} />
        <meshStandardMaterial color="#44403c" />
      </mesh>
      <Station
        id={`${scene}-bed`}
        scene={scene}
        position={[-6, 0, -5]}
        prompt={rest}
        color="#e7e5e4"
        onInteract={() => {
          const err = useGame.getState().dayAct({ type: 'sleep' })
          if (err) say('Home', err)
        }}
      />
      <Station
        id={`${scene}-closet`}
        scene={scene}
        position={[-2, 0, 0]}
        prompt={clothes}
        color="#44403c"
        onInteract={() => openWardrobe()}
      />
      <Station
        id={`${scene}-cook`}
        scene={scene}
        position={[6.5, 0, 2]}
        prompt="Cook a meal"
        color="#d6d3d1"
        onInteract={() => cookMeal()}
      />
      <Station id={`${scene}-plan`} scene={scene} position={[1, 0, -2]} prompt="Plan your household" color="#1e3a5f" onInteract={() => planHome()} />
      <Station id={`${scene}-decor`} scene={scene} position={[4, 0, -2]} prompt="Decorate or manage home" color="#b45309" onInteract={() => say('Home', 'You shift a lamp and a plant. The lease and the bills are still the part that costs money.')} />
      <Plant position={[8, 0, -6]} />
    </group>
  )
}

function openWardrobe() {
  const s = useGame.getState()
  s.openDialogue({
    name: 'Wardrobe',
    text: 'Change clothes. Your name, money, and progress stay put.',
    options: [
      ...s.dayLife.outfits.map((o) => ({
        label: o.id === s.dayLife.wearing ? `${o.label} (wearing)` : `Wear ${o.label}`,
        action: () => useGame.getState().dayAct({ type: 'change-outfit', outfitId: o.id }),
        close: true as const,
      })),
      { label: 'Close', close: true as const },
    ],
  })
}

function cookMeal() {
  const s = useGame.getState()
  if (!s.dayLife.pantry.length) {
    say('Kitchen', 'Nothing to cook. Groceries you buy show up in the pantry.')
    return
  }
  s.openDialogue({
    name: 'Kitchen',
    text: 'Cook from what you already bought.',
    options: [
      ...s.dayLife.pantry.slice(0, 5).map((f) => ({
        label: `Cook ${f.label}`,
        action: () => useGame.getState().dayAct({ type: 'eat', foodId: f.id }),
        close: true as const,
      })),
      { label: 'Cancel', close: true as const },
    ],
  })
}

function planHome() {
  const s = useGame.getState()
  const rent = s.recurringBills.find((b) => b.category === 'rent')
  say('Household', rent ? `Rent of $${rent.amount} is already on the calendar. Bills clear from the phone when they are due.` : 'No housing bill is posted yet.')
}

export function MotorsInterior() {
  const compact = CARS[0]
  const sedan = CARS[1]
  const quote = (car: (typeof CARS)[number]) => {
    const offer = FINANCE[0]
    const principal = Math.max(0, car.price - offer.down)
    const pay = monthlyPayment(principal, offer.apr, offer.months)
    return `${car.name}: price $${car.price.toLocaleString()}, down $${offer.down.toLocaleString()}, about $${pay.toFixed(0)}/mo for ${offer.months} months, insurance $${car.insurance}/mo, upkeep $${car.upkeep}/mo. ${car.note}`
  }
  return (
    <Room w={ROOM.w} d={ROOM.d} floor="#e2e8f0" wall="#f8fafc" extraBoxes={[box(-4, -2, 4.2, 2), box(4, -2, 4.2, 2)]}>
      <WallSign text="TRY IT. MAKE IT YOURS." color="#0369a1" />
      <group position={[-4, 0, -2]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[3.2, 0.7, 1.5]} />
          <meshStandardMaterial color="#1d4ed8" metalness={0.4} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.95, -0.1]}>
          <boxGeometry args={[2, 0.5, 1.2]} />
          <meshStandardMaterial color="#93c5fd" metalness={0.2} roughness={0.1} />
        </mesh>
      </group>
      <group position={[4, 0, -2]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[3.8, 0.75, 1.6]} />
          <meshStandardMaterial color="#334155" metalness={0.45} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.05, -0.05]}>
          <boxGeometry args={[2.2, 0.55, 1.3]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.2} roughness={0.1} />
        </mesh>
      </group>
      <Station
        id="motors-compare"
        scene="motors"
        position={[0, 0, 1]}
        prompt="Compare vehicles"
        color="#0f172a"
        onInteract={() => say('Morgan', `${quote(compact)}\n\n${quote(sedan)}`)}
      />
      <Station
        id="motors-drive"
        scene="motors"
        position={[-4, 0, 2]}
        prompt="Test drive"
        color="#1d4ed8"
        onInteract={() => {
          const s = useGame.getState()
          s.patchWorld({ testDrive: true })
          s.dayAct({
            type: 'add-vehicle',
            vehicle: { id: 'testdrive', modelId: compact.id, label: `${compact.name} (test drive)`, color: '#1d4ed8', x: 40, z: 8, yaw: 0 },
          })
          s.enterScene('city', { pos: [40, 0, 8], yaw: 0 })
          s.dayAct({ type: 'enter-vehicle', vehicleId: 'testdrive' })
        }}
      />
      <Station
        id="motors-buy"
        scene="motors"
        position={[4, 0, 2]}
        prompt="Buy vehicle"
        color="#0f766e"
        onInteract={() => useGame.getState().play({ type: 'open', activity: { kind: 'car' } })}
      />
      <Station
        id="motors-finance"
        scene="motors"
        position={[0, 0, 4]}
        prompt="Review financing"
        color="#334155"
        onInteract={() => say('Morgan', quote(sedan))}
      />
      <NPC
        id="morgan"
        scene="motors"
        position={[1.5, 0, 3]}
        name="Morgan"
        shirt="#0369a1"
        pants="#1e293b"
        getDialogue={() => ({ name: 'Morgan', text: 'A test drive does not buy the car. The numbers are on the desk.', options: [{ label: 'OK', close: true }] } satisfies Dialogue)}
      />
      <InteriorExit scene="motors" z={EXIT_Z} />
    </Room>
  )
}

const MEALS = [
  { id: 'harbor-bowl', name: 'Harbor grain bowl', price: 11, hunger: 34 },
  { id: 'harbor-plate', name: 'Supper plate', price: 14, hunger: 42 },
]

export function KitchenInterior() {
  return (
    <Room w={ROOM.w} d={ROOM.d} floor="#f3e6d8" wall="#f8efe6" extraBoxes={[box(0, -6, 8, 1)]}>
      {[-4, 0, 4].map((x) =>
        [-1, 2].map((z) => (
          <group key={`${x}-${z}`} position={[x, 0, z]}>
            <mesh position={[0, 0.45, 0]} castShadow>
              <cylinderGeometry args={[0.7, 0.7, 0.08, 12]} />
              <meshStandardMaterial color="#d6d3d1" />
            </mesh>
            <mesh position={[0, 0.52, 0]}>
              <cylinderGeometry args={[0.22, 0.22, 0.04, 10]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
            <Chair position={[0.7, 0, 0]} />
          </group>
        )),
      )}
      <Station
        id="kit-menu"
        scene="kitchen"
        position={[0, 0, -6]}
        prompt="View menu"
        color="#9a3412"
        size={[4, 1, 1]}
        onInteract={() => say('Carmen', MEALS.map((m) => `${m.name} $${m.price.toFixed(2)}`).join(' · '))}
      />
      <Station
        id="kit-order"
        scene="kitchen"
        position={[-2, 0, -4]}
        prompt="Order a meal"
        color="#7c2d12"
        onInteract={() => {
          const s = useGame.getState()
          s.openDialogue({
            name: 'Carmen',
            text: 'Order once. Hunger comes from the meal you actually pay for.',
            options: [
              ...MEALS.map((m) => ({
                label: `${m.name} $${m.price.toFixed(2)}`,
                action: () => {
                  confirmPurchase('Carmen', m.name, m.price, () => {
                    const err = applyMoney(-m.price, m.name)
                    if (err) {
                      say('Carmen', err)
                      return
                    }
                    const id = `${m.id}-${useGame.getState().totalMinutes}`
                    useGame.getState().dayAct({
                      type: 'buy-food',
                      items: [{ id, kind: 'cafe-meal', label: m.name, hungerRestore: m.hunger, boughtAt: useGame.getState().totalMinutes }],
                    })
                    useGame.getState().dayAct({ type: 'eat', foodId: id })
                  })
                },
              })),
              { label: 'Cancel', close: true },
            ],
          })
        }}
      />
      <Station id="kit-pickup" scene="kitchen" position={[2, 0, -4]} prompt="Pick up the meal" color="#fdba74" onInteract={() => say('Carmen', 'If you ordered, it is already in front of you. Otherwise order at the counter first.')} />
      <Station
        id="kit-neighbor"
        scene="kitchen"
        position={[6, 0, -4]}
        prompt="Collect a neighbor’s order"
        color="#e7e5e4"
        onInteract={() => collectNeighbor('Harbor Kitchen')}
      />
      <NPC id="carmen" scene="kitchen" position={[0, 0, -4.5]} name="Carmen" shirt="#9a3412" pants="#44403c" getDialogue={() => ({ name: 'Carmen', text: 'Menu is on the board. I run the card once.', options: [{ label: 'OK', close: true }] })} />
      <InteriorExit scene="kitchen" z={EXIT_Z} />
    </Room>
  )
}

function collectNeighbor(where: string) {
  const s = useGame.getState()
  if (s.worldSim.neighborOrder === 'done') {
    say(where, 'No prepaid order is waiting.')
    return
  }
  if (s.worldSim.neighborOrder === 'carrying') {
    say(where, 'You already have the bag. Hand it over at the address.')
    return
  }
  s.patchWorld({ neighborOrder: 'carrying' })
  say(where, 'Prepaid bag is in your hands. No charge. Deliver it to the family home mail spot.')
}

export function LanternInterior() {
  const chairs = Array.from({ length: 15 }, (_, i) => ({ x: -6 + (i % 5) * 1.6, z: 1 + Math.floor(i / 5) * 1.5 }))
  const advance = (n: number, line: string) => {
    const s = useGame.getState()
    if (s.worldSim.lanternStep < n - 1) {
      say('Lee', 'Rehearse backstage, check the sound desk, then perform.')
      return
    }
    s.patchWorld({ lanternStep: n })
    if (n < 3) say('Lee', line)
    else {
      const err = applyMoney(25, 'Lantern performance', 'lantern-perform')
      if (err) say('Lee', err)
      else {
        s.awardXp(15, 'Lantern performance')
        say('Lee', 'House liked it. $25 is yours, once.')
      }
    }
  }
  return (
    <Room w={ROOM.w} d={ROOM.d} floor="#2a2433" wall="#3b3344" extraBoxes={[box(0, -7, 8, 2)]}>
      <mesh position={[0, 0.4, -7]} castShadow>
        <boxGeometry args={[8, 0.4, 3]} />
        <meshStandardMaterial color="#4c1d4f" />
      </mesh>
      <mesh position={[0, 2.2, -9.2]}>
        <boxGeometry args={[6, 2.4, 0.1]} />
        <meshStandardMaterial color="#7f1d1d" />
      </mesh>
      {chairs.map((c, i) => (
        <mesh key={i} position={[c.x, 0.35, c.z]} castShadow>
          <boxGeometry args={[0.45, 0.5, 0.45]} />
          <meshStandardMaterial color="#3f3f46" />
        </mesh>
      ))}
      <Station id="lan-lee" scene="lantern" position={[6, 0, 2]} prompt="Talk to Lee" color="#581c87" onInteract={() => say('Lee', 'Call is in order: rehearse, sound, then the stage. The fee pays once.')} />
      <Station id="lan-rehearse" scene="lantern" position={[-7, 0, -2]} prompt="Rehearse backstage" color="#44403c" onInteract={() => advance(1, 'Rehearsal done.')} />
      <Station id="lan-sound" scene="lantern" position={[7, 0, -2]} prompt="Check sound desk" color="#1e1b4b" onInteract={() => advance(2, 'Levels are set.')} />
      <Station id="lan-stage" scene="lantern" position={[0, 0, -5]} prompt="Perform on stage" color="#7f1d1d" onInteract={() => advance(3, '')} />
      <NPC id="lee" scene="lantern" position={[6, 0, 3.2]} name="Lee" shirt="#581c87" pants="#1f2937" getDialogue={() => ({ name: 'Lee', text: 'Places. Do not skip the sound check.', options: [{ label: 'OK', close: true }] })} />
      <InteriorExit scene="lantern" z={EXIT_Z} />
    </Room>
  )
}

export function ClinicInterior() {
  return (
    <Room w={ROOM.w} d={ROOM.d} floor="#e7e5e4" wall="#f5f5f4" extraBoxes={[box(-5, -3, 2, 1.2), box(0, -3, 2, 1.2), box(5, -3, 2, 1.2)]}>
      {[-5, 0, 5].map((x) => (
        <mesh key={x} position={[x, 0.45, -3]} castShadow>
          <boxGeometry args={[1.8, 0.5, 0.8]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
      ))}
      <Station
        id="clinic-chen"
        scene="clinic"
        position={[0, 0, 2]}
        prompt="Speak to coordinator"
        color="#0f766e"
        onInteract={() => say('Dr. Chen', 'We take volunteers and supply drops. This is not a hospital sim — bring what the neighborhood asked for.')}
      />
      <Station
        id="clinic-volunteer"
        scene="clinic"
        position={[-4, 0, 2]}
        prompt="Review volunteer opportunity"
        color="#99f6e4"
        onInteract={() => say('Dr. Chen', 'Volunteer hours do not pay cash. They count when a community mission sends you here with supplies.')}
      />
      <Station
        id="clinic-supplies"
        scene="clinic"
        position={[4, 0, 2]}
        prompt="Deliver clinic supplies"
        color="#e7e5e4"
        onInteract={() => {
          const s = useGame.getState()
          if (s.worldSim.courier?.dest === 'clinic' && s.worldSim.courier.stage === 'carrying') {
            const err = applyMoney(18, 'Clinic delivery', `courier-${s.worldSim.courier.id}`)
            s.patchWorld({ courier: null })
            say('Dr. Chen', err ?? 'Supplies received. The delivery fee is paid once.')
            return
          }
          say('Dr. Chen', 'Nothing to sign for. Pick up a parcel at the Foundry if a route is open.')
        }}
      />
      <NPC id="dr-chen" scene="clinic" position={[1.4, 0, 2.4]} name="Dr. Chen" shirt="#0f766e" pants="#e7e5e4" getDialogue={() => ({ name: 'Dr. Chen', text: 'Coordinator desk is open.', options: [{ label: 'OK', close: true }] })} />
      <InteriorExit scene="clinic" z={EXIT_Z} />
    </Room>
  )
}

export function WorkshopInterior() {
  const repair = (n: number, line: string) => {
    const s = useGame.getState()
    if (s.worldSim.workshopStep < n - 1) {
      say('Foundry', 'Read the brief, repair at the bench, then get the review.')
      return
    }
    s.patchWorld({ workshopStep: Math.max(s.worldSim.workshopStep, n) })
    if (n < 3) say('Foundry', line)
    else {
      const employed = s.hasJob && s.lifeFacts.employerId === 'freshmart'
      if (employed) {
        const err = s.play({ type: 'shift', employerId: 'freshmart', accuracy: 1 })
        if (err) say('Foundry', err)
      } else {
        const err = applyMoney(16, 'Foundry repair', 'foundry-repair')
        say('Foundry', err ?? 'Repair signed off. $16 paid once for this job.')
      }
    }
  }
  return (
    <Room w={ROOM.w} d={ROOM.d} floor="#d6d3d1" wall="#e7e5e4" extraBoxes={[box(-4, -4, 3, 1.2)]}>
      <Station id="shop-brief" scene="workshop" position={[-6, 0, 1]} prompt="Read the brief" color="#44403c" onInteract={() => repair(1, 'Job ticket is on the bench.')} />
      <Station id="shop-bench" scene="workshop" position={[-4, 0, -4]} prompt="Repair workbench" color="#78716c" size={[2.4, 1, 1]} onInteract={() => repair(2, 'Part is seated. Get the review.')} />
      <Station id="shop-review" scene="workshop" position={[-1, 0, -2]} prompt="Supervisor review" color="#0f766e" onInteract={() => repair(3, '')} />
      <Station
        id="shop-parcel"
        scene="workshop"
        position={[4, 0, -2]}
        prompt="Collect courier parcel"
        color="#b45309"
        onInteract={() => {
          const s = useGame.getState()
          if (!s.worldSim.courier) {
            say('Dispatch', 'Accept a delivery first.')
            return
          }
          if (s.worldSim.courier.stage === 'carrying') {
            say('Dispatch', 'Parcel is already with you.')
            return
          }
          s.patchWorld({ courier: { ...s.worldSim.courier, stage: 'carrying' } })
          say('Dispatch', 'Parcel in hand. Walk it to the address. Do not expect a second payout.')
        }}
      />
      <Station
        id="shop-dispatch"
        scene="workshop"
        position={[6, 0, 1]}
        prompt="Accept delivery"
        color="#1c1917"
        onInteract={() => {
          const s = useGame.getState()
          if (s.worldSim.courier) {
            say('Dispatch', 'You already have a route.')
            return
          }
          s.patchWorld({ courier: { id: `run-${s.totalMinutes}`, dest: 'clinic', stage: 'accepted' } })
          say('Dispatch', 'Clinic run. Collect the parcel, then deliver it to Dr. Chen.')
        }}
      />
      <Station
        id="shop-stall"
        scene="workshop"
        position={[3, 0, 3]}
        prompt="Register or stock a stall"
        color="#a16207"
        onInteract={() => {
          const s = useGame.getState()
          s.patchWorld({ stallStock: s.worldSim.stallStock + 1 })
          s.advanceTime(20)
          say('Foundry', 'One unit is stocked for the West Park stall. Selling it is a separate walk.')
        }}
      />
      <Station id="shop-neighbor" scene="workshop" position={[7, 0, 3]} prompt="Collect a neighbor’s order" color="#e7e5e4" onInteract={() => collectNeighbor('Foundry')} />
      <InteriorExit scene="workshop" z={EXIT_Z} />
    </Room>
  )
}

