import { useGame } from '../GameState'
import { applyMoney } from './pay'

export function handNeighborHome() {
  const s = useGame.getState()
  if (s.worldSim.neighborOrder !== 'carrying') return false
  const err = applyMoney(8, 'Neighbor delivery', 'neighbor-order')
  s.patchWorld({ neighborOrder: 'done' })
  s.openDialogue({
    name: 'Mail',
    text: err ?? 'Neighbor’s prepaid order delivered. $8 once.',
    options: [{ label: 'OK', close: true }],
  })
  return true
}
