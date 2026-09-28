import { useEffect, useState } from 'react'
import { useGame } from '../GameState'
import { CONCEPT_BY_ID } from './concepts'
import { levelTitle } from './engine'

export function ConceptLessonPanel() {
  const conceptId = useGame((s) => s.activeConceptId)
  const close = useGame((s) => s.closeConcept)
  const [picked, setPicked] = useState<string | null>(null)
  const [deep, setDeep] = useState(false)
  useEffect(() => {
    setPicked(null)
    setDeep(false)
  }, [conceptId])
  const concept = conceptId ? CONCEPT_BY_ID[conceptId] : undefined

  if (!concept) return null
  const choice = concept.lesson.choice
  const selected = choice.options.find((o) => o.id === picked)

  return (
    <div className="modal-overlay curriculum-overlay">
      <div className="curriculum-card lesson-interactive">
        <div className="curriculum-meta">
          <span className="curriculum-badge">Life {concept.level}</span>
          <span className="curriculum-building">{levelTitle(concept.level)}</span>
        </div>
        <h2 className="curriculum-title">{concept.title}</h2>
        <p className="lesson-beat-prompt">{concept.lesson.why}</p>
        <div className="lesson-beat-detail">
          {concept.lesson.points.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        {concept.lesson.deep && (
          <button type="button" className="mission-steps-toggle" onClick={() => setDeep((v) => !v)}>
            {deep ? 'Hide the longer note' : 'More detail'}
          </button>
        )}
        {deep && concept.lesson.deep && <p className="lesson-beat-detail">{concept.lesson.deep}</p>}
        <p className="lesson-beat-prompt">{choice.prompt}</p>
        {!selected && (
          <div className="lesson-choices">
            {choice.options.map((o) => (
              <button key={o.id} type="button" className="quiz-choice" onClick={() => setPicked(o.id)}>
                {o.label}
              </button>
            ))}
          </div>
        )}
        {selected && <p className="quiz-explain">{selected.reaction}</p>}
        <div className="curriculum-actions">
          <button type="button" className="curriculum-btn primary" onClick={close}>
            Back to life
          </button>
        </div>
      </div>
    </div>
  )
}
