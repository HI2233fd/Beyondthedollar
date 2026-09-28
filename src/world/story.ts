import { useGame } from '../GameState'
import { BUILDINGS, doorPosition } from '../cityLayout'

export interface StoryBeat {
  chapter: string
  title: string
  objective: string
  destinationId: string | null
  destinationName: string
  reward: string
  progress: string
}

const SAVINGS_TARGET = 200

function destName(id: string | null) {
  if (!id) return 'Bellwether'
  return BUILDINGS.find((b) => b.id === id)?.name ?? id
}

/** Main storyline derived from the existing life, job, and money state. */
export function currentStory(): StoryBeat {
  const s = useGame.getState()
  const paid = s.ledger.some((e) => e.kind === 'paycheck') || s.paystubs.length > 0
  const boughtFood = s.ledger.some((e) => /grocery|market|produce|meal|latte|sandwich/i.test(e.label))
  const met = Object.values(s.relationships).filter((r) => r.met).length
  const target = s.goals.includes('financialFreedom') ? 500 : SAVINGS_TARGET
  const teen = s.playerAge < 18
  const skilled = s.completedTopicIds.length > 0 || s.lifeLevel >= 3
  const housed = s.homeStatus === 'owned' || s.homeStatus === 'renting' || s.leftHome
  const independent =
    s.hasJob && s.hasCheckingAccount && s.savings >= target && skilled && housed && met > 0

  if (!s.leftHome) {
    return beat('Chapter 1', 'Find Your Feet', 'Leave your family home and step onto Oak Walk', 'home', 'You learn the neighborhood', 'Not started')
  }
  if (met === 0) {
    return beat('Chapter 1', 'Find Your Feet', 'Talk to Dev at Corner Café', 'cafe', 'A real job lead', 'Neighbor not met')
  }
  if (!s.hasJob) {
    return beat('Chapter 1', 'Find Your Feet', 'Ask Dev about the barista job', 'cafe', 'An application, not a purchase', 'Job not chosen')
  }
  if (!paid) {
    return beat(
      'Chapter 2',
      'Earn Your First Paycheck',
      'Read the ticket, prepare the coffee, then serve it',
      'cafe',
      'One paycheck with gross pay, deductions, and take-home',
      'Shift not finished',
    )
  }
  if (!s.hasCheckingAccount) {
    return beat('Chapter 3', 'Make Your Money Last', 'Open checking with Jordan', 'bank', 'A place for pay that is not loose cash', 'No checking account')
  }
  if (!boughtFood) {
    return beat('Chapter 3', 'Make Your Money Last', 'Buy groceries at Juniper Market', 'grocery', 'Food you can cook at home', 'Basket not checked out')
  }
  if (s.dueBillIds.length > 0) {
    return beat('Chapter 3', 'Make Your Money Last', 'Pay the bill that is actually due', 'home', 'The obligation clears only when it is paid', `${s.dueBillIds.length} due`)
  }
  if (s.savings < target && s.cash + s.bank >= 25) {
    return beat('Chapter 4', 'Build Stability', 'Move money into savings at the bank', 'bank', `Progress toward $${target}`, `Savings $${s.savings.toFixed(0)}`)
  }
  if (!skilled) {
    return beat('Chapter 4', 'Build Stability', 'Finish a lesson or assessment', 'college', 'A skill that stays on your record', 'No completed topic yet')
  }
  if (!independent) {
    const path = s.goals.includes('education')
      ? 'Attend a lecture at Bellwether College'
      : s.goals.includes('entrepreneurship')
        ? 'Stock the West Park craft stall from the workshop'
        : s.goals.includes('cars')
          ? 'Compare cars at Horizon Motors. A test drive is not a purchase.'
          : teen
            ? 'Keep a shift, your bills, and a savings deposit. You do not need an adult lease.'
            : 'Review a lease only if you can afford the deposit and rent'
    const id = s.goals.includes('education') ? 'college' : s.goals.includes('entrepreneurship') ? 'workshop' : s.goals.includes('cars') ? 'motors' : 'cafe'
    return beat('Chapter 5', 'Choose Your Direction', path, id, 'A path you picked, not a forced purchase', `Savings $${s.savings.toFixed(0)} / $${target}`)
  }
  return beat(
    'Chapter 6',
    'Establish Independence',
    'Free play is open. Work a shift or check upcoming bills.',
    'cafe',
    'The city stays. Your save stays.',
    'Independent',
  )
}

function beat(chapter: string, title: string, objective: string, destinationId: string | null, reward: string, progress: string): StoryBeat {
  return { chapter, title, objective, destinationId, destinationName: destName(destinationId), reward, progress }
}

export function storyDoor(id: string | null): { x: number; z: number } | null {
  if (!id) return null
  const b = BUILDINGS.find((x) => x.id === id)
  if (!b) return null
  const door = doorPosition(b)
  return { x: door[0], z: door[2] + b.facing * 2.4 }
}
