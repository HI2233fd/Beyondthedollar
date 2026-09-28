import { useGame, type DialogueOption } from './GameState'

export function DialogueSystem() {
  const dialogue = useGame((s) => s.dialogue)
  const openDialogue = useGame((s) => s.openDialogue)
  const closeDialogue = useGame((s) => s.closeDialogue)

  if (!dialogue) return null

  const choose = (opt: DialogueOption) => {
    const before = useGame.getState().dialogue
    opt.action?.()
    const after = useGame.getState().dialogue
    // Action may replace or clear dialogue (hire result, credit decision, etc.).
    // Compare by identity — do not require `after` truthy or we can wipe a fresh result.
    if (after !== before) return
    if (opt.next) openDialogue(opt.next)
    else if (opt.close || !opt.next) closeDialogue()
  }

  return (
    <div className="dialogue">
      <div className="dialogue-inner">
        <div className="dialogue-name">{dialogue.name}</div>
        <div className="dialogue-text">{dialogue.text}</div>
        <div className="dialogue-options">
          {dialogue.options.map((opt, i) => (
            <button key={i} className="dialogue-option" onClick={() => choose(opt)}>
              {opt.label}
            </button>
          ))}
        </div>
        <div className="dialogue-hint">Press ESC to close</div>
      </div>
    </div>
  )
}
