import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TaskRankList } from '@/features/tasks/task-rank-list'
import { TaskFormDialog } from '@/features/tasks/task-form'
import { TaskTable } from '@/features/tasks/task-table'
import {
  filterTasks,
  getDefaultTaskFormValues,
  getOrderedActiveTasks,
  useAllTasks,
  useRankingChoices,
  useTaskActions,
  type TaskFilter,
} from '@/features/tasks/use-task-data'

export const Route = createFileRoute('/list')({ component: ListRoute })

function ListRoute() {
  const tasks = useAllTasks()
  const rankingChoices = useRankingChoices()
  const { createTask, updateTask } = useTaskActions()
  const [filter, setFilter] = useState<TaskFilter>('all')
  const [sortKey, setSortKey] = useState<
    'title' | 'status' | 'importanceRank' | 'urgencyRank' | 'dueDate'
  >('importanceRank')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const importanceTasks = getOrderedActiveTasks(tasks, 'importance')
  const urgencyTasks = getOrderedActiveTasks(tasks, 'urgency')
  const filteredCount = filterTasks(tasks, filter).length

  return (
    <main className="page-shell py-10">
      <section className="dashboard-toolbar mb-6">
        <div>
          <p className="eyebrow">Precision editing</p>
          <h1 className="text-3xl font-display font-semibold tracking-[-0.04em] text-[var(--ink)]">
            Ordered lists
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted-ink)]">
            Use this screen when you want exact control over a single ranking dimension, quick
            keyboard-friendly moves, and a full task ledger below.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            New task
          </Button>
          <Button asChild variant="secondary">
            <Link to="/">Back to matrix</Link>
          </Button>
        </div>
      </section>

      <section className="mb-8 grid gap-6 lg:grid-cols-2">
        <TaskRankList
          dimension="importance"
          tasks={importanceTasks}
          onMove={async (taskId, index) => {
            await updateTask({
              taskId,
              importancePosition: index,
            })
          }}
        />
        <TaskRankList
          dimension="urgency"
          tasks={urgencyTasks}
          onMove={async (taskId, index) => {
            await updateTask({
              taskId,
              urgencyPosition: index,
            })
          }}
        />
      </section>
      <TaskTable
        filter={filter}
        onFilterChange={setFilter}
        onSortChange={setSortKey}
        sortKey={sortKey}
        tasks={tasks}
      />
      <p className="mt-4 text-sm text-[var(--muted-ink)]">
        Showing {filteredCount} {filteredCount === 1 ? 'task' : 'tasks'} in the table.
      </p>

      <TaskFormDialog
        description="Capture a task and place it directly into both ranked orderings."
        importanceOptions={rankingChoices.importance}
        initialValues={getDefaultTaskFormValues(
          rankingChoices.importance,
          rankingChoices.urgency,
        )}
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
        title="Create ranked task"
        urgencyOptions={rankingChoices.urgency}
      />
    </main>
  )
}
