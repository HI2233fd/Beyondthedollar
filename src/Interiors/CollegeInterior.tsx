import { Room, InteriorExit } from './Room'
import { NPC } from '../NPC'
import { box } from '../collision'
import type { Dialogue, DialogueOption } from '../GameState'

const NAME = 'College Counselor — Ms. Alvarez'

function collegeDialogue(): Dialogue {
  const leave: DialogueOption = { label: 'Leave', close: true }
  // Build the menu once, then reference it from sub-answers (cyclic, not
  // recursive) so opening the dialogue never overflows the stack.
  const menu: Dialogue = {
    name: NAME,
    text: 'What are you thinking about after high school?',
    options: [],
  }
  menu.options = [
    {
      label: 'Explore college majors',
      next: {
        name: NAME,
        text: 'Popular majors include Computer Science, Nursing, Business, and Engineering. Pick something you enjoy and that has strong job demand — both matter.',
        options: [{ label: 'Ask something else', next: menu }, leave],
      },
    },
    {
      label: 'View tuition costs',
      next: {
        name: NAME,
        text: 'Community college runs about $4,000/year; a public university about $11,000/year in-state. Tuition, housing, and books all add up — plan ahead so you borrow as little as possible.',
        options: [{ label: 'Ask something else', next: menu }, leave],
      },
    },
    {
      label: 'Learn about scholarships',
      next: {
        name: NAME,
        text: 'Scholarships are free money you never repay — merit, need-based, and local community awards. Apply to many; even small ones add up and reduce loans.',
        options: [{ label: 'Ask something else', next: menu }, leave],
      },
    },
    leave,
  ]
  return menu
}

export function CollegeInterior() {
  return (
    <Room
      w={16}
      d={13}
      floor="#cdd6df"
      wall="#eef2f6"
      extraBoxes={[box(0, -3.2, 6, 1.4), box(-6, 0, 1, 6)]}
    >
      {/* Admissions / counseling desk */}
      <mesh position={[0, 0.5, -3.2]} castShadow>
        <boxGeometry args={[6, 1, 1.4]} />
        <meshStandardMaterial color="#7c3f24" />
      </mesh>
      <mesh position={[0, 1.05, -3.2]}>
        <boxGeometry args={[6, 0.08, 1.6]} />
        <meshStandardMaterial color="#5a2d18" />
      </mesh>
      {/* Banner */}
      <mesh position={[0, 3.1, -6.3]}>
        <boxGeometry args={[8, 1.6, 0.1]} />
        <meshStandardMaterial color="#b91c1c" emissive="#7f1d1d" emissiveIntensity={0.25} />
      </mesh>

      {/* Lobby seating */}
      {[-5, 5].map((x) => (
        <mesh key={x} position={[x, 0.35, 2.5]} castShadow>
          <boxGeometry args={[2.4, 0.5, 0.9]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
      ))}
      {/* Potted plant */}
      <group position={[6, 0, -1]}>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.35, 0.28, 0.6, 10]} />
          <meshStandardMaterial color="#8b5e3c" />
        </mesh>
        <mesh position={[0, 1, 0]}>
          <icosahedronGeometry args={[0.7, 1]} />
          <meshStandardMaterial color="#3f7d44" flatShading />
        </mesh>
      </group>

      <NPC
        id="college-counselor"
        scene="college"
        position={[0, 0, -2.2]}
        name="Ms. Alvarez"
        shirt="#7c3aed"
        pants="#312e81"
        skin="#c68642"
        getDialogue={collegeDialogue}
      />

      <InteriorExit scene="college" />
    </Room>
  )
}
