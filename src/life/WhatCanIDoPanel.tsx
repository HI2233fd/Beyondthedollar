import { useGame } from '../GameState'
import { CATEGORY_META } from './optionsEngine'
import { exitSpawn, BUILDINGS, HOME_BEDROOM_START } from '../cityLayout'
import { INTERIOR_SPAWN } from '../Interiors/spawns'

export function WhatCanIDoPanel() {
  const open = useGame((s) => s.optionsOpen)
  const close = useGame((s) => s.closeOptions)
  const options = useGame((s) => s.activityOptions())
  const enterScene = useGame((s) => s.enterScene)
  const openPhone = useGame((s) => s.openPhone)
  const openDialogue = useGame((s) => s.openDialogue)

  if (!open) return null

  const run = (action?: (typeof options)[0]['action']) => {
    close()
    switch (action) {
      case 'phone':
        openPhone()
        break
      case 'goto-bank':
        enterScene('bank', INTERIOR_SPAWN.bank)
        break
      case 'goto-office':
        enterScene('office', INTERIOR_SPAWN.office)
        break
      case 'goto-grocery':
        enterScene('grocery', INTERIOR_SPAWN.grocery)
        break
      case 'goto-college':
        enterScene('college', INTERIOR_SPAWN.college)
        break
      case 'goto-home':
        enterScene('home', HOME_BEDROOM_START)
        break
      case 'goto-city': {
        const home = BUILDINGS.find((x) => x.id === 'home')!
        enterScene('city', exitSpawn(home))
        break
      }
      case 'talk-jordan':
        enterScene('home', HOME_BEDROOM_START)
        window.setTimeout(() => {
          useGame.getState().talkToNpc('home-jordan', 'Jordan', 'Caught up after checking options')
          openDialogue({
            name: 'Roommate — Jordan',
            text: 'Hey — good timing. Want a tip on what to do next, or just hang?',
            options: [
              {
                label: 'What should I chase?',
                next: {
                  name: 'Roommate — Jordan',
                  text: 'Bank if you still need checking. Otherwise Summit interview or FreshMart run. Check “What can I do?” anytime.',
                  options: [{ label: 'On it', close: true }],
                },
              },
              { label: 'Later', close: true },
            ],
          })
        }, 400)
        break
      case 'advance-payday':
        useGame.getState().advanceToPayday()
        break
      case 'open-map':
        openPhone()
        break
      default:
        break
    }
  }

  return (
    <div className="modal-overlay scenario-overlay">
      <div className="options-card">
        <div className="options-top">
          <div>
            <div className="scenario-badge">What can I do?</div>
            <h2 className="options-title">Pick your next move</h2>
            <p className="options-sub">Several good paths fit your life right now — choose what you want.</p>
          </div>
          <button type="button" className="phone-close" onClick={close}>
            Close
          </button>
        </div>
        <div className="options-list">
          {options.map((o) => {
            const meta = CATEGORY_META[o.category]
            return (
              <button key={o.id} type="button" className="option-row" onClick={() => run(o.action)}>
                <span className="option-cat">
                  {meta.icon} {meta.label}
                </span>
                <strong>{o.title}</strong>
                <span className="option-reason">{o.reason}</span>
                {(o.locationHint || o.personHint) && (
                  <span className="option-meta">
                    {o.locationHint}
                    {o.personHint ? ` · ${o.personHint}` : ''}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function OptionsGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="6" cy="7" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="6" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="6" cy="17" r="1.4" fill="currentColor" stroke="none" />
      <path d="M10 7h8M10 12h8M10 17h8" />
    </svg>
  )
}

export function WhatCanIDoFab() {
  const open = useGame((s) => s.openOptions)
  const characterCreated = useGame((s) => s.characterCreated)
  const count = useGame((s) => s.activityOptions().length)
  if (!characterCreated) return null
  return (
    <button type="button" className="options-fab dock-btn" onClick={open} title="What can I do?">
      <OptionsGlyph />
      Options
      <span className="options-fab-count">{count}</span>
    </button>
  )
}
