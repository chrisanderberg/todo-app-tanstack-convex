import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TaskTable } from '@/features/tasks/task-table'
import { TaskFormDialog } from '@/features/tasks/task-form'
import {
  filterTasks,
  getDefaultTaskFormValues,
  useAllTasks,
  useRankingChoices,
  useTaskActions,
  type TaskFilter,
} from '@/features/tasks/use-task-data'

export function ListView() {
  const tasks = useAllTasks()
  const rankingChoices = useRankingChoices()
  const { createTask } = useTaskActions()
  const [filter, setFilter] = useState<TaskFilter>('all')
  const [sortKey, setSortKey] = useState<
    'title' | 'status' | 'importanceRank' | 'urgencyRank' | 'dueDate'
  >('importanceRank')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const filteredCount = filterTasks(tasks, filter).length

  const createInitialValues = useMemo(
    () => getDefaultTaskFormValues(rankingChoices.importance, rankingChoices.urgency),
    [rankingChoices.importance, rankingChoices.urgency],
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
        <div>
          <p className="eyebrow">Precision editing</p>
          <h1 className="text-base font-bold tracking-[-0.02em] text-[var(--text-primary)] mt-0.5">
            All tasks
            <span className="ml-2 text-sm font-normal text-[var(--text-tertiary)]">
              {filteredCount} {filteredCount === 1 ? 'task' : 'tasks'}
            </span>
          </h1>
        </div>
        <Button size="sm" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-3.5 w-3.5" />
          New task
        </Button>
      </div>

      <TaskTable
        filter={filter}
        onFilterChange={setFilter}
        onSortChange={setSortKey}
        sortKey={sortKey}
        tasks={tasks}
      />

      <TaskFormDialog
        description="Capture a task and place it directly into both ranked orderings."
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
