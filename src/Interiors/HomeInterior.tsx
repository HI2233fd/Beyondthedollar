import { Room, InteriorExit } from './Room'
import { NPC } from '../NPC'
import { Chair, Plant, Rug, WallClock } from '../props'
import { LearningStation } from '../curriculum/LearningStation'
import type { Dialogue } from '../GameState'

function homeDialogue(): Dialogue {
  return {
    name: 'Roommate — Jordan',
    text: 'Hey! The LEARN desk has course lessons for home topics — insurance, housing, cars, and scams. Want a tip while you are here?',
    options: [
      {
        label: 'Any money tip?',
        next: {
          name: 'Roommate — Jordan',
          text: 'Keep important mail (lease, insurance cards) in one folder. Scammers love chaos — organized people catch weird charges faster.',
          options: [{ label: 'Thanks', close: true }],
        },
      },
      { label: 'Later', close: true },
    ],
  }
}

/** Home apartment interior — hosts Units 17–19 and 21 learning station. */
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
      <InteriorExit scene="home" />
    </Room>
  )
}
