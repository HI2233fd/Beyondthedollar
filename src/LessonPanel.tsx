import { useEffect, useMemo, useState } from 'react'
import { useGame } from './GameState'
import { getLesson, unitForLesson } from './curriculum'
import { BUILDING_LABEL } from './curriculum/buildingMap'
import { resolveLessonBeats } from './curriculum/interactiveBeats'
import type { LessonChoice } from './curriculum/types'

export function LessonPanel() {
  const lessonId = useGame((s) => s.activeLessonId)
  const closeLesson = useGame((s) => s.closeLesson)
  const startQuiz = useGame((s) => s.startQuiz)
  const completed = useGame((s) => s.completedTopicIds)

  const lesson = useMemo(() => (lessonId ? getLesson(lessonId) : null), [lessonId])
  const unit = useMemo(() => (lessonId ? unitForLesson(lessonId) : null), [lessonId])
  const beats = useMemo(() => (lesson ? resolveLessonBeats(lesson) : []), [lesson])

  const [step, setStep] = useState(0)
  const [picked, setPicked] = useState<LessonChoice | null>(null)
  const [strongPicks, setStrongPicks] = useState(0)

  useEffect(() => {
    setStep(0)
    setPicked(null)
    setStrongPicks(0)
  }, [lessonId])

  if (!lessonId || !lesson || !unit) return null

  const topic = unit.topics.find((t) => t.lesson.id === lesson.id)
  const alreadyDone = topic ? completed.includes(topic.id) : false
  const beat = beats[step]
  const total = beats.length
  const atEnd = step >= total
  const pct = total ? Math.round((Math.min(step, total) / total) * 100) : 0

  const advance = () => {
    setPicked(null)
    setStep((s) => s + 1)
  }

  const onPick = (c: LessonChoice) => {
    setPicked(c)
    if (c.strong) setStrongPicks((n) => n + 1)
  }

  return (
    <div className="modal-overlay curriculum-overlay">
      <div className="curriculum-card lesson-interactive">
        <div className="curriculum-meta">
          <span className="curriculum-badge">Unit {unit.number}</span>
          <span className="curriculum-building">{BUILDING_LABEL[unit.buildingId]}</span>
          <span className="lesson-step-pill">
            {atEnd ? 'Done' : `${step + 1} / ${total}`}
          </span>
        </div>
        <h2 className="curriculum-title">{lesson.title}</h2>
        <p className="curriculum-unit-line">
          {unit.title} · {topic?.title}
        </p>

        <div className="lesson-progress-bar">
          <div style={{ width: `${atEnd ? 100 : pct}%` }} />
        </div>

        {!atEnd && beat && (
          <div className="lesson-beat">
            {beat.label && <div className="lesson-beat-label">{beat.label}</div>}
            <p className="lesson-beat-prompt">{beat.prompt}</p>
            {beat.detail && (
              <div className="lesson-beat-detail">
                {beat.detail.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            )}

            {beat.kind === 'choice' && beat.choices && !picked && (
              <div className="lesson-choices">
                {beat.choices.map((c) => (
                  <button key={c.id} type="button" className="lesson-choice-btn" onClick={() => onPick(c)}>
                    {c.label}
                  </button>
                ))}
              </div>
            )}

            {picked && (
              <div className={`lesson-reaction ${picked.strong ? 'strong' : ''}`}>
                <strong>{picked.strong ? 'Strong move' : 'Noted'}</strong>
                <p>{picked.reaction}</p>
              </div>
            )}
          </div>
        )}

        {atEnd && (
          <div className="lesson-beat lesson-finale">
            <div className="lesson-beat-label">Locked in</div>
            <p className="lesson-beat-prompt">{lesson.whyItMatters}</p>
            <p className="lesson-finale-meta">
              You worked through {total} interactive beats
              {strongPicks > 0 ? ` · ${strongPicks} strong picks` : ''}.
            </p>
          </div>
        )}

        <div className="curriculum-actions">
          <button type="button" className="curriculum-btn ghost" onClick={closeLesson}>
            Close
          </button>
          {!atEnd ? (
            <button
              type="button"
              className="curriculum-btn primary"
              disabled={beat?.kind === 'choice' && !picked}
              onClick={advance}
            >
              {beat?.kind === 'choice' && !picked ? 'Pick one' : step === total - 1 ? 'Finish lesson' : 'Continue'}
            </button>
          ) : !alreadyDone ? (
            <button type="button" className="curriculum-btn primary" onClick={() => startQuiz(lesson.quiz.id)}>
              Take quiz
            </button>
          ) : (
            <button type="button" className="curriculum-btn primary" onClick={closeLesson}>
              Already completed
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
