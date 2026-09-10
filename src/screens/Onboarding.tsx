import { useState } from 'react'
import { useGame } from '../game/store'
import { AVATARS, STAGE_ORDER, TRAITS } from '../game/content'
import { STAGE_LABEL } from '../game/engine'
import type { LifeStage } from '../game/types'

export function Welcome() {
  const { dispatch } = useGame()
  return (
    <div className="center-stage">
      <div className="stage-card center">
        <div style={{ fontSize: '3.4rem' }}>🌆</div>
        <div className="page-head" style={{ marginTop: 8 }}>
          <div className="eyebrow">A financial life simulator</div>
          <h1>
            Welcome to <span className="grad-text">Beyond&nbsp;the&nbsp;Dollar</span>
          </h1>
        </div>
        <p className="muted" style={{ maxWidth: 460, margin: '0 auto 8px' }}>
          Move to the city of <strong>Merridian</strong> and build a life. Every choice — where you
          live, work, spend, save, and invest — teaches you how money really works. There is no
          single right way to live. Just your way.
        </p>
        <div className="row center" style={{ justifyContent: 'center', margin: '18px 0' }}>
          <span className="tag info">🏙️ Explore a living city</span>
          <span className="tag good">📈 Real financial systems</span>
          <span className="tag warn">🎯 Choices with consequences</span>
        </div>
        <button className="btn" style={{ marginTop: 10 }} onClick={() => dispatch({ type: 'SET_STEP', step: 'character' })}>
          Start your life →
        </button>
      </div>
    </div>
  )
}

export function CharacterCreation() {
  const { dispatch } = useGame()
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState(AVATARS[0])
  const [pronouns, setPronouns] = useState('they/them')
  const [trait, setTrait] = useState(TRAITS[0].id)

  return (
    <div className="center-stage">
      <div className="stage-card wide">
        <div className="page-head">
          <div className="eyebrow">Step 1 of 2 · Create your character</div>
          <h1>Who are you?</h1>
        </div>
        <div className="grid g2" style={{ alignItems: 'start' }}>
          <div className="grid" style={{ gap: 16 }}>
            <div>
              <label className="field-label">Your name</label>
              <input className="input" placeholder="e.g. Alex" value={name} onChange={(e) => setName(e.target.value)} maxLength={18} />
            </div>
            <div>
              <label className="field-label">Pronouns</label>
              <select className="select" value={pronouns} onChange={(e) => setPronouns(e.target.value)}>
                <option>they/them</option>
                <option>she/her</option>
                <option>he/him</option>
              </select>
            </div>
            <div>
              <label className="field-label">Pick an avatar</label>
              <div className="avatar-grid">
                {AVATARS.map((a) => (
                  <button key={a} className={`avatar-btn ${avatar === a ? 'selected' : ''}`} onClick={() => setAvatar(a)}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid" style={{ gap: 10 }}>
            <label className="field-label">Choose a starting trait</label>
            {TRAITS.map((t) => (
              <button key={t.id} className={`option-row ${trait === t.id ? 'selected' : ''}`} onClick={() => setTrait(t.id)}>
                <div>
                  <div className="r-title">{t.label}</div>
                  <div className="r-sub">{t.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="between mt-lg">
          <button className="btn ghost" onClick={() => dispatch({ type: 'SET_STEP', step: 'welcome' })}>
            ← Back
          </button>
          <button
            className="btn"
            disabled={!name.trim()}
            onClick={() => dispatch({ type: 'CREATE_CHARACTER', name: name.trim(), avatar, pronouns, trait })}
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  )
}

const STAGE_INFO: Record<LifeStage, { emoji: string; desc: string; money: string }> = {
  highSchool: { emoji: '🎒', desc: 'Age 16. Allowance + a part-time job. Learn the basics with low stakes.', money: '$250 cash · $100 savings · $150/mo support' },
  college: { emoji: '🎓', desc: 'Age 19. Bigger costs, bigger opportunities. Loans and scholarships in play.', money: '$600 cash · $300 savings · $250/mo support' },
  firstJob: { emoji: '💼', desc: 'Age 22. Real paychecks, real rent. Time to stand on your own.', money: '$1,200 cash · $800 savings' },
  careerGrowth: { emoji: '📈', desc: 'Age 27. Higher income and the chance to build serious wealth.', money: '$3,500 cash · $2,500 savings' },
  entrepreneurship: { emoji: '🚀', desc: 'Age 32. Big risks, big rewards. Build something of your own.', money: '$5,000 cash · $3,000 savings' },
}

export function LifeSetup() {
  const { state, dispatch } = useGame()
  const [stage, setStage] = useState<LifeStage>('highSchool')
  const [goal, setGoal] = useState('')

  return (
    <div className="center-stage">
      <div className="stage-card wide">
        <div className="page-head">
          <div className="eyebrow">Step 2 of 2 · Set up your life</div>
          <h1>
            {state.character.avatar} Where does {state.character.name || 'your story'} begin?
          </h1>
          <p>Pick the life stage you want to start in. You can grow into later stages as you progress.</p>
        </div>
        <div className="grid" style={{ gap: 10 }}>
          {STAGE_ORDER.map((st) => (
            <button key={st} className={`option-row ${stage === st ? 'selected' : ''}`} onClick={() => setStage(st)}>
              <div className="row" style={{ alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: '1.7rem' }}>{STAGE_INFO[st].emoji}</span>
                <div>
                  <div className="r-title">{STAGE_LABEL[st]}</div>
                  <div className="r-sub">{STAGE_INFO[st].desc}</div>
                </div>
              </div>
              <span className="tag info" style={{ whiteSpace: 'nowrap' }}>{STAGE_INFO[st].money}</span>
            </button>
          ))}
        </div>
        <div className="mt-lg">
          <label className="field-label">What is one money goal you want to chase? (optional)</label>
          <input className="input" placeholder="e.g. Save for a car, invest my first $1,000…" value={goal} onChange={(e) => setGoal(e.target.value)} maxLength={60} />
        </div>
        <div className="between mt-lg">
          <button className="btn ghost" onClick={() => dispatch({ type: 'SET_STEP', step: 'character' })}>
            ← Back
          </button>
          <button className="btn" onClick={() => dispatch({ type: 'START_LIFE', stage, goal: goal.trim() })}>
            Begin life in {STAGE_LABEL[stage]} →
          </button>
        </div>
      </div>
    </div>
  )
}
