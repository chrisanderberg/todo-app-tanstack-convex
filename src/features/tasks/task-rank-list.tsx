import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ResolutionBadge } from '@/features/tasks/task-badges'
import { formatDueDateContext } from '@/features/tasks/use-task-data'
import type { RankDimension, TaskViewModel } from '@/lib/task-model'
import { cn } from '@/lib/utils'
import { moveItemToPosition } from '@/lib/ranking/task-ranking'

type DragState = {
  taskId: string
  overIndex: number | null
}

export function TaskRankList({
  dimension,
  onMove,
  tasks,
}: {
  dimension: RankDimension
  onMove: (taskId: string, index: number) => Promise<void> | void
  tasks: TaskViewModel[]
}) {
  const [dragState, setDragState] = useState<DragState | null>(null)

  const title = dimension === 'importance' ? 'Importance order' : 'Urgency order'
  const description =
    dimension === 'importance'
      ? 'Drag tasks to reshape what matters most.'
      : 'Drag tasks to reflect what needs attention first.'

  const orderedTasks = useMemo(
    () =>
      [...tasks].sort((left, right) => {
        const key = dimension === 'importance' ? 'importanceRank' : 'urgencyRank'
        return left[key] - right[key] || left.title.localeCompare(right.title)
      }),
    [dimension, tasks],
  )

  const previewTasks = useMemo(() => {
    if (!dragState || dragState.overIndex === null) {
      return orderedTasks
    }

    return moveItemToPosition(
      orderedTasks,
      (task) => task.id === dragState.taskId,
      dragState.overIndex,
    )
  }, [dragState, orderedTasks])

  async function commitMove(index: number) {
    if (!dragState?.taskId) {
      return
    }

    const movingTask = orderedTasks.find((task) => task.id === dragState.taskId)
    if (!movingTask) {
      setDragState(null)
      return
    }

    const currentIndex = orderedTasks.findIndex((task) => task.id === dragState.taskId)
    if (currentIndex === index) {
      setDragState(null)
      return
    }

    await onMove(dragState.taskId, index)
    setDragState(null)
  }

  return (
    <Card>
      <CardHeader>
        <p className="eyebrow">Direct manipulation</p>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {previewTasks.map((task, index) => {
          const rank = dimension === 'importance' ? task.importanceRank : task.urgencyRank
          const isDragging = dragState?.taskId === task.id
          const isTarget = dragState?.overIndex === index && dragState.taskId !== task.id

          return (
            <div
              key={task.id}
              className={cn(
                'rounded-[1.35rem] border border-[var(--line)] bg-[var(--panel-soft)] p-4 transition',
                isDragging && 'opacity-45',
                isTarget && 'border-[var(--accent-ink)] bg-[var(--paper)]',
              )}
              draggable
              onDragEnd={() => setDragState(null)}
              onDragOver={(event) => {
                event.preventDefault()
                if (!dragState) {
                  return
                }
                setDragState((current) =>
                  current ? { ...current, overIndex: index } : current,
                )
              }}
              onDragStart={() => {
                setDragState({ taskId: task.id, overIndex: index })
              }}
              onDrop={(event) => {
                event.preventDefault()
                void commitMove(index)
              }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 text-[var(--muted-ink)]">
                  <GripVertical className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-ink)]">
                      #{rank + 1}
                    </span>
                    <ResolutionBadge resolutionType={task.resolutionType} />
                  </div>
                  <Link
                    className="mt-2 block font-semibold text-[var(--ink)] no-underline hover:text-[var(--accent-ink)]"
                    params={{ taskId: task.id }}
                    to="/tasks/$taskId"
                  >
                    {task.title}
                  </Link>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-ink)]">
                    {task.description || 'No description'}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[var(--muted-ink)]">
                    {formatDueDateContext(task.dueDate)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  <Button
                    aria-label={`Move ${task.title} up`}
                    disabled={index === 0}
                    size="icon"
                    variant="ghost"
                    onClick={() => void onMove(task.id, index - 1)}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    aria-label={`Move ${task.title} down`}
                    disabled={index === orderedTasks.length - 1}
                    size="icon"
                    variant="ghost"
                    onClick={() => void onMove(task.id, index + 1)}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}

        <div
          className={cn(
            'rounded-[1.2rem] border border-dashed border-[var(--line-strong)] px-4 py-3 text-center text-sm text-[var(--muted-ink)] transition',
            dragState && dragState.overIndex === orderedTasks.length
              ? 'border-[var(--accent-ink)] bg-[var(--paper)] text-[var(--ink)]'
              : '',
          )}
          onDragOver={(event) => {
            event.preventDefault()
            if (!dragState) {
              return
            }
            setDragState((current) =>
              current ? { ...current, overIndex: orderedTasks.length } : current,
            )
          }}
          onDrop={(event) => {
            event.preventDefault()
            void commitMove(orderedTasks.length - 1)
          }}
        >
          Drag here to place at the end
        </div>
      </CardContent>
    </Card>
  )
}
