import type {
  PositionOption,
  RankedTaskUpdate,
  RankDimension,
  RankableTask,
} from '../task-model'

function clampIndex(index: number, length: number) {
  if (length <= 0) {
    return 0
  }

  return Math.max(0, Math.min(index, length))
}

export function percentileFromRank(rank: number, totalTasks: number) {
  if (totalTasks <= 1) {
    return 0
  }

  return rank / (totalTasks - 1)
}

export function positionFromPercentile(
  percentile: number,
  totalTasks: number,
) {
  if (totalTasks <= 1) {
    return 0
  }

  const maxIndex = totalTasks - 1
  return clampIndex(Math.round(percentile * maxIndex), maxIndex)
}

export function insertAtPosition<T>(
  items: readonly T[],
  item: T,
  rawPosition: number,
) {
  const position = clampIndex(rawPosition, items.length)
  const next = [...items]
  next.splice(position, 0, item)
  return next
}

export function moveItemToPosition<T>(
  items: readonly T[],
  predicate: (item: T) => boolean,
  rawPosition: number,
) {
  const currentIndex = items.findIndex(predicate)
  if (currentIndex === -1) {
    return [...items]
  }

  const next = [...items]
  const [item] = next.splice(currentIndex, 1)
  const position = clampIndex(rawPosition, next.length)
  next.splice(position, 0, item)
  return next
}

export function buildOrderedIds(
  tasks: readonly RankableTask[],
  dimension: RankDimension,
) {
  const key = dimension === 'importance' ? 'importanceRank' : 'urgencyRank'
  return [...tasks]
    .sort((left, right) => left[key] - right[key] || left.id.localeCompare(right.id))
    .map((task) => task.id)
}

export function recomputeRankedTaskUpdates(
  tasks: readonly RankableTask[],
  importanceOrderedIds: readonly string[],
  urgencyOrderedIds: readonly string[],
) {
  const totalTasks = tasks.length
  const updates = new Map<string, RankedTaskUpdate>()

  const importanceRanks = new Map(
    importanceOrderedIds.map((taskId, index) => [taskId, index]),
  )
  const urgencyRanks = new Map(
    urgencyOrderedIds.map((taskId, index) => [taskId, index]),
  )

  for (const task of tasks) {
    const importanceRank = importanceRanks.get(task.id)
    const urgencyRank = urgencyRanks.get(task.id)
    if (importanceRank === undefined || urgencyRank === undefined) {
      throw new Error(`Missing rank assignment for task ${task.id}`)
    }

    updates.set(task.id, {
      importanceRank,
      urgencyRank,
      importancePercentile: percentileFromRank(importanceRank, totalTasks),
      urgencyPercentile: percentileFromRank(urgencyRank, totalTasks),
    })
  }

  return updates
}

export function createPositionOptions(
  orderedTasks: readonly { id: string; title: string }[],
  currentTaskId?: string,
): PositionOption[] {
  const filteredTasks = currentTaskId
    ? orderedTasks.filter((task) => task.id !== currentTaskId)
    : orderedTasks

  if (filteredTasks.length === 0) {
    return [{ value: 0, label: '1. First task' }]
  }

  return filteredTasks.map((task, index) => ({
    value: index,
    label: `${index + 1}. Before ${task.title}`,
  })).concat({
    value: filteredTasks.length,
    label: `${filteredTasks.length + 1}. After ${filteredTasks.at(-1)?.title}`,
  })
}
