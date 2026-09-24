import { DEFAULT_LOOK, type CharacterLook, type WorldNpc } from './characterLook'

const FIRST = [
  'Maya', 'Jordan', 'Sam', 'Riley', 'Avery', 'Chris', 'Taylor', 'Morgan', 'Casey', 'Quinn',
  'Alex', 'Jamie', 'Drew', 'Cameron', 'Reese', 'Parker', 'Skyler', 'Rowan', 'Emerson', 'Hayden',
  'Priya', 'Marcus', 'Diane', 'Noah', 'Elena', 'Omar', 'Sofia', 'Kai', 'Nina', 'Leo',
]
const LAST = [
  'Chen', 'Patel', 'Brooks', 'Nguyen', 'Garcia', 'Kim', 'Ali', 'Ross', 'Okoye', 'Singh',
  'Walsh', 'Diaz', 'Berg', 'Sato', 'Clarke', 'Hughes', 'Ibrahim', 'Fernandez', 'Cho', 'Reed',
]

const JOBS = [
  'Barista', 'Bank Teller', 'Office Assistant', 'Retail Associate', 'Tutor', 'Delivery Driver',
  'Junior Analyst', 'Graphic Freelancer', 'Nurse Aide', 'Apprentice Electrician', 'Front Desk',
  'Marketing Intern', 'Library Assistant', 'Gym Attendant', 'Server', 'Software Intern',
]

const PERSONALITIES = [
  'warm & practical',
  'ambitious & blunt',
  'curious & anxious',
  'steady & loyal',
  'creative & restless',
  'cautious & kind',
  'bold & social',
  'quiet & observant',
]

const INTERESTS = [
  'cooking', 'markets', 'running', 'design', 'music', 'gaming', 'volunteering', 'cars',
  'fashion', 'photography', 'basketball', 'startups', 'gardening', 'film', 'coding',
]

const SKINS = ['#f1c27d', '#e0ac69', '#d0996b', '#c68642', '#8d5524', '#5c3317']
const HAIRS = ['#1a1a1a', '#241a12', '#4a3728', '#6b4423', '#c4a574', '#e8e0d5', '#3b2f2f']
const SHIRTS = ['#2563eb', '#059669', '#dc2626', '#7c3aed', '#0f766e', '#ea580c', '#64748b', '#db2777']
const PANTS = ['#1f2937', '#334155', '#3f3f46', '#1e3a5f', '#44403c', '#57534e']
const STYLES: CharacterLook['hairStyle'][] = ['short', 'medium', 'long', 'bun', 'fade']
const FACES: CharacterLook['face'][] = ['soft', 'angular', 'round', 'oval']
const BODIES: CharacterLook['body'][] = ['slim', 'average', 'athletic', 'plus']

function pick<T>(arr: T[], n: number): T {
  return arr[Math.abs(n) % arr.length]
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function generateNpc(seed: string): WorldNpc {
  const h = hash(seed)
  const name = `${pick(FIRST, h)} ${pick(LAST, h >> 3)}`
  const appearance: CharacterLook = {
    ...DEFAULT_LOOK,
    skin: pick(SKINS, h >> 2),
    hair: pick(HAIRS, h >> 4),
    hairStyle: pick(STYLES, h >> 5),
    shirt: pick(SHIRTS, h >> 6),
    pants: pick(PANTS, h >> 7),
    face: pick(FACES, h >> 8),
    body: pick(BODIES, h >> 9),
    eyeColor: pick(['#2c1810', '#3d2914', '#1e3a5f', '#4a3728'], h >> 10),
    accessory: pick(['none', 'none', 'glasses', 'hat', 'earrings'] as CharacterLook['accessory'][], h >> 11),
  }
  return {
    id: `npc-${seed}`,
    name,
    age: 18 + (h % 28),
    occupation: pick(JOBS, h >> 1),
    personality: pick(PERSONALITIES, h >> 12),
    interests: [pick(INTERESTS, h), pick(INTERESTS, h >> 2), pick(INTERESTS, h >> 4)].filter(
      (v, i, a) => a.indexOf(v) === i,
    ),
    appearance,
    homeHint: pick(['Maple block', 'Riverside flats', 'Campus housing', 'Downtown loft waitlist'], h >> 13),
    workHint: pick(['FreshMart', 'FirstCity Bank', 'Summit Office', 'Brew corner', 'College desk'], h >> 14),
    sociability: 0.3 + ((h % 70) / 100),
    ambition: 0.25 + (((h >> 3) % 75) / 100),
    schedule: pick(['day', 'evening', 'flexible'] as const, h >> 15),
  }
}

export function generateCityCrowd(count: number): WorldNpc[] {
  return Array.from({ length: count }, (_, i) => generateNpc(`crowd-${i}-v1`))
}
