import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { EisenhowerMatrix } from '@/components/charts/eisenhower-matrix'
import { Button } from '@/components/ui/button'
import { TaskEmptyState } from '@/features/tasks/task-empty-state'
import { TaskFormDialog } from '@/features/tasks/task-form'
import {
  getDefaultTaskFormValues,
  useMatrixTasks,
  useRankingChoices,
  useTaskActions,
} from '@/features/tasks/use-task-data'

export function MatrixView() {
  const navigate = useNavigate()
  const points = useMatrixTasks()
  const rankingChoices = useRankingChoices()
  const { createTask, seedData, updateTask } = useTaskActions()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)
  const [seedError, setSeedError] = useState<string | null>(null)
  const [reorderError, setReorderError] = useState<string | null>(null)

  const createInitialValues = useMemo(
    () => getDefaultTaskFormValues(rankingChoices.importance, rankingChoices.urgency),
    [rankingChoices.importance, rankingChoices.urgency],
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
        <div>
          <p className="eyebrow">Priority field</p>
          <h1 className="text-base font-bold tracking-[-0.02em] text-[var(--text-primary)] mt-0.5">
            Matrix view
          </h1>
        </div>
        <Button size="sm" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-3.5 w-3.5" />
          New task
        </Button>
      </div>

      <div className="flex-1 min-h-0 p-4">
        {reorderError && (
          <div className="mb-4 rounded-lg border border-[var(--tone-drop)] bg-[var(--tone-drop-soft)] px-3 py-2.5 text-sm text-[var(--tone-drop)]">
            {reorderError}
          </div>
        )}
        {points.length === 0 ? (
          <TaskEmptyState
            errorMessage={seedError}
            isSeeding={isSeeding}
            onCreate={() => setIsCreateOpen(true)}
            onSeed={async () => {
              if (isSeeding) return
              setSeedError(null)
              setIsSeeding(true)
              try {
                await seedData({})
              } catch (error) {
                setSeedError(
                  error instanceof Error ? error.message : 'Unable to load sample tasks right now.',
                )
              } finally {
                setIsSeeding(false)
              }
            }}
          />
        ) : (
          <EisenhowerMatrix
            points={points}
            onPointClick={(taskId) => {
              void navigate({ to: '/tasks/$taskId', params: { taskId } })
            }}
            onPointReorder={async (taskId, next) => {
              setReorderError(null)
              try {
                await updateTask({
                  taskId,
                  importancePosition: next.importancePosition,
                  urgencyPosition: next.urgencyPosition,
                })
              } catch (error) {
                console.error('Failed to reorder task:', error)
                setReorderError(
                  error instanceof Error
                    ? error.message
                    : 'Unable to update the task order right now.',
                )
              }
            }}
          />
        )}
      </div>

      <TaskFormDialog
        description="Add a task and choose its starting positions in the importance and urgency orderings."
        importanceOptions={rankingChoices.importance}
        initialValues={createInitialValues}
        isOpen={isCreateOpen}
        mode="create"
        onOpenChange={setIsCreateOpen}
        onSubmit={async (values) => {
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
        }}
        title="New task"
        urgencyOptions={rankingChoices.urgency}
      />
    </div>
  )
}
