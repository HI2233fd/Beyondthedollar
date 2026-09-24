import { useGame } from '../GameState'
import { CONCEPTS, conceptsForLevel } from './concepts'
import { levelTitle, checkpointReady } from './engine'
import { UNLOCKS } from './unlocks'
import type { MasteryStatus } from './types'

const LABEL: Record<MasteryStatus, string> = {
  'not-introduced': 'Not yet',
  introduced: 'Introduced',
  practiced: 'Practiced',
  developing: 'Developing',
  mastered: 'Mastered',
}

export function LifePhone() {
  const education = useGame((s) => s.financialEdu)
  const openConcept = useGame((s) => s.openConcept)
  const start = useGame((s) => s.startCheckpoint)
  const stubs = useGame((s) => s.paystubs)
  const cash = useGame((s) => s.cash)
  const bank = useGame((s) => s.bank)
  const savings = useGame((s) => s.savings)
  const debt = useGame((s) => s.debt)
  const holdings = useGame((s) => s.holdings)
  const prices = useGame((s) => s.assetPrices)
  const ledger = useGame((s) => s.ledger)
  const creditScore = useGame((s) => s.creditScore)
  const creditEstablished = useGame((s) => s.creditEstablished)
  const hasCard = useGame((s) => s.hasCreditCard)
  const carStatus = useGame((s) => s.carStatus)
  const homeStatus = useGame((s) => s.homeStatus)
  const weeklyIncome = useGame((s) => s.weeklyIncome)
  const bills = useGame((s) => s.recurringBills)
  const level = education.financialLevel
  const mine = conceptsForLevel(level)
  const mastered = CONCEPTS.filter((c) => education.concepts[c.id]?.status === 'mastered').length
  const ready = checkpointReady(education, level)
  const passed = education.attempts.filter((a) => a.passed).length
  const invest = holdings.stock * prices.stock + holdings.bond * prices.bond
  const net = cash + bank + savings + invest - debt

  return (
    <div className="phone-body">
      <div className="phone-hero">
        <span className="hud-label">Life Level {level}</span>
        <strong>{levelTitle(level)}</strong>
        <p className="phone-hero-sub">
          {mastered}/{CONCEPTS.length} concepts mastered · {passed} checkpoint{passed === 1 ? '' : 's'} passed
        </p>
      </div>
      <p className="phone-muted">
        This level is financial mastery. XP still moves your general progress. Walking the city is never locked behind a quiz.
      </p>
      <button type="button" className="curriculum-btn primary" onClick={start}>
        {ready ? `Checkpoint · ${levelTitle(level)}` : 'Try the checkpoint early'}
      </button>
      {education.lastResult && (
        <p className="phone-muted">
          Last try: {Math.round(education.lastResult.score * 100)}%
          {education.lastResult.passed ? ' · passed' : ' · review the misses and retry'}
        </p>
      )}
      <h3 className="phone-section">This level</h3>
      <div className="phone-list">
        {mine.map((c) => {
          const status = education.concepts[c.id]?.status ?? 'not-introduced'
          return (
            <button key={c.id} type="button" className="phone-row life-concept" onClick={() => openConcept(c.id)}>
              <span>
                {c.title}
                <em className="phone-when"> · {LABEL[status]}</em>
              </span>
              <span>Review</span>
            </button>
          )
        })}
      </div>
      {education.unlocks.includes('paystub-coach') && stubs[0] && (
        <>
          <h3 className="phone-section">Latest pay</h3>
          <div className="phone-row">
            <span>Gross {stubs[0].gross}</span>
            <span>Net {stubs[0].net}</span>
          </div>
        </>
      )}
      {education.unlocks.includes('savings-snapshot') && (
        <>
          <h3 className="phone-section">Balances</h3>
          <div className="phone-row">
            <span>Checking / savings</span>
            <span>
              ${bank} / ${savings}
            </span>
          </div>
          <p className="phone-muted">
            {savings > 0 ? 'A savings balance is started. Keep it separate from spending money.' : 'Savings is still empty. Move money there before you need it.'}
          </p>
        </>
      )}
      {education.unlocks.includes('budget-snapshot') && (
        <>
          <h3 className="phone-section">Recent cash flow</h3>
          {ledger.length === 0 && <p className="phone-muted">Nothing on the ledger yet. Pay and bills will show up here.</p>}
          {ledger.slice(0, 4).map((row) => (
            <div key={row.id} className="phone-row">
              <span>{row.label}</span>
              <span>
                {row.kind === 'paycheck' ? '+' : '−'}${row.amount}
              </span>
            </div>
          ))}
        </>
      )}
      {education.unlocks.includes('credit-file-notes') && (
        <>
          <h3 className="phone-section">Credit file</h3>
          <p className="phone-muted">
            {creditEstablished
              ? `Score on file: ${creditScore}. ${hasCard ? 'A card is open — utilization and on-time payments move this number.' : 'No card yet. The bank still uses this score when you apply.'}`
              : 'No credit file yet. Opening checking is what starts one in this city.'}
          </p>
        </>
      )}
      {education.unlocks.includes('auto-cost-sheet') && (
        <>
          <h3 className="phone-section">Car costs</h3>
          <p className="phone-muted">
            {carStatus === 'none'
              ? 'No car yet. A payment is only one line — insurance, fuel, and repairs stay even after the loan is gone.'
              : `Status: ${carStatus}. Keep the payment, insurance, and a repair fund in the same monthly picture.`}
          </p>
        </>
      )}
      {education.unlocks.includes('lease-checklist') && (
        <>
          <h3 className="phone-section">Renter checklist</h3>
          <p className="phone-muted">
            Rent due ${bills.find((b) => b.category === 'rent')?.amount ?? '—'}. Before you sign anywhere new: deposit, utilities, roommates, and renter’s insurance.
            You are {homeStatus === 'owned' ? 'an owner now' : 'renting'}.
          </p>
        </>
      )}
      {education.unlocks.includes('path-compare') && (
        <>
          <h3 className="phone-section">Path compare</h3>
          <p className="phone-muted">
            {weeklyIncome > 0
              ? `Current gross is about $${weeklyIncome}/week, roughly $${weeklyIncome * 52}/year before tax. Training costs tuition plus the pay you pause.`
              : 'No paycheck yet. Compare a job-now path with more training only after you know what an hour of your time pays.'}
          </p>
        </>
      )}
      {education.unlocks.includes('invest-desk-notes') && (
        <p className="phone-muted">
          Investments on file: ${invest}. A fund spreads one purchase across many companies. A single stock can fall even when you did the homework.
        </p>
      )}
      {education.unlocks.includes('net-worth-snapshot') && (
        <div className="phone-row">
          <span>Net worth snapshot</span>
          <span>${net}</span>
        </div>
      )}
      {education.unlocks.includes('home-cost-sheet') && (
        <p className="phone-muted">
          {homeStatus === 'owned'
            ? 'Owned home: mortgage, property tax, insurance, and repairs are all housing, not just the payment.'
            : 'Still renting. A future purchase adds down payment, closing costs, interest, tax, insurance, and upkeep on top of the sticker price.'}
        </p>
      )}
      <h3 className="phone-section">Unlocks</h3>
      <div className="phone-list">
        {UNLOCKS.filter((u) => u.level <= level).map((u) => {
          const owned = education.unlocks.includes(u.id)
          return (
            <div key={u.id} className="phone-row">
              <span>
                {owned ? '✓' : '○'} {u.title}
                <em className="phone-when"> · {u.live ? 'in this world' : 'when that place exists'}</em>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
