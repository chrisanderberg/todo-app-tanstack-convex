export const TASK_STATUSES = ['active', 'completed', 'archived'] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

export const RESOLUTION_VALUES = [
  'do',
  'schedule',
  'delegate',
  'drop',
] as const
export type ResolutionType = (typeof RESOLUTION_VALUES)[number] | null

export type RankDimension = 'importance' | 'urgency'

export type RankableTask = {
  id: string
  status: TaskStatus
  importanceRank: number
  urgencyRank: number
}

export type RankedTaskUpdate = {
  importanceRank: number
  urgencyRank: number
  importancePercentile: number
  urgencyPercentile: number
}

export type TaskViewModel = {
  id: string
  title: string
  description: string
  status: TaskStatus
  resolutionType: ResolutionType
  dueDate: string | null
  createdAt: number
  updatedAt: number
  importanceRank: number
  urgencyRank: number
  importancePercentile: number
  urgencyPercentile: number
}

export type MatrixPoint = {
  id: string
  title: string
  description: string
  status: TaskStatus
  resolutionType: ResolutionType
  dueDate: string | null
  x: number
  y: number
  importanceRank: number
  urgencyRank: number
}

export type PositionOption = {
  value: number
  label: string
}

export const resolutionLabels: Record<Exclude<ResolutionType, null>, string> = {
  do: 'Do',
  schedule: 'Schedule',
  delegate: 'Delegate',
  drop: 'Drop',
}

export const resolutionTone: Record<Exclude<ResolutionType, null>, string> = {
  do: 'var(--tone-do)',
  schedule: 'var(--tone-schedule)',
  delegate: 'var(--tone-delegate)',
  drop: 'var(--tone-drop)',
}

export const statusLabels: Record<TaskStatus, string> = {
  active: 'Active',
  completed: 'Completed',
  archived: 'Archived',
}
