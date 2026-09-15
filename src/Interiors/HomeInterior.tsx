import { Room, InteriorExit } from './Room'
import { NPC } from '../NPC'
import { Chair, Plant, Rug, WallClock } from '../props'
import { LearningStation } from '../curriculum/LearningStation'
import { KioskStation } from '../simulation/KioskStation'
import { useGame, type Dialogue } from '../GameState'

function homeDialogue(): Dialogue {
  const home = useGame.getState().homeStatus
  return {
    name: 'Roommate — Jordan',
    text:
      home === 'owned'
        ? 'Wild that we bought this place. Check the housing tablet if you want the payment breakdown.'
        : 'Hey! AutoMart tablet for cars, housing tablet for rent-vs-buy, and LEARN for course stuff.',
    options: [
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

/** Home apartment — car/home purchase kiosks (no new exterior geometry). */
export function HomeInterior() {
  return (
    <Room w={12} d={11} floor="#d6cfc4" wall="#f3efe8">
      <Rug position={[0, 0.02, 0.5]} size={[6, 4]} color="#b08968" />
      <WallClock position={[0, 3.2, -5.3]} />
      <Plant position={[-4.5, 0, -4]} />
      <Plant position={[4.2, 0, 3.5]} />
      <Chair position={[-2.2, 0, -1.5]} rotation={0.4} />
      <Chair position={[2.4, 0, -1.2]} rotation={-0.3} />

      <mesh position={[0, 0.45, -3.6]} castShadow>
        <boxGeometry args={[4.2, 0.9, 1.4]} />
        <meshStandardMaterial color="#6b7c8f" />
      </mesh>

      <NPC
        id="home-jordan"
        scene="home"
        position={[3.2, 0, 1.2]}
        rotation={Math.PI}
        name="Jordan"
        shirt="#4ade80"
        pants="#1f2937"
        getDialogue={homeDialogue}
      />

      <LearningStation buildingId="home" scene="home" position={[-3.5, 0, 2.8]} />
      <KioskStation
        id="home-automart"
        scene="home"
        position={[4.2, 0, -2.8]}
        label="AUTOMART"
        prompt="Browse car deals"
        color="#7c2d12"
        emissive="#fb923c"
        onOpen={() => useGame.getState().openCarDealScenario()}
      />
      <KioskStation
        id="home-housing"
        scene="home"
        position={[-4.4, 0, -1.2]}
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
