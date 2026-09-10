import { useGame, type DialogueOption } from './GameState'

export function DialogueSystem() {
  const dialogue = useGame((s) => s.dialogue)
  const openDialogue = useGame((s) => s.openDialogue)
  const closeDialogue = useGame((s) => s.closeDialogue)

  if (!dialogue) return null

  const choose = (opt: DialogueOption) => {
    opt.action?.()
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
