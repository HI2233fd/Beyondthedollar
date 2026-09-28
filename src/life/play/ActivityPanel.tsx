import { useState, type ReactNode } from 'react'
import { useGame } from '../../GameState'
import {
  BANK_PLANS,
  CARS,
  EMPLOYERS,
  FINANCE,
  INTERVIEWS,
  MAYA_BASKET,
  MAYA_BUDGET,
  SHIFTS,
  appOf,
  bankPlan,
  clockLabel,
  financeQuote,
  inInterviewWindow,
  type EmployerId,
} from './logic'

const money = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export function ActivityPanel() {
  const activity = useGame((s) => s.activity)
  if (!activity) return null
  return (
    <div className="modal-overlay scenario-overlay">
      <div className="activity-card">
        {activity.kind === 'bank' && <BankDesk />}
        {activity.kind === 'posting' && <Posting employerId={activity.employerId} />}
        {activity.kind === 'interview' && <Interview employerId={activity.employerId} />}
        {activity.kind === 'shift' && <Shift employerId={activity.employerId} />}
        {activity.kind === 'maya' && <MayaBasket />}
        {activity.kind === 'phone' && <PhoneListing />}
        {activity.kind === 'split' && <PaySplit />}
        {activity.kind === 'emergency' && <Emergency repair={false} />}
        {activity.kind === 'repair' && <Emergency repair />}
        {activity.kind === 'car' && <CarShop />}
        {activity.kind === 'workplace' && <Workplace />}
        {activity.kind === 'practice' && <Practice />}
        {activity.kind === 'review' && <Review />}
        {activity.kind === 'maya-intro' && <MayaIntro />}
      </div>
    </div>
  )
}

function Shell({
  kicker,
  title,
  children,
  onClose,
}: {
  kicker: string
  title: string
  children: ReactNode
  onClose?: () => void
}) {
  const close = useGame((s) => s.play)
  const locked = useGame((s) => s.activity?.kind === 'emergency' || s.activity?.kind === 'repair')
  return (
    <>
      <div className="activity-top">
        <div>
          <div className="scenario-badge">{kicker}</div>
          <h2>{title}</h2>
        </div>
        {!locked && (
          <button type="button" className="phone-close" onClick={() => (onClose ? onClose() : close({ type: 'close' }))}>
            Close
          </button>
        )}
      </div>
      {children}
    </>
  )
}

function Err({ text }: { text: string | null }) {
  if (!text) return null
  return <p className="activity-error">{text}</p>
}

function BankDesk() {
  const cash = useGame((s) => s.cash)
  const play = useGame((s) => s.play)
  const [planId, setPlanId] = useState<(typeof BANK_PLANS)[number]['id'] | null>(null)
  const [deposit, setDeposit] = useState(Math.min(cash, 200))
  const [ask, setAsk] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const plan = BANK_PLANS.find((p) => p.id === planId) ?? null

  return (
    <Shell kicker="FirstCity Bank" title="Pick an account">
      <p className="activity-lead">Marcus lays three products on the desk. None of them is marked as the right one. The rules you choose are the rules your money follows.</p>
      <div className="activity-grid">
        {BANK_PLANS.map((p) => (
          <button key={p.id} type="button" className={`choice-card ${planId === p.id ? 'selected' : ''}`} onClick={() => setPlanId(p.id)}>
            <strong>{p.label}</strong>
            <span>{p.monthlyFee === 0 ? 'No monthly fee' : `${money(p.monthlyFee)} / month`}</span>
            <span>{p.allowsOverdraft ? (p.overdraftFee ? `${money(p.overdraftFee)} overdraft fee` : 'Overdraft allowed, no fee') : 'Overdrafts are declined'}</span>
            <span>{p.apy ? `${(p.apy * 100).toFixed(1)}% APY` : 'No interest'}</span>
          </button>
        ))}
      </div>
      <div className="activity-questions">
        <button type="button" onClick={() => setAsk('over')}>What is an overdraft?</button>
        <button type="button" onClick={() => setAsk('apy')}>What does APY mean here?</button>
        <button type="button" onClick={() => setAsk('min')}>What is the $500 minimum?</button>
      </div>
      {ask === 'over' && <p className="activity-note">If a payment is bigger than the balance, Everyday still pays it and adds $35. Plus pays it and adds nothing. Online refuses the payment.</p>}
      {ask === 'apy' && <p className="activity-note">APY is interest the bank pays you. On the online account it is 1.2% a year, credited once a month on the checking balance. The other two pay none.</p>}
      {ask === 'min' && <p className="activity-note">Plus Checking expects $500 in the account. If you are under that on the monthly fee date, the bank adds a $12 fee. It is not a suggestion in the fine print only — it posts.</p>}
      {plan && <p className="activity-note">{plan.note}</p>}
      <label className="activity-field">
        Deposit from cash ({money(cash)} on you)
        <input
          type="number"
          min={0}
          max={cash}
          step={1}
          value={deposit}
          onChange={(e) => setDeposit(Number(e.target.value))}
        />
      </label>
      <Err text={error} />
      <button
        type="button"
        className="event-continue"
        disabled={!plan}
        onClick={() => {
          if (!planId) return
          const err = play({ type: 'bank', planId, deposit: Number.isFinite(deposit) ? deposit : 0 })
          setError(err)
        }}
      >
        Open this account
      </button>
    </Shell>
  )
}

