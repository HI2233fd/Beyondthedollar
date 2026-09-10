import { useState } from 'react'
import { useGame } from '../game/store'
import { Card, Bar, Tag } from '../ui/components'
import { CONCEPTS } from '../game/content'
import { skillLabel, skillLevel } from '../game/engine'
import type { SkillKey } from '../game/types'

const SKILL_META: { key: SkillKey; label: string; icon: string }[] = [
  { key: 'budgeting', label: 'Budgeting', icon: '🧮' },
  { key: 'saving', label: 'Saving', icon: '🐷' },
  { key: 'credit', label: 'Credit', icon: '📊' },
  { key: 'investing', label: 'Investing', icon: '📈' },
  { key: 'career', label: 'Career', icon: '💼' },
  { key: 'debt', label: 'Debt Mgmt', icon: '⚔️' },
]

export function Learn() {
  const { state, dispatch } = useGame()
  const [open, setOpen] = useState<string | null>(null)

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">The Money Lab</div>
        <h1>💡 Learn</h1>
        <p>Quick, practical money concepts. Knowledge unlocks better jobs and helps you spot smart moves during life’s surprises.</p>
      </div>

      <Card>
        <div className="card-title">🌟 Life Skills</div>
        <div className="grid g3" style={{ gap: 16 }}>
          {SKILL_META.map((s) => {
            const pts = state.skills[s.key]
            const lvl = skillLevel(pts)
            return (
              <div key={s.key}>
                <div className="between small">
                  <span>{s.icon} {s.label}</span>
                  <span className="muted">{skillLabel(pts)} · Lv {lvl}</span>
                </div>
                <Bar value={pts % 100} max={100} variant="cool" />
              </div>
            )
          })}
        </div>
      </Card>

      <div className="grid g2 mt-lg">
        {CONCEPTS.map((c) => {
          const known = state.knownConcepts.includes(c.id)
          const isOpen = open === c.id
          return (
            <Card key={c.id}>
              <div className="between" style={{ alignItems: 'flex-start' }}>
                <div className="card-title" style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: '1.4rem' }}>{c.emoji}</span> {c.title}
                </div>
                {known ? <Tag tone="good">✓ Learned</Tag> : <Tag tone="info">New</Tag>}
              </div>
              <div className="muted small">{c.short}</div>
              {isOpen && <p className="mt" style={{ lineHeight: 1.6 }}>{c.body}</p>}
              <div className="row mt" style={{ gap: 10 }}>
                <button className="btn ghost sm" onClick={() => setOpen(isOpen ? null : c.id)}>
                  {isOpen ? 'Hide' : 'Read'}
                </button>
                {!known && (
                  <button className="btn sm" onClick={() => dispatch({ type: 'LEARN', conceptId: c.id })}>
                    Mark as learned (+20 XP)
                  </button>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
