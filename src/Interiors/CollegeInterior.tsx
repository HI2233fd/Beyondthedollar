import { Room, InteriorExit } from './Room'
import { NPC } from '../NPC'
import { Guest, Chair, Plant, WallClock } from '../props'
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

      {/* Lobby seating rows */}
      {[-5.5, -4.2, -2.9].map((x) => (
        <Chair key={`r1${x}`} position={[x, 0, 2.4]} rotation={Math.PI} color="#475569" />
      ))}
      {[-5.5, -4.2, -2.9].map((x) => (
        <Chair key={`r2${x}`} position={[x, 0, 3.7]} color="#475569" />
      ))}

      {/* Students waiting */}
      <Guest position={[-5.5, 0, 2.4]} rotation={0} shirt="#2563eb" hair="#3b2f2f" />
      <Guest position={[-2.9, 0, 3.7]} rotation={Math.PI} shirt="#dc2626" skin="#8d5a3c" />
      <Guest position={[4, 0, 2]} rotation={-2.2} shirt="#059669" pants="#1f2937" />

      {/* Bookshelf along the right wall */}
      <group position={[7.2, 0, 0]}>
        <mesh position={[0, 1.4, 0]} castShadow>
          <boxGeometry args={[0.5, 2.8, 5]} />
          <meshStandardMaterial color="#6b4f2a" />
        </mesh>
        {[0.6, 1.4, 2.2].map((y) =>
          [-1.6, -0.5, 0.6, 1.7].map((z) => (
            <mesh key={`${y}-${z}`} position={[-0.28, y, z]}>
              <boxGeometry args={[0.06, 0.5, 0.7]} />
              <meshStandardMaterial color={['#ef4444', '#3b82f6', '#f59e0b', '#10b981'][Math.floor(Math.abs(z))% 4]} />
            </mesh>
          )),
        )}
      </group>

      {/* Bulletin board */}
      <mesh position={[-7.7, 1.8, 0]}>
        <boxGeometry args={[0.1, 1.6, 3]} />
        <meshStandardMaterial color="#8b5e3c" />
      </mesh>
      {[[-0.6, 0.9], [0.5, 0.6], [-0.3, -0.7], [0.6, -0.5]].map(([y, z], i) => (
        <mesh key={i} position={[-7.63, 1.8 + y, z]}>
          <planeGeometry args={[0.5, 0.6]} />
          <meshStandardMaterial color={['#fef3c7', '#dbeafe', '#dcfce7', '#fce7f3'][i]} />
        </mesh>
      ))}

      <Plant position={[6.4, 0, -1]} />
      <Plant position={[-6.6, 0, 4.6]} scale={0.85} />
      <WallClock position={[0, 3.3, -6.24]} />

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
