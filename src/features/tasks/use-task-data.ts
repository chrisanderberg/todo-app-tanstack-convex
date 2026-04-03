import { useMemo } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import {
  createPositionOptions,
} from '@/lib/ranking/task-ranking'
import type {
  RankDimension,
  MatrixPoint,
  PositionOption,
  ResolutionType,
  TaskStatus,
  TaskViewModel,
} from '@/lib/task-model'

export type TaskFormValues = {
  title: string
  description: string
  dueDate: string
  resolutionType: ResolutionType
  importancePosition: number
  urgencyPosition: number
}

export async function submitCreateTask(
  createTask: (args: {
    title: string
    description: string
    dueDate: string | null
    resolutionType: ResolutionType
    importancePosition: number
    urgencyPosition: number
  }) => Promise<unknown>,
  values: TaskFormValues,
) {
  try {
    await createTask({
      title: values.title,
      description: values.description,
      dueDate: values.dueDate || null,
      resolutionType: values.resolutionType,
      importancePosition: values.importancePosition,
      urgencyPosition: values.urgencyPosition,
    })
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Something went wrong while creating the task.')
  }
}

export function useMatrixTasks() {
  return useQuery(api.tasks.matrixData, {}) ?? []
}

export function useAllTasks() {
  return (useQuery(api.tasks.listTasks, {}) ?? []) as TaskViewModel[]
}

export function useTaskDetail(taskId: string) {
  return useQuery(api.tasks.getTaskDetail, {
    taskId: taskId as Id<'tasks'>,
  })
}

export function useRankingChoices(currentTaskId?: string) {
  const options = useQuery(api.tasks.rankingOptions, {
    taskId: currentTaskId ? (currentTaskId as Id<'tasks'>) : undefined,
  })

  return useMemo(() => {
    if (!options) {
      return {
        importance: [] as PositionOption[],
        urgency: [] as PositionOption[],
      }
    }

    return {
      importance: createPositionOptions(
        options.importance,
        currentTaskId as Id<'tasks'> | undefined,
      ),
      urgency: createPositionOptions(
        options.urgency,
        currentTaskId as Id<'tasks'> | undefined,
      ),
    }
  }, [currentTaskId, options])
}

export function useTaskActions() {
  const createTask = useMutation(api.tasks.createTask)
  const updateTask = useMutation(api.tasks.updateTask)
  const setTaskStatus = useMutation(api.tasks.setTaskStatus)
  const restoreTask = useMutation(api.tasks.restoreTask)
  const seedData = useMutation(api.seed.seedSampleData)

  return {
    createTask,
    updateTask,
    setTaskStatus,
    restoreTask,
    seedData,
  }
}

export function getDefaultTaskFormValues(
  importanceOptions: PositionOption[],
  urgencyOptions: PositionOption[],
): TaskFormValues {
  return {
    title: '',
    description: '',
    dueDate: '',
    resolutionType: null,
    importancePosition: importanceOptions[0]?.value ?? 0,
    urgencyPosition: urgencyOptions[0]?.value ?? 0,
  }
}

export function getTaskFormValues(task: TaskViewModel): TaskFormValues {
  return {
    title: task.title,
    description: task.description,
    dueDate: task.dueDate ?? '',
    resolutionType: task.resolutionType,
    importancePosition: task.importanceRank,
    urgencyPosition: task.urgencyRank,
  }
}

export function formatDueDate(value: string | null) {
  if (!value) {
    return 'No due date'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

export function formatShortDueDate(value: string | null) {
  if (!value) {
    return 'No due date'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

function getLocalDateValueParts(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return { year, month, day }
}

function differenceInCalendarDays(value: string, today = new Date()) {
  const { year, month, day } = getLocalDateValueParts(value)
  const dueUtc = Date.UTC(year, month - 1, day)
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  const msPerDay = 24 * 60 * 60 * 1000

  return Math.floor((dueUtc - todayUtc) / msPerDay)
}

export function formatDueDateContext(value: string | null) {
  if (!value) {
    return 'No due date'
  }

  const diffDays = differenceInCalendarDays(value)
  const formatted = formatDueDate(value)

  if (diffDays === 0) {
    return `Due today, ${formatted}`
  }

  if (diffDays === 1) {
    return `Due tomorrow, ${formatted}`
  }

  if (diffDays === -1) {
    return `Due yesterday, ${formatted}`
  }

  if (diffDays > 1 && diffDays <= 14) {
    return `Due in ${diffDays} days, ${formatted}`
  }

  if (diffDays < -1) {
    return `${Math.abs(diffDays)} days overdue, ${formatted}`
  }

  return formatted
}

export type DashboardSummary = {
  activeCount: number
  unresolvedCount: number
  dueSoonCount: number
  highestImportance: MatrixPoint[]
  highestUrgency: MatrixPoint[]
}

export function getDashboardSummary(points: MatrixPoint[]): DashboardSummary {
  const orderedByImportance = [...points].sort(
    (left, right) => left.importanceRank - right.importanceRank,
  )
  const orderedByUrgency = [...points].sort(
    (left, right) => left.urgencyRank - right.urgencyRank,
  )
  const dueSoonCount = points.filter((point) => {
    if (!point.dueDate) {
      return false
    }

    const diffDays = differenceInCalendarDays(point.dueDate, new Date())

    return diffDays >= 0 && diffDays <= 3
  }).length

  return {
    activeCount: points.length,
    unresolvedCount: points.filter((point) => !point.resolutionType).length,
    dueSoonCount,
    highestImportance: orderedByImportance.slice(0, 3),
    highestUrgency: orderedByUrgency.slice(0, 3),
  }
}

export function sortTasks(
  tasks: TaskViewModel[],
  sortKey: 'title' | 'status' | 'importanceRank' | 'urgencyRank' | 'dueDate',
) {
  return [...tasks].sort((left, right) => {
    if (sortKey === 'title') {
      return left.title.localeCompare(right.title)
    }

    if (sortKey === 'status') {
      return left.status.localeCompare(right.status) || left.title.localeCompare(right.title)
    }

    if (sortKey === 'dueDate') {
      return (left.dueDate ?? '9999-12-31').localeCompare(right.dueDate ?? '9999-12-31')
    }

    return left[sortKey] - right[sortKey] || left.title.localeCompare(right.title)
  })
}

export type TaskFilter = 'all' | 'active' | 'completed' | 'archived' | 'unresolved'

export function filterTasks(tasks: TaskViewModel[], filter: TaskFilter) {
  if (filter === 'all') {
    return tasks
  }

  if (filter === 'unresolved') {
    return tasks.filter((task) => !task.resolutionType)
  }

  return tasks.filter((task) => task.status === filter)
}

export function canReRank(status: TaskStatus) {
  return status === 'active'
}

export function getOrderedActiveTasks(
  tasks: TaskViewModel[],
  dimension: RankDimension,
) {
  const key = dimension === 'importance' ? 'importanceRank' : 'urgencyRank'

  return tasks
    .filter((task) => task.status === 'active')
    .sort((left, right) => left[key] - right[key] || left.title.localeCompare(right.title))
}