function Posting({ employerId }: { employerId: EmployerId }) {
  const play = useGame((s) => s.play)
  const facts = useGame((s) => s.lifeFacts)
  const hasChecking = useGame((s) => s.hasCheckingAccount)
  const hasJob = useGame((s) => s.hasJob)
  const scene = useGame((s) => s.scene)
  const totalMinutes = useGame((s) => s.totalMinutes)
  const job = EMPLOYERS[employerId]
  const app = appOf(facts, employerId)
  const employedHere = hasJob && facts.employerId === employerId
  const where = employerId === 'summit' ? 'office' : employerId === 'freshmart' ? 'grocery' : 'cafe'
  const [error, setError] = useState<string | null>(null)
  const net = job.hourly * 4 * (1 - 0.18)

  return (
    <Shell kicker={job.name} title={job.role}>
      <ul className="activity-facts">
        <li>{money(job.hourly)} / hour</li>
        <li>About {job.hoursPerWeek} hours a week if you keep the schedule</li>
        <li>A shift is 4 hours. A clean shift nets about {money(net)} after tax.</li>
        <li>{job.needsChecking ? 'Checking account required for direct deposit.' : 'Pays cash until you have a checking account, then direct deposit.'}</li>
        <li>{job.where}</li>
      </ul>
      {app.status === 'scheduled' && <p className="activity-note">Interview {clockLabel(app.interviewAt)}. Rest until then if you do not want to wait it out.</p>}
      {app.status === 'offered' && <p className="activity-note">They offered you the job. Accept it or leave it.</p>}
      {app.status === 'rejected' && <p className="activity-note">{app.feedback}</p>}
      {app.status === 'missed' && <p className="activity-note">You missed the window. One reschedule is still open.</p>}
      {job.needsChecking && !hasChecking && app.status === 'none' && (
        <p className="activity-note">Diane will not put you on the calendar until checking is open.</p>
      )}
      {employedHere && (
        <p className="activity-note">You already work here. Clock in at {job.where}. The phone cannot run the shift for you.</p>
      )}
      <Err text={error} />
      <div className="activity-actions">
        {employedHere && (
          <button
            type="button"
            className="event-continue"
            onClick={() => {
              if (scene !== where) {
                setError(`Clock in at ${job.where}.`)
                return
              }
              setError(play({ type: 'open', activity: { kind: 'shift', employerId } }))
            }}
          >
            Clock in
          </button>
        )}
        {!employedHere && (app.status === 'none' || app.status === 'declined') && (
          <button type="button" className="event-continue" onClick={() => setError(play({ type: 'apply', employerId }))}>
            Apply
          </button>
        )}
        {app.status === 'scheduled' && (
          <>
            <button
              type="button"
              className="event-continue"
              onClick={() => setError(play({ type: 'wait', until: app.interviewAt - 20 }))}
            >
              Rest until the interview
            </button>
            {inInterviewWindow(totalMinutes, app.interviewAt) === 'open' && (
              <button
                type="button"
                className="event-continue"
                onClick={() => {
                  if (scene !== where) {
                    setError(`Show up at ${job.where} for the interview.`)
                    return
                  }
                  setError(play({ type: 'open', activity: { kind: 'interview', employerId } }))
                }}
              >
                Start the interview
              </button>
            )}
          </>
        )}
        {(app.status === 'missed' || (app.status === 'rejected' && facts.practiceDone)) && (
          <button type="button" className="event-continue" onClick={() => setError(play({ type: 'reschedule', employerId }))}>
            Ask for another interview
          </button>
        )}
        {app.status === 'offered' && (
          <>
            <button type="button" className="event-continue" onClick={() => setError(play({ type: 'respond-offer', employerId, accept: true }))}>
              Accept the job
            </button>
            <button type="button" className="event-btn" onClick={() => setError(play({ type: 'respond-offer', employerId, accept: false }))}>
              <strong>Turn it down</strong>
              <span>The offer goes away</span>
            </button>
          </>
        )}
      </div>
    </Shell>
  )
}

