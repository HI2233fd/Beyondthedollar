import { BUILDINGS, CITY_START, ROAD_HALF, ROADS_EW, ROADS_NS, WORLD } from '../src/cityLayout'
import { nextGuideStep, allDestinations } from '../src/world/nav'
import { normalizeAppearance } from '../src/life/characterLook'
import { normalizeWorldSim } from '../src/world/worldSim'
import { useGame } from '../src/GameState'

const failures: string[] = []
function check(name: string, ok: boolean, detail = '') {
  if (!ok) failures.push(`${name}${detail ? `: ${detail}` : ''}`)
  else console.log('ok', name)
}

check('fifteen locations', BUILDINGS.length === 15, String(BUILDINGS.length))
const names = new Set(BUILDINGS.map((b) => b.name))
for (const required of [
  'Your family home',
  'Bellwether High',
  'Bellwether Bank',
  'Juniper Market',
  'Corner Café',
  'Downtown Commons',
  'Juniper Apartments',
  'Bellwether College',
  'Meridian Offices',
  'Horizon Motors',
  'Harbor Kitchen',
  'The Lantern',
  'Willow Townhouse',
  'Community Clinic',
  'Foundry Workshop',
]) {
  check(`named ${required}`, names.has(required))
}

for (let i = 0; i < BUILDINGS.length; i++) {
  for (let j = i + 1; j < BUILDINGS.length; j++) {
    const a = BUILDINGS[i]
    const b = BUILDINGS[j]
    const overlap = Math.abs(a.x - b.x) < (a.w + b.w) / 2 && Math.abs(a.z - b.z) < (a.d + b.d) / 2
    check(`no overlap ${a.id}/${b.id}`, !overlap)
  }
}

check('playable span', WORLD.maxX - WORLD.minX >= 190 && WORLD.maxZ - WORLD.minZ >= 190)

for (const b of BUILDINGS) {
  const onRoad =
    ROADS_EW.some((z) => Math.abs(b.z - z) < b.d / 2 + ROAD_HALF * 0.4) &&
    ROADS_NS.some((x) => Math.abs(b.x - x) < b.w / 2 + ROAD_HALF * 0.4)
  check(`off intersection ${b.id}`, !onRoad)
}

const look = normalizeAppearance({ hairStyle: 'short', skin: '#112233' })
check('hair alias', look.hairStyle === 'side-part')
check('kept skin', look.skin === '#112233')
check('default height', normalizeAppearance(null).height === 'average')
check('default shirt', normalizeAppearance(null).shirt === '#e7e1d6')
check('default jacket', normalizeAppearance(null).jacket === '#1e3a5f')
check('old look keeps its shirt', normalizeAppearance({ shirt: '#527bc4' }).jacket === null && normalizeAppearance({ shirt: '#527bc4' }).shirt === '#527bc4')
check('world defaults', normalizeWorldSim(undefined).gardenStage === 0 && normalizeWorldSim({ gardenStage: 2 }).gardenStage === 2)

for (const dest of allDestinations().filter((d) => d.kind === 'building')) {
  let x = CITY_START.pos[0]
  let z = CITY_START.pos[2]
  let reached = false
  let blocked = false
  for (let i = 0; i < 120; i++) {
    const step = nextGuideStep(x, z, dest.x, dest.z)
    if (!step.clear && !step.done) {
      blocked = true
      break
    }
    if (step.done) {
      reached = true
      break
    }
    if (Math.hypot(step.x - x, step.z - z) < 0.01) break
    x = step.x
    z = step.z
  }
  check(`route to ${dest.id}`, reached && !blocked, `${x},${z}`)
}

useGame.getState().beginLife('Ada', 18, normalizeAppearance({}), ['career'])
const before = useGame.getState().cash
useGame.getState().addToCart({ id: 'milk-store', name: 'Store milk', price: 3.29, needKey: 'milk' })
useGame.getState().addToCart({ id: 'milk-store', name: 'Store milk', price: 3.29, needKey: 'milk' })
const paid = useGame.getState().checkout('cash')
check('checkout once for duplicate lines still sums cart', paid === 6.58)
check('cash reduced once by cart total', Math.abs(useGame.getState().cash - (before - 6.58)) < 0.001)
check('cart cleared', useGame.getState().cart.length === 0)
useGame.getState().openCheckingAccount()
const bankBefore = useGame.getState().bank
const dep = useGame.getState().deposit(10)
check('deposit uses checking', dep === null && useGame.getState().bank === bankBefore + 10)

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log('bellwether checks passed')
