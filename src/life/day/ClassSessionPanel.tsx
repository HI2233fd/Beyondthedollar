import { useState } from 'react'
import { useGame } from '../../GameState'
import { periodAt } from './schedule'

const QUESTIONS: Record<string, { prompt: string; choices: { id: string; label: string; correct: boolean }[] }> = {
  p1: {
    prompt: 'You have $40 and two plans for Friday. What is the opportunity cost of going out?',
    choices: [
      { id: 'a', label: 'The phone-bill cushion you do not save', correct: true },
      { id: 'b', label: 'The sticker price of the pizza only', correct: false },
      { id: 'c', label: 'Whatever your friends spend', correct: false },
    ],
  },
  p3: {
    prompt: 'A checking account with a monthly fee is “free” if you never notice it. What actually happens?',
    choices: [
      { id: 'a', label: 'The fee posts because you chose those rules', correct: true },
      { id: 'b', label: 'The bank refunds it automatically', correct: false },
      { id: 'c', label: 'Fees only exist on paper', correct: false },
    ],
  },
}

export function ClassSessionPanel() {
  const activity = useGame((s) => s.classSessionOpen)
  const dayLife = useGame((s) => s.dayLife)
  const totalMinutes = useGame((s) => s.totalMinutes)
  const close = useGame((s) => s.closeClassSession)
  const dayAct = useGame((s) => s.dayAct)
  const period = periodAt(totalMinutes)
  const [phase, setPhase] = useState<'listen' | 'ask' | 'done'>('listen')
  const [feedback, setFeedback] = useState<string | null>(null)

  if (!activity || period.kind !== 'class') return null
  const q = QUESTIONS[period.id]

  return (
    <div className="modal-overlay scenario-overlay">
      <div className="activity-card class-card">
        <div className="activity-top">
          <div>
            <div className="scenario-badge">{period.subject ?? 'Class'}</div>
            <h2>{period.label}</h2>
          </div>
          <button type="button" className="phone-close" onClick={close}>
            Leave desk
          </button>
        </div>
        {phase === 'listen' && (
          <>
            <p className="activity-lead">
              {period.subject === 'Personal Finance'
                ? 'Ms. Park sketches a budget on the board. Trade-offs are the whole point — every yes spends a no.'
                : period.subject === 'Economics'
                  ? 'Cash flow is money in minus money out. A fee you chose still counts as out.'
                  : 'The lesson moves at a normal pace. You can listen, or you can raise your hand when she asks.'}
            </p>
            <p className="activity-note">Participation {dayLife.classParticipation}. Seated at your desk.</p>
            <div className="activity-actions">
              {q ? (
                <button
                  type="button"
                  className="event-continue"
                  onClick={() => {
                    dayAct({ type: 'raise-hand', raised: true })
                    setPhase('ask')
                  }}
                >
                  Raise your hand
                </button>
              ) : null}
              <button
                type="button"
                className="event-btn"
                onClick={() => {
                  dayAct({ type: 'attend-period', periodId: period.id })
                  setPhase('done')
                  setFeedback('You listen through the rest of the block.')
                }}
              >
                <strong>Stay quiet and listen</strong>
                <span>Still counts as attending</span>
              </button>
            </div>
          </>
        )}
        {phase === 'ask' && q && (
          <>
            <p className="activity-lead">Ms. Park calls on you. {q.prompt}</p>
            <div className="event-options">
              {q.choices.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="event-btn"
                  onClick={() => {
                    dayAct({ type: 'answer-class', correct: c.correct, periodId: period.id })
                    setFeedback(c.correct ? 'Solid answer.' : 'She corrects you gently and moves on.')
                    setPhase('done')
                  }}
                >
                  <strong>{c.label}</strong>
                </button>
              ))}
            </div>
          </>
        )}
        {phase === 'done' && (
          <>
            <p className="activity-lead">{feedback}</p>
            <button type="button" className="event-continue" onClick={close}>
              Stay seated until the bell
            </button>
          </>
        )}
      </div>
    </div>
  )
}
