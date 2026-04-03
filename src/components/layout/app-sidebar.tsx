import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { GripVertical } from 'lucide-react'
import {
  getDashboardSummary,
  getOrderedActiveTasks,
  useAllTasks,
  useMatrixTasks,
  useTaskActions,
} from '@/features/tasks/use-task-data'
import { resolutionTone, type RankDimension, type TaskViewModel } from '@/lib/task-model'
import { cn } from '@/lib/utils'
import { moveItemToPosition } from '@/lib/ranking/task-ranking'
import type { Id } from '../../../convex/_generated/dataModel'

type DragState = {
  taskId: Id<'tasks'>
  overIndex: number | null
}

function SidebarRankList({
  tasks,
  dimension,
  onMove,
}: {
  tasks: TaskViewModel[]
  dimension: RankDimension
  onMove: (taskId: Id<'tasks'>, index: number) => Promise<void>
}) {
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [isMoving, setIsMoving] = useState(false)

  const orderedTasks = useMemo(
    () =>
      [...tasks].sort((a, b) => {
        const key = dimension === 'importance' ? 'importanceRank' : 'urgencyRank'
        return a[key] - b[key]
      }),
    [tasks, dimension],
  )

  const previewTasks = useMemo(() => {
    if (!dragState || dragState.overIndex === null) return orderedTasks
    return moveItemToPosition(
      orderedTasks,
      (t) => t.id === dragState.taskId,
      dragState.overIndex,
    )
  }, [dragState, orderedTasks])

  const endIndex = orderedTasks.length

  async function commitMove(index: number) {
    if (!dragState?.taskId || isMoving) return
    const currentIndex = orderedTasks.findIndex((t) => t.id === dragState.taskId)
    if (currentIndex === index) {
      setDragState(null)
      return
    }
    setIsMoving(true)
    try {
      await onMove(dragState.taskId, index)
    } finally {
      setIsMoving(false)
      setDragState(null)
    }
  }

  return (
    <div className="rank-list">
      {previewTasks.map((task, index) => {
        const isDragging = dragState?.taskId === task.id
        const isTarget = dragState?.overIndex === index && dragState.taskId !== task.id
        const tone = task.resolutionType ? resolutionTone[task.resolutionType] : 'var(--text-tertiary)'

        return (
          <div
            key={task.id}
            className={cn(
              'rank-item',
              isDragging && 'rank-item-dragging',
              isTarget && 'rank-item-target',
            )}
            draggable={!isMoving}
            onDragStart={() => {
              if (!isMoving) setDragState({ taskId: task.id, overIndex: index })
            }}
            onDragOver={(e) => {
              e.preventDefault()
              if (dragState && !isMoving) {
                setDragState((cur) => cur ? { ...cur, overIndex: index } : cur)
              }
            }}
            onDrop={(e) => {
              e.preventDefault()
              void commitMove(index)
            }}
            onDragEnd={() => setDragState(null)}
          >
            <GripVertical className="h-3 w-3 text-[var(--text-tertiary)] flex-shrink-0" />
            <span className="rank-num">#{index + 1}</span>
            <span className="rank-dot" style={{ backgroundColor: tone }} />
            <Link
              className="rank-title"
              to="/tasks/$taskId"
              params={{ taskId: task.id }}
            >
              {task.title}
            </Link>
          </div>
        )
      })}

      {dragState && (
        <div
          className={cn(
            'rank-drop-zone',
            dragState.overIndex === endIndex && 'rank-drop-zone-active',
          )}
          onDragOver={(e) => {
            e.preventDefault()
            if (dragState && !isMoving) {
              setDragState((cur) => cur ? { ...cur, overIndex: endIndex } : cur)
            }
          }}
          onDrop={(e) => {
            e.preventDefault()
            void commitMove(endIndex)
          }}
        >
          Drop at end
        </div>
      )}
    </div>
  )
}

export function AppSidebar() {
  const tasks = useAllTasks()
  const points = useMatrixTasks()
  const { updateTask } = useTaskActions()
  const [dimension, setDimension] = useState<RankDimension>('importance')
  const summary = getDashboardSummary(points)
  const dimensionTasks = getOrderedActiveTasks(tasks, dimension)

  return (
    <>
      <div className="sidebar-section">
        <p className="sidebar-label">Overview</p>
        <div className="stat-row">
          <div className="stat-chip">
            <span className="stat-label">Active</span>
            <span className="stat-value">{summary.activeCount}</span>
          </div>
          <div className="stat-chip">
            <span className="stat-label">Due soon</span>
            <span className="stat-value">{summary.dueSoonCount}</span>
          </div>
          <div className="stat-chip">
            <span className="stat-label">Unresolved</span>
            <span className="stat-value">{summary.unresolvedCount}</span>
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-label">Rank by</p>
        <div className="dimension-toggle">
          <button
            className={cn('dimension-btn', dimension === 'importance' && 'dimension-btn-active')}
            onClick={() => setDimension('importance')}
          >
            Importance
          </button>
          <button
            className={cn('dimension-btn', dimension === 'urgency' && 'dimension-btn-active')}
            onClick={() => setDimension('urgency')}
          >
            Urgency
          </button>
        </div>
      </div>

      <SidebarRankList
        tasks={dimensionTasks}
        dimension={dimension}
        onMove={async (taskId, index) => {
          await updateTask({
            taskId,
            ...(dimension === 'importance'
              ? { importancePosition: index }
              : { urgencyPosition: index }),
          })
        }}
      />
    </>
  )
}
