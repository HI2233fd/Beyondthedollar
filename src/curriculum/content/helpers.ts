import type { Quiz, QuizQuestion } from '../types'

export function q(
  id: string,
  prompt: string,
  choices: string[],
  correctIndex: number,
  explanation: string,
): QuizQuestion {
  return { id, prompt, choices, correctIndex, explanation }
}

export function quiz(id: string, title: string, questions: QuizQuestion[]): Quiz {
  return { id, title, questions }
}
