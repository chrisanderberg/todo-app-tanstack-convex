import { Link } from '@tanstack/react-router'
import { ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  filterTasks,
  formatDueDateContext,
  sortTasks,
  type TaskFilter,
} from '@/features/tasks/use-task-data'
import { ResolutionBadge, StatusBadge } from '@/features/tasks/task-badges'
import type { TaskViewModel } from '@/lib/task-model'

const sortLabels = {
  title: 'Title',
  status: 'Status',
  importanceRank: 'Importance',
  urgencyRank: 'Urgency',
  dueDate: 'Due date',
} as const

const filterLabels: Record<TaskFilter, string> = {
  all: 'All',
  active: 'Active',
  completed: 'Completed',
  archived: 'Archived',
  unresolved: 'Unresolved',
}

export function TaskTable({
  filter,
  onFilterChange,
  sortKey,
  onSortChange,
  tasks,
}: {
  filter: TaskFilter
  onFilterChange: (value: TaskFilter) => void
  sortKey: 'title' | 'status' | 'importanceRank' | 'urgencyRank' | 'dueDate'
  onSortChange: (value: 'title' | 'status' | 'importanceRank' | 'urgencyRank' | 'dueDate') => void
  tasks: TaskViewModel[]
}) {
  const rows = sortTasks(filterTasks(tasks, filter), sortKey)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Sortable list</p>
          <CardTitle>All tasks</CardTitle>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['all', 'active', 'completed', 'archived', 'unresolved'] as const).map((value) => (
            <Button
              key={value}
              size="sm"
              variant={filter === value ? 'default' : 'ghost'}
              onClick={() => onFilterChange(value)}
            >
              {filterLabels[value]}
            </Button>
          ))}
          {(['title', 'status', 'importanceRank', 'urgencyRank', 'dueDate'] as const).map(
            (value) => (
              <Button
                key={value}
                size="sm"
                variant={sortKey === value ? 'default' : 'secondary'}
                onClick={() => onSortChange(value)}
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
                {sortLabels[value]}
              </Button>
            ),
          )}
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left">
          <thead>
            <tr className="text-xs uppercase tracking-[0.14em] text-[var(--muted-ink)]">
              <th className="pb-2">Task</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Resolution</th>
              <th className="pb-2">Due date</th>
              <th className="pb-2">Importance rank</th>
              <th className="pb-2">Urgency rank</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((task) => (
              <tr key={task.id} className="rounded-2xl bg-[var(--panel-soft)]">
                <td className="rounded-l-[1.2rem] px-4 py-4 align-top">
                  <Link
                    className="font-semibold text-[var(--ink)] no-underline hover:text-[var(--accent-ink)]"
                    params={{ taskId: task.id }}
                    to="/tasks/$taskId"
                  >
                    {task.title}
                  </Link>
                  <p className="mt-1 text-sm text-[var(--muted-ink)]">
                    {task.description || 'No description'}
                  </p>
                </td>
                <td className="px-4 py-4 align-top">
                  <StatusBadge status={task.status} />
                </td>
                <td className="px-4 py-4 align-top">
                  <ResolutionBadge resolutionType={task.resolutionType} />
                </td>
                <td className="px-4 py-4 align-top text-sm text-[var(--muted-ink)]">
                  {formatDueDateContext(task.dueDate)}
                </td>
                <td className="px-4 py-4 align-top text-sm font-semibold text-[var(--ink)]">
                  #{task.importanceRank + 1}
                </td>
                <td className="rounded-r-[1.2rem] px-4 py-4 align-top text-sm font-semibold text-[var(--ink)]">
                  #{task.urgencyRank + 1}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
