import { Text } from '@react-three/drei'
import { useGame } from '../GameState'
import { useInteractable } from '../InteractionSystem'
import { POIS } from '../cityLayout'
import { applyMoney, confirmPurchase } from './pay'

const BUS_FARE = 2.5
const FUEL_PRICE = 3.4
const STALL_PRICE = 8

export function OutdoorLife() {
  return (
    <group>
      <Fountain />
      <Garden />
      <Stall />
      <Fuel />
      {POIS.buses.map((b) => (
        <BusStop key={b.id} id={b.id} x={b.x} z={b.z} name={b.name} />
      ))}
      {POIS.benches.map((b) => (
        <RestBench key={b.id} id={b.id} x={b.x} z={b.z} />
      ))}
    </group>
  )
}

function Fountain() {
  const f = POIS.fountain
  return (
    <group position={[f.x, 0, f.z]}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[2.2, 2.4, 0.4, 20]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.25, 0.35, 0.8, 10]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.28, 12, 12]} />
        <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={0.4} />
      </mesh>
    </group>
  )
}

function Garden() {
  const g = POIS.garden
  const stage = useGame((s) => s.worldSim.gardenStage)
  useInteractable({
    id: 'community-garden',
    scene: 'city',
    position: [g.x, 0, g.z],
    radius: 2.6,
    prompt: 'Work on the community garden',
    onInteract: () => {
      const s = useGame.getState()
      if (s.worldSim.gardenStage >= 3) {
        s.openDialogue({ name: 'Garden', text: 'The beds are planted and the path is in. It stays that way.', options: [{ label: 'OK', close: true }] })
        return
      }
      const next = s.worldSim.gardenStage + 1
      s.patchWorld({ gardenStage: next })
      s.advanceTime(30)
      const label = ['Beds turned.', 'Path laid.', 'Planting finished.'][next - 1]
      s.openDialogue({ name: 'Garden', text: label, options: [{ label: 'OK', close: true }] })
    },
  })
  return (
    <group position={[g.x, 0, g.z]}>
      {[ -1.2, 0, 1.2].map((x) => (
        <mesh key={x} position={[x, 0.2, 0]} receiveShadow>
          <boxGeometry args={[1, 0.3, 2.2]} />
          <meshStandardMaterial color={stage > 0 ? '#6b3f24' : '#78716c'} />
        </mesh>
      ))}
      {stage >= 2 && (
        <mesh position={[0, 0.08, 1.8]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[4, 0.6]} />
          <meshStandardMaterial color="#d6d3d1" />
        </mesh>
      )}
      {stage >= 3 &&
        [-1.2, 0, 1.2].map((x) => (
          <mesh key={`p${x}`} position={[x, 0.55, 0]}>
            <coneGeometry args={[0.22, 0.5, 6]} />
            <meshStandardMaterial color="#166534" />
          </mesh>
        ))}
      <mesh position={[2, 0.3, 1.2]}>
        <boxGeometry args={[0.5, 0.4, 0.5]} />
        <meshStandardMaterial color="#a16207" />
      </mesh>
    </group>
  )
}

function Stall() {
  const p = POIS.stall
  useInteractable({
    id: 'craft-stall',
    scene: 'city',
    position: [p.x, 0, p.z],
    radius: 2.4,
    prompt: 'Open your craft stall',
    onInteract: () => {
      const s = useGame.getState()
      if (s.worldSim.stallStock <= 0) {
        s.openDialogue({ name: 'Stall', text: 'Nothing stocked. Register a unit at the Foundry Workshop first.', options: [{ label: 'OK', close: true }] })
        return
      }
      s.openDialogue({
        name: 'Stall',
        text: `Sell one unit for $${STALL_PRICE.toFixed(2)}. Stock left: ${s.worldSim.stallStock}. The sale is recorded once.`,
        options: [
          {
            label: 'Confirm',
            action: () => {
              const err = applyMoney(STALL_PRICE, 'Craft stall sale')
              if (err) return
              const now = useGame.getState()
              now.patchWorld({ stallStock: Math.max(0, now.worldSim.stallStock - 1) })
            },
            close: true,
          },
          { label: 'Cancel', close: true },
        ],
      })
    },
  })
  return (
    <group position={[p.x, 0, p.z]}>
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[2.4, 0.08, 1.6]} />
        <meshStandardMaterial color="#b45309" />
      </mesh>
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[1.8, 1, 0.7]} />
        <meshStandardMaterial color="#e7e5e4" />
      </mesh>
      <Text position={[0, 2.1, 0]} fontSize={0.22} color="#fff7ed" anchorX="center">
        MADE IN BELLWETHER
      </Text>
    </group>
  )
}

