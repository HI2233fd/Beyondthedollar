import { useState } from 'react'
import { Modal } from './components'
import { useGame } from '../game/store'
import { EVENTS, type EventChoice } from '../game/events'
import { CONCEPTS } from '../game/content'
import { money } from '../game/format'

function effectSummary(c: EventChoice): string[] {
  const out: string[] = []
  const e = c.effects
  if (e.cash) out.push(`${e.cash > 0 ? '+' : ''}${money(e.cash)} cash`)
  if (e.savings) out.push(`${e.savings > 0 ? '+' : ''}${money(e.savings)} savings`)
  if (e.addDebt) out.push(`+${money(e.addDebt.balance)} debt @ ${Math.round(e.addDebt.apr * 100)}% APR`)
  if (e.xp) out.push(`+${e.xp} XP`)
  return out
}

export function Encounter() {
  const { state, dispatch } = useGame()
  const [chosen, setChosen] = useState<string | null>(null)

  if (!state.pendingEventId) return null
  const ev = EVENTS.find((e) => e.id === state.pendingEventId)
  if (!ev) return null

  const chosenChoice = ev.choices.find((c) => c.id === chosen)
  const infoConcept = ev.info?.concept ? CONCEPTS.find((c) => c.id === ev.info!.concept) : null
  const knowsConcept = ev.info?.concept ? state.knownConcepts.includes(ev.info.concept) : false

  const resolve = () => {
    if (!chosenChoice) return
    dispatch({ type: 'RESOLVE_EVENT', eventId: ev.id, choiceId: chosenChoice.id })
    setChosen(null)
  }

  return (
    <Modal>
      <div className="modal-hero">
        <div className="between">
          <span className="tag info">{ev.category}</span>
          <span className="muted small">Month {state.month}</span>
        </div>
        <div className="emoji">{ev.emoji}</div>
        <h2>{ev.title}</h2>
      </div>
      <div className="modal-body">
        <p className="story-text">{ev.story}</p>

        {ev.info && (
          <div className="info-box">
            <div className="h">
              💡 {infoConcept ? infoConcept.title : 'Good to know'}
              {knowsConcept && <span className="tag good" style={{ marginLeft: 6 }}>You know this</span>}
            </div>
            <p>{ev.info.text}</p>
          </div>
        )}

        {!chosenChoice ? (
          <div className="grid" style={{ marginTop: 18, gap: 10 }}>
            <div className="field-label">What do you do?</div>
            {ev.choices.map((c) => {
              const highlight = c.smart && knowsConcept
              return (
                <button key={c.id} className="option-row" onClick={() => setChosen(c.id)}>
                  <div>
                    <div className="r-title">
                      {c.label}
                      {highlight && <span className="tag good" style={{ marginLeft: 8 }}>Smart move</span>}
                    </div>
                    {c.hint && <div className="r-sub">{c.hint}</div>}
                  </div>
                  <div className="row" style={{ gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {effectSummary(c).map((s, i) => (
                      <span key={i} className="tag">{s}</span>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div style={{ marginTop: 18 }}>
            <div className="field-label">Consequence</div>
            <div className="consequence">{chosenChoice.outcome}</div>
            <div className="row mt" style={{ justifyContent: 'flex-end' }}>
              <button className="btn ghost" onClick={() => setChosen(null)}>
                ← Reconsider
              </button>
              <button className="btn" onClick={resolve}>
                Continue →
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
