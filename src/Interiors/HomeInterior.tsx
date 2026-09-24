import { Room, InteriorExit } from './Room'
import { NPC } from '../NPC'
import { Chair, Plant, Rug, WallClock } from '../props'
import { LearningStation } from '../curriculum/LearningStation'
import { KioskStation } from '../simulation/KioskStation'
import { useGame, type Dialogue } from '../GameState'
import { LIFE_GOALS } from '../life/types'

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
      ? `Hey${s.playerName ? `, ${s.playerName}` : ''}! First day energy. Your room’s that way — then hit the streets.`
      : tier === 'acquaintance'
        ? `Good to see you again. ${goal ? `Still chasing ${goal.label}?` : 'How’s the money stuff going?'}`
        : `You’re basically family at this point. I’ve got your back on the next step.`

  return {
    name: 'Roommate — Jordan',
    text: intro,
    options: [
      {
        label: 'What should I do today?',
        next: {
          name: 'Roommate — Jordan',
          text:
            goal?.id === 'education'
              ? 'Swing by Merridian College, then open checking at FirstCity so tuition talk is real.'
              : goal?.id === 'investing'
                ? 'Bank account → job → savings cushion → INVEST desk. Don’t skip the cushion.'
                : 'Explore the block, open checking at FirstCity Bank, then interview Diane at Summit for your first paycheck.',
          options: [
            {
              label: 'Thanks — I’ll start',
              action: () => {
                useGame.getState().completeMissionObjective('first-day', 'first-opportunity')
                useGame.getState().awardXp(10, 'Jordan tip')
              },
              close: true,
            },
          ],
        },
      },
      {
        label: 'Any money tip?',
        next: {
          name: 'Roommate — Jordan',
          text: 'Keep lease/mortgage papers in one folder. Surprise bills hurt less when you can find your stuff.',
          options: [{ label: 'Thanks', close: true }],
        },
      },
      { label: 'Later', close: true },
    ],
  }
}

/** Starter home — bedroom + living room with car/home kiosks. */
export function HomeInterior() {
  return (
    <Room w={14} d={12} floor="#d6cfc4" wall="#f3efe8">
      {/* —— Bedroom (west side) —— */}
      <group position={[-3.8, 0, -2.2]}>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[5.2, 4.4]} />
          <meshStandardMaterial color="#c4b5a0" />
        </mesh>
        {/* Bed */}
        <mesh position={[-0.6, 0.35, -0.8]} castShadow>
          <boxGeometry args={[2.2, 0.35, 2.8]} />
          <meshStandardMaterial color="#5b7c99" roughness={0.7} />
        </mesh>
        <mesh position={[-0.6, 0.62, -1.7]} castShadow>
          <boxGeometry args={[2.2, 0.35, 0.55]} />
          <meshStandardMaterial color="#e8eef5" />
        </mesh>
        <mesh position={[-0.6, 0.55, -0.5]} castShadow>
          <boxGeometry args={[2.0, 0.12, 1.6]} />
          <meshStandardMaterial color="#93c5fd" />
        </mesh>
        {/* Desk + lamp */}
        <mesh position={[1.6, 0.55, 0.6]} castShadow>
          <boxGeometry args={[1.4, 0.08, 0.7]} />
          <meshStandardMaterial color="#7c5a3a" />
        </mesh>
        <mesh position={[1.1, 0.28, 0.6]} castShadow>
          <boxGeometry args={[0.08, 0.55, 0.08]} />
          <meshStandardMaterial color="#5c4030" />
        </mesh>
        <mesh position={[2.1, 0.28, 0.6]} castShadow>
          <boxGeometry args={[0.08, 0.55, 0.08]} />
          <meshStandardMaterial color="#5c4030" />
        </mesh>
        <mesh position={[1.9, 0.95, 0.4]} castShadow>
          <cylinderGeometry args={[0.06, 0.08, 0.4, 8]} />
          <meshStandardMaterial color="#d6d3d1" />
        </mesh>
        <mesh position={[1.9, 1.2, 0.4]}>
          <sphereGeometry args={[0.14, 12, 12]} />
          <meshStandardMaterial color="#fef3c7" emissive="#fde68a" emissiveIntensity={0.5} />
        </mesh>
        <pointLight position={[1.9, 1.25, 0.4]} intensity={5} distance={6} color="#fff4d6" />
        {/* Closet / dresser */}
        <mesh position={[-2.0, 0.85, 1.4]} castShadow>
          <boxGeometry args={[1.3, 1.7, 0.55]} />
          <meshStandardMaterial color="#6b5344" />
        </mesh>
        <mesh position={[0.2, 1.4, -2.0]} castShadow>
          <boxGeometry args={[1.8, 1.2, 0.12]} />
          <meshStandardMaterial color="#7dd3fc" transparent opacity={0.35} />
        </mesh>
      </group>

      {/* Living room */}
      <Rug position={[2.2, 0.02, 1.2]} size={[5.5, 4]} color="#b08968" />
      <Rug position={[-3.6, 0.02, 3.6]} size={[2.4, 1.8]} color="#a8b5c4" />
      <WallClock position={[2.2, 3.2, -5.8]} />
      <Plant position={[-5.5, 0, 4]} />
      <Plant position={[5.2, 0, 3.5]} />
      <Plant position={[5.4, 0, -4.2]} scale={0.7} />
      <Chair position={[0.4, 0, -0.8]} rotation={0.4} />
      <Chair position={[3.8, 0, -0.4]} rotation={-0.3} />
      <Chair position={[1.2, 0, 2.4]} rotation={2.4} color="#57534e" />

      {/* Sofa */}
      <mesh position={[2.4, 0.45, -3.8]} castShadow>
        <boxGeometry args={[4.2, 0.9, 1.4]} />
        <meshStandardMaterial color="#6b7c8f" />
      </mesh>
      <mesh position={[2.4, 0.95, -4.3]} castShadow>
        <boxGeometry args={[4.2, 0.7, 0.35]} />
        <meshStandardMaterial color="#5a6b7d" />
      </mesh>
      {/* Coffee table + lamp */}
      <mesh position={[2.4, 0.28, -1.8]} castShadow>
        <boxGeometry args={[1.6, 0.12, 0.8]} />
        <meshStandardMaterial color="#7c5a3a" />
      </mesh>
      <mesh position={[-5.2, 0.7, 1.2]} castShadow>
        <cylinderGeometry args={[0.18, 0.22, 1.2, 10]} />
        <meshStandardMaterial color="#d6d3d1" />
      </mesh>
      <mesh position={[-5.2, 1.4, 1.2]}>
        <cylinderGeometry args={[0.35, 0.28, 0.28, 12]} />
        <meshStandardMaterial color="#fef3c7" emissive="#fde68a" emissiveIntensity={0.35} />
      </mesh>
      <pointLight position={[-5.2, 1.55, 1.2]} intensity={6} distance={8} color="#fff4d6" />

      {/* Kitchenette strip */}
      <mesh position={[5.2, 0.55, 1.5]} castShadow>
        <boxGeometry args={[1.6, 1.1, 3.2]} />
        <meshStandardMaterial color="#e7e5e4" />
      </mesh>
      <mesh position={[5.2, 1.15, 1.5]}>
        <boxGeometry args={[1.65, 0.08, 3.25]} />
        <meshStandardMaterial color="#a8a29e" />
      </mesh>

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
      <InteriorExit scene="home" />
    </Room>
  )
}
