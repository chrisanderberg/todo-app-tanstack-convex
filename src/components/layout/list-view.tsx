import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TaskTable } from '@/features/tasks/task-table'
import { TaskFormDialog } from '@/features/tasks/task-form'
import {
  filterTasks,
  getDefaultTaskFormValues,
  submitCreateTask,
  useAllTasks,
  useRankingChoices,
  useTaskActions,
  type TaskFilter,
} from '@/features/tasks/use-task-data'
import type { SortKey } from '@/features/tasks/task-table'

export function ListView() {
  const tasks = useAllTasks()
  const rankingChoices = useRankingChoices()
  const { createTask } = useTaskActions()
  const [filter, setFilter] = useState<TaskFilter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('importanceRank')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const filteredCount = useMemo(() => filterTasks(tasks, filter).length, [tasks, filter])

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
        onSubmit={(values) => submitCreateTask(createTask, values)}
        title="New task"
        urgencyOptions={rankingChoices.urgency}
      />
    </div>
  )
}
