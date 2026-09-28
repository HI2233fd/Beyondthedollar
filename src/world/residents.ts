import type { LivingNpcDef } from '../life/day/schedule'

const day = (name: string, id: string, shirt: string, home: [number, number], work: { scene: string; x: number; z: number }, chatter: string, traits?: string): LivingNpcDef => ({
  id,
  name,
  role: 'worker',
  shirt,
  pants: '#334155',
  route: [
    { from: 0, to: 8 * 60, at: { scene: 'city', x: home[0], z: home[1] } },
    { from: 8 * 60, to: 17 * 60, at: work },
    { from: 17 * 60, to: 24 * 60, at: { scene: 'city', x: home[0], z: home[1] } },
  ],
  chatter: [chatter],
  traits,
})

/** Additional persistent residents. Named story NPCs stay in their original files. */
export const EXTRA_RESIDENTS: LivingNpcDef[] = [
  day('Amina', 'res-amina', '#f97316', [-6, 28], { scene: 'grocery', x: 2, z: 1 }, 'Juniper’s produce is up front.'),
  day('Chris', 'res-chris', '#22c55e', [6, 28], { scene: 'bank', x: 1, z: 1 }, 'The line moves if you have your account ready.'),
  day('Elena', 'res-elena', '#a855f7', [-8, -30], { scene: 'high', x: 1, z: 2 }, 'Ms. Ortiz actually listens.'),
  day('Omar', 'res-omar', '#0ea5e9', [8, -30], { scene: 'college', x: 1, z: 2 }, 'Lab before the assessment.'),
  day('Sofia', 'res-sofia', '#eab308', [20, -50], { scene: 'office', x: -2, z: 1 }, 'Diane wants the brief before the draft.'),
  day('Kai', 'res-kai', '#14b8a6', [-20, -50], { scene: 'commons', x: 0, z: 1 }, 'Commons is for making something, not hovering.'),
  day('Nina', 'res-nina', '#fb7185', [40, 16], { scene: 'kitchen', x: 1, z: 1 }, 'Carmen runs the card once.'),
  day('Leo', 'res-leo', '#38bdf8', [40, -8], { scene: 'motors', x: 0, z: 2 }, 'Test drive is not a sale.'),
  day('Hana', 'res-hana', '#c084fc', [40, -16], { scene: 'lantern', x: 2, z: 2 }, 'Lee will not pay a skipped rehearsal.'),
  day('Idris', 'res-idris', '#f59e0b', [-40, 16], { scene: 'workshop', x: 2, z: 1 }, 'Parcel first, then the walk.'),
  day('Greta', 'res-greta', '#94a3b8', [-40, -16], { scene: 'clinic', x: 0, z: 1 }, 'Dr. Chen signs for supplies, not symptoms.'),
  day('Noah', 'res-noah', '#64748b', [-40, 6], { scene: 'townhouse', x: 1, z: 2 }, 'Touring Willow does not sign the lease.'),
  day('Priya N.', 'res-priya', '#16a34a', [20, 22], { scene: 'apartments', x: 1, z: 2 }, 'Juniper rent is the number on the lease, not the flyer.'),
  day('Quinn', 'res-quinn', '#b45309', [-66, 14], { scene: 'city', x: -68, z: 10 }, 'The stall only sells what was stocked.'),
  day('Samir', 'res-samir', '#1d4ed8', [60, 16], { scene: 'city', x: 68, z: 12 }, 'Fuel price is on the pump before you pay.'),
  day('Tara', 'res-tara', '#065f46', [-66, 30], { scene: 'city', x: -70, z: 34 }, 'The garden keeps what we finish.'),
  day('Wes', 'res-wes', '#7c2d12', [4, -26], { scene: 'cafe', x: 2, z: 2 }, 'Dev wants the ticket, then the cup, then the table.', 'Practical, and impatient if you skip a step.'),
  day('Yuki', 'res-yuki', '#334155', [-4, 8], { scene: 'city', x: 0, z: 24 }, 'Bus fare is small. The time still passes.'),
]
