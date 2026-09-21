import { useMemo, useState } from 'react'
import { useGame } from '../GameState'
import { LIFE_GOALS, type CharacterAppearance, type LifeGoalId } from './types'

const SKINS = ['#f1c27d', '#d0996b', '#c68642', '#8d5524', '#5c3317']
const HAIRS = ['#241a12', '#4a3728', '#1a1a1a', '#6b4423', '#c4a574', '#e8e0d5']
const SHIRTS = ['#2563eb', '#059669', '#dc2626', '#7c3aed', '#0f766e', '#ea580c']
const PANTS = ['#1f2937', '#334155', '#3f3f46', '#1e3a5f', '#44403c']
const FACES: CharacterAppearance['face'][] = ['soft', 'angular', 'round']
const BODIES: CharacterAppearance['body'][] = ['slim', 'average', 'athletic']

type Step = 'identity' | 'look' | 'goals'

export function CharacterCreation() {
  const beginLife = useGame((s) => s.beginLife)
  const continueSave = useGame((s) => s.continueFromSave)
  const hasSave = useMemo(() => useGame.getState().hasSaveGame(), [])

  const [step, setStep] = useState<Step>('identity')
  const [name, setName] = useState('Alex')
  const [age, setAge] = useState(18)
  const [appearance, setAppearance] = useState<CharacterAppearance>(() => ({
    skin: SKINS[1],
    hair: HAIRS[0],
    shirt: SHIRTS[0],
    pants: PANTS[0],
    face: 'soft',
    body: 'average',
  }))
  const [goals, setGoals] = useState<LifeGoalId[]>(['career', 'financialFreedom'])

  const toggleGoal = (id: LifeGoalId) => {
    setGoals((prev) => {
      if (prev.includes(id)) return prev.filter((g) => g !== id)
      if (prev.length >= 4) return [...prev.slice(1), id]
      return [...prev, id]
    })
  }

  const canContinue =
    step === 'identity'
      ? name.trim().length >= 2
      : step === 'look'
        ? true
        : goals.length >= 1

  return (
    <div className="create-overlay">
      <div className="create-shell">
        <header className="create-brand">
          <p className="create-eyebrow">Beyond the Dollar</p>
          <h1>Build Your Life</h1>
          <p className="create-sub">Not a course. A life you live — choices, people, and money that matter.</p>
        </header>

        {hasSave && step === 'identity' && (
          <button type="button" className="create-continue-save" onClick={() => continueSave()}>
            Continue saved life
          </button>
        )}

        <nav className="create-steps" aria-label="Creation steps">
          {(['identity', 'look', 'goals'] as Step[]).map((s) => (
            <button
              key={s}
              type="button"
              className={`create-step ${step === s ? 'active' : ''}`}
              onClick={() => setStep(s)}
            >
              {s === 'identity' ? '1 · You' : s === 'look' ? '2 · Look' : '3 · Goals'}
            </button>
          ))}
        </nav>

        {step === 'identity' && (
          <section className="create-panel">
            <label className="create-field">
              <span>Name</span>
              <input value={name} maxLength={24} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </label>
            <label className="create-field">
              <span>Starting age</span>
              <div className="create-age-row">
                <input
                  type="range"
                  min={16}
                  max={28}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                />
                <strong>{age}</strong>
              </div>
            </label>
          </section>
        )}

        {step === 'look' && (
          <section className="create-panel create-look">
            <div className="create-preview" aria-hidden>
              <div
                className={`create-avatar body-${appearance.body} face-${appearance.face}`}
                style={
                  {
                    '--skin': appearance.skin,
                    '--hair': appearance.hair,
                    '--shirt': appearance.shirt,
                    '--pants': appearance.pants,
                  } as React.CSSProperties
                }
              >
                <div className="av-hair" />
                <div className="av-head" />
                <div className="av-torso" />
                <div className="av-legs" />
              </div>
              <p>{name || 'You'}</p>
            </div>
            <div className="create-swatches">
              <SwatchRow label="Skin" values={SKINS} value={appearance.skin} onPick={(skin) => setAppearance((a) => ({ ...a, skin }))} />
              <SwatchRow label="Hair" values={HAIRS} value={appearance.hair} onPick={(hair) => setAppearance((a) => ({ ...a, hair }))} />
              <SwatchRow label="Shirt" values={SHIRTS} value={appearance.shirt} onPick={(shirt) => setAppearance((a) => ({ ...a, shirt }))} />
              <SwatchRow label="Pants" values={PANTS} value={appearance.pants} onPick={(pants) => setAppearance((a) => ({ ...a, pants }))} />
              <div className="create-chip-row">
                <span>Face</span>
                {FACES.map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={appearance.face === f ? 'chip active' : 'chip'}
                    onClick={() => setAppearance((a) => ({ ...a, face: f }))}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="create-chip-row">
                <span>Body</span>
                {BODIES.map((b) => (
                  <button
                    key={b}
                    type="button"
                    className={appearance.body === b ? 'chip active' : 'chip'}
                    onClick={() => setAppearance((a) => ({ ...a, body: b }))}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {step === 'goals' && (
          <section className="create-panel">
            <p className="create-hint">Pick up to 4 ambitions. They personalize opportunities — they never lock paths.</p>
            <div className="goal-grid">
              {LIFE_GOALS.map((g) => {
                const on = goals.includes(g.id)
                return (
                  <button
                    key={g.id}
                    type="button"
                    className={`goal-card ${on ? 'selected' : ''}`}
                    onClick={() => toggleGoal(g.id)}
                  >
                    <span className="goal-icon">{g.icon}</span>
                    <strong>{g.label}</strong>
                    <span>{g.blurb}</span>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        <footer className="create-footer">
          {step !== 'identity' && (
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setStep(step === 'goals' ? 'look' : 'identity')}
            >
              Back
            </button>
          )}
          {step !== 'goals' ? (
            <button
              type="button"
              className="btn-primary"
              disabled={!canContinue}
              onClick={() => setStep(step === 'identity' ? 'look' : 'goals')}
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary"
              disabled={!canContinue}
              onClick={() => beginLife(name.trim(), age, appearance, goals)}
            >
              Begin Life
            </button>
          )}
        </footer>
      </div>
    </div>
  )
}

function SwatchRow({
  label,
  values,
  value,
  onPick,
}: {
  label: string
  values: string[]
  value: string
  onPick: (v: string) => void
}) {
  return (
    <div className="swatch-row">
      <span>{label}</span>
      <div>
        {values.map((c) => (
          <button
            key={c}
            type="button"
            className={`swatch ${value === c ? 'active' : ''}`}
            style={{ background: c }}
            aria-label={`${label} ${c}`}
            onClick={() => onPick(c)}
          />
        ))}
      </div>
    </div>
  )
}
