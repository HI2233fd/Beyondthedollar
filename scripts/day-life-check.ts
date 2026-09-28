import { reduceDay } from '../src/life/day/reduce'
import { defaultDayLife } from '../src/life/day/types'
import { periodAt, businessOpen, npcAt, CAMPUS_NPCS, nextMorningSeven } from '../src/life/day/schedule'
import { START_TOTAL_MINUTES } from '../src/simulation/time'

const fails: string[] = []
function check(name: string, ok: boolean, detail = '') {
  if (!ok) fails.push(`${name} ${detail}`)
}

check('starts at 7am', START_TOTAL_MINUTES === 7 * 60)
check('morning period', periodAt(START_TOTAL_MINUTES).kind === 'home-morning', periodAt(START_TOTAL_MINUTES).id)
check('first class', periodAt(8 * 60 + 20).id === 'p1')
check('lunch', periodAt(11 * 60 + 10).kind === 'lunch')
check('school open morning', businessOpen('college', 8 * 60 + 30))
check('school closed night', !businessOpen('college', 20 * 60))
check('cafe open evening', businessOpen('cafe', 18 * 60))
check('cafe closed late', !businessOpen('cafe', 22 * 60))

const riley = CAMPUS_NPCS.find((n) => n.id === 'friend-riley')!
const atClass = npcAt(riley, 8 * 60 + 30)
check('riley in class', atClass?.scene === 'college' && !!atClass.sit, JSON.stringify(atClass))
const atLunch = npcAt(riley, 11 * 60 + 10)
check('riley at lunch', atLunch?.scene === 'college' && atLunch.label === 'lunch', JSON.stringify(atLunch))

let life = defaultDayLife(START_TOTAL_MINUTES)
let now = START_TOTAL_MINUTES
let r = reduceDay(life, now, { type: 'eat', foodId: 'pantry-oats' })
check('ate oats', !r.error && r.dayLife.pantry.length === 1 && r.dayLife.hunger > 55)
life = r.dayLife
now += r.advanceMinutes
r = reduceDay(life, now, { type: 'change-outfit', outfitId: 'school' })
check('dressed for school', r.appearancePatch?.shirt === '#7c3aed' && r.dayLife.wearing === 'school')
life = r.dayLife

r = reduceDay(life, 8 * 60 + 20, { type: 'school-seat', seated: true })
life = r.dayLife
r = reduceDay(life, 8 * 60 + 20, { type: 'answer-class', correct: true, periodId: 'p1' })
check('class answer', r.dayLife.classParticipation >= 8 && r.dayLife.periodsAttended.includes('p1'))
life = r.dayLife

r = reduceDay(life, 11 * 60 + 10, { type: 'eat-lunch' })
check('lunch eaten', r.dayLife.lunchEatenToday && r.dayLife.hunger > life.hunger)
life = r.dayLife

r = reduceDay(life, 14 * 60, {
  type: 'buy-food',
  items: [{ id: 'g1', kind: 'bread', label: 'Store bread', hungerRestore: 16, boughtAt: 14 * 60 }],
})
check('groceries in pantry', r.dayLife.pantry.some((p) => p.label === 'Store bread'))
life = r.dayLife

r = reduceDay(life, 16 * 60, {
  type: 'add-vehicle',
  vehicle: { id: 'veh-hatch', modelId: 'hatch', label: '2014 Hatchback', color: '#64748b', x: -22, z: 3.5, yaw: 0 },
})
life = r.dayLife
r = reduceDay(life, 16 * 60, { type: 'enter-vehicle', vehicleId: 'veh-hatch' })
check('driving', r.dayLife.drivingVehicleId === 'veh-hatch')
life = r.dayLife
r = reduceDay(life, 16 * 60, { type: 'park-vehicle', vehicleId: 'veh-hatch', x: -10, z: 4, yaw: 1 })
check('parked', !r.dayLife.drivingVehicleId && r.dayLife.vehicles[0].x === -10)

life = r.dayLife
now = 22 * 60
r = reduceDay(life, now, { type: 'sleep' })
check('sleep advances to 7', r.advanceMinutes > 0 && nextMorningSeven(now) === now + r.advanceMinutes)
check('energy restored', r.dayLife.energy >= 90)

if (fails.length) {
  console.error(fails.join('\n'))
  process.exit(1)
}
console.log('day-life checks passed')
