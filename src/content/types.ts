import type { ComponentType } from 'react'

export interface DiagramProps {
  className?: string
}

export interface Topic {
  /** slug, unique across the whole course */
  id: string
  chapterId: string
  order: number
  title: string
  /** 1-2 sentence context seed passed to the AI panel */
  summary: string
  /** paragraphs of the written explanation */
  explanation: string[]
  Diagram?: ComponentType<DiagramProps>
  diagramCaption?: string
  videoIds: string[]
  isInterviewTopic: boolean
  interviewNote?: string
}

export interface QuizOption {
  id: string
  text: string
}

export interface ExamQuestion {
  id: string
  question: string
  /** exactly 4 options */
  options: QuizOption[]
  correctOptionId: string
  explanation: string
}

export interface Chapter {
  id: string
  order: number
  title: string
  description: string
  topics: Topic[]
  examQuestions: ExamQuestion[]
}