function Fuel() {
  const p = POIS.fuel
  useInteractable({
    id: 'fuel-pump',
    scene: 'city',
    position: [p.x, 0, p.z],
    radius: 2.4,
    prompt: 'Refuel your car',
    onInteract: () => {
      const s = useGame.getState()
      const eligible = s.carStatus !== 'none' || s.dayLife.vehicles.some((v) => v.id !== 'testdrive') || s.worldSim.testDrive
      if (!eligible) {
        s.openDialogue({ name: 'Pump', text: 'No eligible vehicle. A test drive or a car you own can take fuel.', options: [{ label: 'OK', close: true }] })
        return
      }
      const gallons = 8
      const cost = Math.round(gallons * FUEL_PRICE * 100) / 100
      confirmPurchase('Pump', `${gallons} gallons at $${FUEL_PRICE.toFixed(2)}/gal`, cost, () => {
        const err = applyMoney(-cost, 'Fuel')
        if (err) {
          useGame.getState().openDialogue({ name: 'Pump', text: err, options: [{ label: 'OK', close: true }] })
          return
        }
        useGame.getState().patchWorld({ fuel: Math.min(100, useGame.getState().worldSim.fuel + gallons * 4) })
      })
    },
  })
  return (
    <group position={[p.x, 0, p.z]}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[0.5, 1.6, 0.4]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
      <mesh position={[0.5, 1.3, 0]}>
        <boxGeometry args={[0.8, 0.08, 0.08]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
    </group>
  )
}

function BusStop({ id, x, z, name }: { id: string; x: number; z: number; name: string }) {
  useInteractable({
    id,
    scene: 'city',
    position: [x, 0, z],
    radius: 2.3,
    prompt: 'Take the city bus',
    onInteract: () => {
      const s = useGame.getState()
      s.openDialogue({
        name: name,
        text: `Fare $${BUS_FARE.toFixed(2)}. The ride advances the clock. Pick a neighborhood.`,
        options: [
          ...POIS.buses.map((b) => ({
            label: b.neighborhood,
            action: () => {
              confirmPurchase(name, `Ride to ${b.neighborhood}`, BUS_FARE, () => {
                const err = applyMoney(-BUS_FARE, `Bus to ${b.neighborhood}`)
                if (err) {
                  useGame.getState().openDialogue({ name, text: err, options: [{ label: 'OK', close: true }] })
                  return
                }
                useGame.getState().advanceTime(20)
                useGame.getState().enterScene('city', { pos: [b.x + 2, 0, b.z + 2], yaw: 0 })
              })
            },
          })),
          { label: 'Cancel', close: true },
        ],
      })
    },
  })
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[2.2, 0.1, 1.2]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[-0.9, 0.6, -0.4]}>
        <boxGeometry args={[0.08, 1.2, 0.08]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <Text position={[0, 1.7, 0]} fontSize={0.18} color="#e2e8f0" anchorX="center">
        BUS
      </Text>
    </group>
  )
}

function RestBench({ id, x, z }: { id: string; x: number; z: number }) {
  useInteractable({
    id,
    scene: 'city',
    position: [x, 0, z],
    radius: 1.8,
    prompt: 'Take a quiet break',
    onInteract: () => {
      const wait = (hours: number) => {
        useGame.getState().advanceTime(hours * 60)
        useGame.getState().dayAct({ type: 'tick-needs', deltaMinutes: 0 })
      }
      useGame.getState().openDialogue({
        name: 'Bench',
        text: 'Waiting uses the city clock. It does not pay you.',
        options: [
          { label: 'Wait 1 hour', action: () => wait(1), close: true },
          { label: 'Wait 2 hours', action: () => wait(2), close: true },
          { label: 'Wait 3 hours', action: () => wait(3), close: true },
          { label: 'Cancel', close: true },
        ],
      })
    },
  })
  return (
    <mesh position={[x, 0.4, z]} castShadow>
      <boxGeometry args={[1.2, 0.4, 0.4]} />
      <meshStandardMaterial color="#78716c" />
    </mesh>
  )
}

