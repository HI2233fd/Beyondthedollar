import { useGame } from '../GameState'
import { CONCEPT_BY_ID } from './concepts'
import { questionsForLevel } from './checkpoints'
import { levelTitle } from './engine'

export function CheckpointPanel() {
  const open = useGame((s) => s.checkpointOpen)
  const education = useGame((s) => s.financialEdu)
  const answer = useGame((s) => s.answerCheckpoint)
  const submit = useGame((s) => s.submitCheckpoint)
  const close = useGame((s) => s.closeCheckpoint)
  const openConcept = useGame((s) => s.openConcept)
  const active = education.activeCheckpoint
  if (!open || !active) return null

  const questions = active.questionIds
    .map((id) => questionsForLevel(active.level).find((q) => q.id === id))
    .filter((q): q is NonNullable<typeof q> => !!q)
  const allAnswered = questions.every((q) => active.answers[q.id] !== undefined)
  const correct = questions.filter((q) => active.answers[q.id] === q.correctIndex).length
  const pct = questions.length ? Math.round((correct / questions.length) * 100) : 0
  const passed = education.lastResult?.passed && education.lastResult.level === active.level && active.submitted

  return (
    <div className="modal-overlay curriculum-overlay">
      <div className="curriculum-card quiz-card">
        <div className="curriculum-meta">
          <span className="curriculum-badge">Checkpoint</span>
          <span className="curriculum-building">
            Life {active.level} · {levelTitle(active.level)}
          </span>
        </div>
        <h2 className="curriculum-title">Show what you can do with it</h2>
        <p className="phone-muted">Passing is {Math.round(education.passThreshold * 100)}%. A miss points you at the idea to practice. You can retry.</p>
        <div className="quiz-list">
          {questions.map((q, i) => {
            const chosen = active.answers[q.id]
            return (
              <div key={q.id} className="quiz-q">
                <div className="quiz-prompt">
                  {i + 1}. {q.prompt}
                </div>
                <div className="quiz-choices">
                  {q.choices.map((c, ci) => {
                    let cls = 'quiz-choice'
                    if (active.submitted) {
                      if (ci === q.correctIndex) cls += ' correct'
                      else if (chosen === ci) cls += ' wrong'
                    } else if (chosen === ci) cls += ' selected'
                    return (
                      <button key={c} type="button" className={cls} disabled={active.submitted} onClick={() => answer(q.id, ci)}>
                        {c}
                      </button>
                    )
                  })}
                </div>
                {active.submitted && <p className="quiz-explain">{q.explanation}</p>}
              </div>
            )
          })}
        </div>
        {active.submitted && (
          <div className="quiz-result">
            <p>
              {pct}% · {correct}/{questions.length}. {passed ? 'Checkpoint passed.' : 'Not yet. Review the ideas you missed, then try a fresh set.'}
            </p>
            {!passed && (
              <div className="lesson-choices">
                {education.remediation.map((id) => (
                  <button key={id} type="button" className="quiz-choice" onClick={() => openConcept(id)}>
                    Review {CONCEPT_BY_ID[id]?.title ?? id}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="curriculum-actions">
          {!active.submitted && (
            <button type="button" className="curriculum-btn primary" disabled={!allAnswered} onClick={submit}>
              Submit checkpoint
            </button>
          )}
          <button type="button" className="curriculum-btn ghost" onClick={close}>
            {active.submitted ? 'Close' : 'Finish later'}
          </button>
        </div>
      </div>
    </div>
  )
}
