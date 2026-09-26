import { useGame } from '../../GameState'
import { MINUTES_PER_DAY } from '../../simulation/time'
import { bankPlan, clockLabel, daysUntil } from './logic'
import { missionStatus } from '../types'

const money = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`

export function LifeSummary() {
  const cash = useGame((s) => s.cash)
  const bank = useGame((s) => s.bank)
  const savings = useGame((s) => s.savings)
  const hasJob = useGame((s) => s.hasJob)
  const career = useGame((s) => s.career)
  const car = useGame((s) => s.carStatus)
  const facts = useGame((s) => s.lifeFacts)
  const bills = useGame((s) => s.recurringBills)
  const missions = useGame((s) => s.missions)
  const play = useGame((s) => s.play)
  const totalMinutes = useGame((s) => s.totalMinutes)
  const rent = bills.find((b) => b.category === 'rent')
  const plan = bankPlan(facts.bankPlanId)
  const rentDays = rent && !facts.rentPaid ? daysUntil(totalMinutes, rent.nextDueTotalMinutes) : null
  const open = missions.filter((m) => {
    if (m.id === 'settle-in' || m.id === 'rent-clock') return false
    const status = missionStatus(m)
    return status === 'discovered' || status === 'active' || status === 'accepted'
  })

  return (
    <div className="life-summary">
      <h3 className="phone-section">Your life</h3>
      <ul className="activity-facts">
        <li>Cash {money(cash)}{bank || facts.bankPlanId ? ` · Checking ${money(bank)}` : ''}</li>
        <li>{savings > 0 ? `Savings ${money(savings)}` : 'No savings yet'}</li>
        <li>{hasJob ? career : 'No job'}</li>
        <li>{car === 'none' ? (facts.transit ? 'Transit pass' : 'No car') : `Car · ${facts.carModelId ?? car}`}</li>
        <li>
          {facts.rentPaid
            ? 'Rent is paid this cycle'
            : rentDays == null
              ? 'Rent schedule unknown'
              : `Rent due in ${rentDays} day${rentDays === 1 ? '' : 's'}${rent ? ` · ${money(rent.amount)}` : ''}`}
        </li>
        <li>{plan ? plan.label : 'Checking account not opened'}</li>
        {facts.jordanLoan > 0 && <li>You owe Jordan {money(facts.jordanLoan)}</li>}
        {facts.phoneTier === 'starter' && <li>Starter phone · some texts wait until morning</li>}
      </ul>
      <h3 className="phone-section">Opportunities</h3>
      {open.length === 0 ? (
        <p className="phone-muted">Nothing new on the block right now. Walk, work, or wait — life keeps moving.</p>
      ) : (
        <div className="phone-list">
          {open.map((m) => {
            const status = missionStatus(m)
            const days = m.deadlineAt ? daysUntil(totalMinutes, m.deadlineAt) : null
            return (
              <button
                key={m.id}
                type="button"
                className="phone-row life-opp"
                onClick={() => {
                  if (m.id === 'bank-first') play({ type: 'open', activity: { kind: 'bank' } })
                  else if (m.id === 'job-bean') play({ type: 'open', activity: { kind: 'posting', employerId: 'bean' } })
                  else if (m.id === 'job-summit') play({ type: 'open', activity: { kind: 'posting', employerId: 'summit' } })
                  else if (m.id === 'job-freshmart') play({ type: 'open', activity: { kind: 'posting', employerId: 'freshmart' } })
                  else if (m.id === 'phone-deal') play({ type: 'open', activity: { kind: 'phone' } })
                  else if (m.id === 'payday-split') play({ type: 'open', activity: { kind: 'split' } })
                  else if (m.id === 'workplace-snag') play({ type: 'open', activity: { kind: 'workplace' } })
                  else if (m.id === 'performance-review') play({ type: 'open', activity: { kind: 'review' } })
                  else if (m.id === 'maya-intro') play({ type: 'open', activity: { kind: 'maya-intro' } })
                  else if (m.id === 'wheels') play({ type: 'open', activity: { kind: 'car' } })
                  else if (m.id === 'fix-car') play({ type: 'open', activity: { kind: 'repair' } })
                  else if (m.id === 'job-recovery') play({ type: 'open', activity: { kind: 'practice' } })
                  else if (m.id === 'first-shift' && facts.employerId) play({ type: 'open', activity: { kind: 'posting', employerId: facts.employerId } })
                  else play({ type: 'accept', missionId: m.id })
                }}
              >
                <span>
                  <strong>{m.title}</strong>
                  <div className="phone-muted">
                    {status}
                    {m.locationHint ? ` · ${m.locationHint}` : ''}
                    {days != null && m.deadlineAt && m.deadlineAt - totalMinutes < 14 * MINUTES_PER_DAY
                      ? ` · ${days === 0 ? 'ends today' : `${days}d left`} · ${clockLabel(m.deadlineAt)}`
                      : ''}
                  </div>
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
