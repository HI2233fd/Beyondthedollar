import { useMemo } from 'react'
import { useGame } from './GameState'
import { getLesson, unitForLesson } from './curriculum'
import { BUILDING_LABEL } from './curriculum/buildingMap'

export function LessonPanel() {
  const lessonId = useGame((s) => s.activeLessonId)
  const closeLesson = useGame((s) => s.closeLesson)
  const startQuiz = useGame((s) => s.startQuiz)
  const completed = useGame((s) => s.completedTopicIds)

  const lesson = useMemo(() => (lessonId ? getLesson(lessonId) : null), [lessonId])
  const unit = useMemo(() => (lessonId ? unitForLesson(lessonId) : null), [lessonId])

  if (!lessonId || !lesson || !unit) return null

  const topic = unit.topics.find((t) => t.lesson.id === lesson.id)
  const alreadyDone = topic ? completed.includes(topic.id) : false
  const paragraphs = lesson.body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)

  return (
    <div className="modal-overlay curriculum-overlay">
      <div className="curriculum-card">
        <div className="curriculum-meta">
          <span className="curriculum-badge">Unit {unit.number}</span>
          <span className="curriculum-building">{BUILDING_LABEL[unit.buildingId]}</span>
        </div>
        <h2 className="curriculum-title">{lesson.title}</h2>
        <p className="curriculum-unit-line">
          {unit.title} · {topic?.title}
        </p>
        <div className="curriculum-body">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <p className="curriculum-why">
          <strong>Why this matters:</strong> {lesson.whyItMatters}
        </p>
        <div className="curriculum-actions">
          <button type="button" className="curriculum-btn ghost" onClick={closeLesson}>
            Close
          </button>
          {!alreadyDone ? (
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