function Interview({ employerId }: { employerId: EmployerId }) {
  const play = useGame((s) => s.play)
  const questions = INTERVIEWS[employerId]
  const [step, setStep] = useState(0)
  const [picks, setPicks] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const q = questions[step]
  if (!q) return null
  return (
    <Shell kicker={EMPLOYERS[employerId].name} title={`Interview ${step + 1} of ${questions.length}`}>
      <p className="activity-lead">{q.prompt}</p>
      <div className="event-options">
        {q.choices.map((c) => (
          <button
            key={c.id}
            type="button"
            className="event-btn"
            onClick={() => {
              const next = [...picks, c.id]
              if (step + 1 >= questions.length) {
                setError(play({ type: 'interview', employerId, picks: next }))
              } else {
                setPicks(next)
                setStep(step + 1)
              }
            }}
          >
            <strong>{c.label}</strong>
          </button>
        ))}
      </div>
      <Err text={error} />
    </Shell>
  )
}

function Shift({ employerId }: { employerId: EmployerId }) {
  const play = useGame((s) => s.play)
  const tickets = SHIFTS[employerId]
  const [index, setIndex] = useState(0)
  const [built, setBuilt] = useState<Record<string, string>>({})
  const [answers, setAnswers] = useState<Record<string, string>[]>([])
  const [error, setError] = useState<string | null>(null)
  const ticket = tickets[index]
  const job = EMPLOYERS[employerId]

  if (!ticket) return null
  const ready = ticket.fields.every((f) => built[f.id])

  return (
    <Shell kicker={`${job.name} · on the clock`} title={`Order ${index + 1} of ${tickets.length}`}>
      <p className="activity-lead">{ticket.prompt}</p>
      {ticket.fields.map((field) => (
        <div key={field.id} className="shift-field">
          <span>{field.label}</span>
          <div className="shift-options">
            {field.options.map((opt) => (
              <button key={opt} type="button" className={built[field.id] === opt ? 'selected' : ''} onClick={() => setBuilt({ ...built, [field.id]: opt })}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
      <Err text={error} />
      <button
        type="button"
        className="event-continue"
        disabled={!ready}
        onClick={() => {
          const nextAnswers = [...answers, built]
          if (index + 1 >= tickets.length) {
            let correct = 0
            let total = 0
            tickets.forEach((t, i) => {
              const given = nextAnswers[i] ?? {}
              for (const field of t.fields) {
                total += 1
                if (given[field.id] === field.answer) correct += 1
              }
            })
            setError(play({ type: 'shift', employerId, accuracy: total ? correct / total : 0 }))
          } else {
            setAnswers(nextAnswers)
            setBuilt({})
            setIndex(index + 1)
          }
        }}
      >
        {index + 1 >= tickets.length ? 'Clock out' : 'Send this one'}
      </button>
    </Shell>
  )
}

function MayaBasket() {
  const play = useGame((s) => s.play)
  const [picked, setPicked] = useState<string[]>([])
  const items = MAYA_BASKET.filter((i) => picked.includes(i.id))
  const total = items.reduce((s, i) => s + i.price, 0)
  const toggle = (id: string) => {
    setPicked((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id)
      const item = MAYA_BASKET.find((i) => i.id === id)
      if (!item) return cur
      if (total + item.price > MAYA_BUDGET + 0.001) return cur
      return [...cur, id]
    })
  }
  return (
    <Shell kicker="Maya" title="Her basket, her $24">
      <p className="activity-lead">
        Maya has {money(MAYA_BUDGET)} and a week to eat. She mentions juice, but she also needs food she can actually cook. This is her money, not yours.
      </p>
      <div className="activity-grid">
        {MAYA_BASKET.map((item) => (
          <button key={item.id} type="button" className={`choice-card ${picked.includes(item.id) ? 'selected' : ''}`} onClick={() => toggle(item.id)}>
            <strong>{item.name}</strong>
            <span>{money(item.price)}</span>
            <span>{item.need ? 'Staple' : 'Extra'}</span>
          </button>
        ))}
      </div>
      <p className="activity-note">
        Basket {money(total)} · {money(MAYA_BUDGET - total)} left. Staples in the basket:{' '}
        {items.filter((i) => i.need).length}
      </p>
      <button
        type="button"
        className="event-continue"
        disabled={picked.length === 0}
        onClick={() => play({ type: 'maya', needsHit: items.filter((i) => i.need).length })}
      >
        Hand her the basket
      </button>
    </Shell>
  )
}

function PhoneListing() {
  const play = useGame((s) => s.play)
  const cash = useGame((s) => s.cash)
  const bank = useGame((s) => s.bank)
  const facts = useGame((s) => s.lifeFacts)
  const [error, setError] = useState<string | null>(null)
  return (
    <Shell kicker="Marketplace" title="Used phone · $180">
      <p className="activity-lead">
        Your starter phone still opens the Life Hub. Texts from people can sit until the next morning. This listing expires {clockLabel(facts.phoneExpiresAt)}.
      </p>
      <ul className="activity-facts">
        <li>Price $180</li>
        <li>Cash on you {money(cash)}</li>
        <li>Checking {money(bank)}</li>
        <li>After buying, a surprise bill is harder if this was your cushion.</li>
      </ul>
      <Err text={error} />
      <div className="activity-actions">
        <button type="button" className="event-continue" onClick={() => setError(play({ type: 'phone-buy' }))}>
          Buy it
        </button>
        <button type="button" className="event-btn" onClick={() => setError(play({ type: 'phone-pass' }))}>
          <strong>Leave the listing</strong>
          <span>Keep the $180</span>
        </button>
      </div>
    </Shell>
  )
}

function PaySplit() {
  const play = useGame((s) => s.play)
  const bank = useGame((s) => s.bank)
  const cashOnHand = useGame((s) => s.cash)
  const hasChecking = useGame((s) => s.hasCheckingAccount)
  const stub = useGame((s) => s.paystubs[0])
  const [savings, setSavings] = useState(0)
  const [cash, setCash] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const paidCash = !hasChecking
  return (
    <Shell kicker="Paycheck" title="Where does it go?">
      <p className="activity-lead">
        {stub
          ? paidCash
            ? `${stub.employer} paid ${money(stub.net)} in cash after ${money(stub.tax)} tax on ${money(stub.gross)} gross. You are holding ${money(cashOnHand)}.`
            : `${stub.employer} paid ${money(stub.net)} after ${money(stub.tax)} tax on ${money(stub.gross)} gross. Checking now holds ${money(bank)}.`
          : 'No paycheck yet.'}
      </p>
      <label className="activity-field">
        Move to savings
        <input type="number" min={0} value={savings} onChange={(e) => setSavings(Number(e.target.value))} />
      </label>
      {!paidCash && (
        <label className="activity-field">
          Pull out as cash
          <input type="number" min={0} value={cash} onChange={(e) => setCash(Number(e.target.value))} />
        </label>
      )}
      <p className="activity-note">
        {paidCash
          ? 'Whatever you do not move stays as cash. Leaving it there is allowed.'
          : 'Whatever you do not move stays in checking. Leaving it there is allowed.'}
      </p>
      <Err text={error} />
      <button
        type="button"
        className="event-continue"
        onClick={() => setError(play({ type: 'split', toSavings: savings || 0, toCash: cash || 0 }))}
      >
        Do this with the money
      </button>
    </Shell>
  )
}

function Emergency({ repair }: { repair: boolean }) {
  const play = useGame((s) => s.play)
  const facts = useGame((s) => s.lifeFacts)
  const cash = useGame((s) => s.cash)
  const bank = useGame((s) => s.bank)
  const savings = useGame((s) => s.savings)
  const met = useGame((s) => !!s.relationships['home-jordan']?.met)
  const plan = bankPlan(facts.bankPlanId)
  const [error, setError] = useState<string | null>(null)
  const amount = facts.surpriseAmount
  const car = facts.surpriseKind === 'car' || repair
  const choose = (choice: 'cash' | 'bank' | 'savings' | 'credit' | 'jordan' | 'delay') =>
    setError(play({ type: 'emergency', choice, repair }))

  return (
    <Shell kicker="Life happens" title={car ? 'The car will not start' : 'Utility catch-up'}>
      <p className="activity-lead">
        {car
          ? `The shop wants ${money(amount)} before the car moves. How you stored money earlier is the whole question.`
          : `The building posted a ${money(amount)} utility catch-up. It is not a quiz. It is a bill.`}
      </p>
      <ul className="activity-facts">
        <li>Cash {money(cash)}</li>
        <li>Checking {money(bank)}{plan ? ` · ${plan.label}` : ''}</li>
        <li>Savings {money(savings)}</li>
        {plan?.id === 'everyday' && bank < amount && <li>Everyday Checking will pay this and add a $35 overdraft fee.</li>}
        {plan?.id === 'plus' && bank < amount && <li>Plus Checking will pay this with no overdraft fee. The balance can go negative.</li>}
        {plan?.id === 'online' && bank < amount && <li>The online account will decline this if checking is short.</li>}
      </ul>
      <div className="event-options">
        <button type="button" className="event-btn" onClick={() => choose('cash')}>
          <strong>Pay cash</strong>
          <span>{cash + 0.001 >= amount ? money(amount) : 'Not enough cash'}</span>
        </button>
        <button type="button" className="event-btn" onClick={() => choose('bank')}>
          <strong>Pay from checking</strong>
          <span>{plan ? plan.label : 'No account yet'}</span>
        </button>
        <button type="button" className="event-btn" onClick={() => choose('savings')}>
          <strong>Pay from savings</strong>
          <span>{savings + 0.001 >= amount ? money(amount) : 'Not enough saved'}</span>
        </button>
        <button type="button" className="event-btn" onClick={() => choose('credit')}>
          <strong>Short-term loan</strong>
          <span>You will owe {money(amount * 1.25)}. Credit takes a hit.</span>
        </button>
        <button type="button" className="event-btn" onClick={() => choose('jordan')}>
          <strong>Ask Jordan</strong>
          <span>{!met ? 'You have not really met him' : facts.jordanLoanTaken ? 'He already lent you money' : amount > 120 ? 'Too big for him' : `He can cover ${money(amount)}`}</span>
        </button>
        <button type="button" className="event-btn" onClick={() => choose('delay')}>
          <strong>Do not pay today</strong>
          <span>{car ? 'The car stays parked' : 'Rent goes up by $15'}</span>
        </button>
      </div>
      <Err text={error} />
    </Shell>
  )
}

function CarShop() {
  const play = useGame((s) => s.play)
  const [modelId, setModelId] = useState(CARS[0].id)
  const [error, setError] = useState<string | null>(null)
  const model = CARS.find((c) => c.id === modelId) ?? CARS[0]
  return (
    <Shell kicker="AutoMart" title="Look before you sign">
      <div className="activity-grid">
        {CARS.map((car) => (
          <button key={car.id} type="button" className={`choice-card ${modelId === car.id ? 'selected' : ''}`} onClick={() => setModelId(car.id)}>
            <strong>{car.name}</strong>
            <span>{money(car.price)}</span>
            <span>Insurance {money(car.insurance)}/mo</span>
            <span>Upkeep {money(car.upkeep)}/mo</span>
            <span>{car.note}</span>
          </button>
        ))}
      </div>
      <h3 className="phone-section">If you finance {model.name}</h3>
      <div className="activity-grid">
        {FINANCE.map((offer) => {
          const q = financeQuote(model.price, offer)
          return (
            <button key={offer.id} type="button" className="choice-card" onClick={() => setError(play({ type: 'car', modelId: model.id, finance: offer.id }))}>
              <strong>${offer.down.toLocaleString()} down · {offer.months} months · {(offer.apr * 100).toFixed(1)}% APR</strong>
              <span>{money(q.monthly)} / month</span>
              <span>Total {money(q.total)} · interest about {money(q.interest)}</span>
            </button>
          )
        })}
      </div>
      <div className="activity-actions">
        <button type="button" className="event-btn" onClick={() => setError(play({ type: 'car', modelId: model.id, finance: 'cash' }))}>
          <strong>Pay {money(model.price)} cash</strong>
          <span>No loan. Insurance and upkeep still bill.</span>
        </button>
        <button type="button" className="event-btn" onClick={() => setError(play({ type: 'transit' }))}>
          <strong>Skip the car</strong>
          <span>Transit pass, $45 a month</span>
        </button>
      </div>
      <Err text={error} />
    </Shell>
  )
}

function Workplace() {
  const play = useGame((s) => s.play)
  const [error, setError] = useState<string | null>(null)
  return (
    <Shell kicker="At work" title="The drawer is $12 short">
      <p className="activity-lead">You counted it twice. The drawer is light, and you are the one closing.</p>
      <div className="event-options">
        <button type="button" className="event-btn" onClick={() => setError(play({ type: 'workplace', choice: 'report' }))}>
          <strong>Write it up for the manager</strong>
          <span>No money moves. They remember you told the truth.</span>
        </button>
        <button type="button" className="event-btn" onClick={() => setError(play({ type: 'workplace', choice: 'cover' }))}>
          <strong>Put in $12 of your own</strong>
          <span>The drawer balances. Management never hears about it.</span>
        </button>
        <button type="button" className="event-btn" onClick={() => setError(play({ type: 'workplace', choice: 'ignore' }))}>
          <strong>Lock up and leave it</strong>
          <span>The next shift pays less while they investigate.</span>
        </button>
      </div>
      <Err text={error} />
    </Shell>
  )
}

function Practice() {
  const play = useGame((s) => s.play)
  const [line, setLine] = useState('Jordan leans on the counter. “Run it like a real close. What do you do when the drawer is short?”')
  const [done, setDone] = useState(false)
  return (
    <Shell kicker="Jordan" title="Practice the close">
      <p className="activity-lead">{line}</p>
      {!done ? (
        <div className="event-options">
          <button
            type="button"
            className="event-btn"
            onClick={() => {
              setLine('“Good. Say it that way at the real interview — specific, not a slogan.”')
              setDone(true)
            }}
          >
            <strong>Tell the manager and write the count down</strong>
          </button>
          <button
            type="button"
            className="event-btn"
            onClick={() => {
              setLine('“They will hear that as hiding. You can still go back, but lead with the truth next time.”')
              setDone(true)
            }}
          >
            <strong>Quietly cover it so nobody worries</strong>
          </button>
        </div>
      ) : (
        <button type="button" className="event-continue" onClick={() => play({ type: 'practice' })}>
          Finish practice
        </button>
      )}
    </Shell>
  )
}

function Review() {
  const play = useGame((s) => s.play)
  const facts = useGame((s) => s.lifeFacts)
  const [error, setError] = useState<string | null>(null)
  return (
    <Shell kicker="Review" title="They looked at your shifts">
      <p className="activity-lead">
        Accuracy on record: {facts.performance}%. {facts.performance >= 70 ? 'That is raise territory.' : 'That is not a raise.'} The button does not change the record. It only starts the conversation.
      </p>
      <Err text={error} />
      <button type="button" className="event-continue" onClick={() => setError(play({ type: 'review' }))}>
        Hear the decision
      </button>
    </Shell>
  )
}

function MayaIntro() {
  const play = useGame((s) => s.play)
  return (
    <Shell kicker="Maya" title="Want the introduction?">
      <p className="activity-lead">She already told you her manager needs weekend help. Yes puts your name in. No keeps the favor as a favor.</p>
      <div className="activity-actions">
        <button type="button" className="event-continue" onClick={() => play({ type: 'maya-intro', yes: true })}>
          Yes, introduce me
        </button>
        <button type="button" className="event-btn" onClick={() => play({ type: 'maya-intro', yes: false })}>
          <strong>Not now</strong>
          <span>She will not ask again</span>
        </button>
      </div>
    </Shell>
  )
}
