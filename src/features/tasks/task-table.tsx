import { useNavigate } from '@tanstack/react-router'
import { ArrowDown, ArrowUpDown } from 'lucide-react'
import {
  filterTasks,
  formatDueDateContext,
  sortTasks,
  type TaskFilter,
} from '@/features/tasks/use-task-data'
import { ResolutionBadge, StatusBadge } from '@/features/tasks/task-badges'
import type { TaskViewModel } from '@/lib/task-model'
import { cn } from '@/lib/utils'

type SortKey = 'title' | 'status' | 'importanceRank' | 'urgencyRank' | 'dueDate'

const filterLabels: Record<TaskFilter, string> = {
  all: 'All',
  active: 'Active',
  completed: 'Completed',
  archived: 'Archived',
  unresolved: 'Unresolved',
}

const columns: { key: SortKey; label: string }[] = [
  { key: 'title', label: 'Task' },
  { key: 'status', label: 'Status' },
  { key: 'importanceRank', label: 'Importance' },
  { key: 'urgencyRank', label: 'Urgency' },
  { key: 'dueDate', label: 'Due' },
]

export function TaskTable({
  filter,
  onFilterChange,
  sortKey,
  onSortChange,
  tasks,
}: {
  filter: TaskFilter
  onFilterChange: (value: TaskFilter) => void
  sortKey: SortKey
  onSortChange: (value: SortKey) => void
  tasks: TaskViewModel[]
}) {
  const navigate = useNavigate()
  const rows = sortTasks(filterTasks(tasks, filter), sortKey)

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[var(--border)] flex-wrap">
        <div className="filter-bar">
          {(['all', 'active', 'completed', 'archived', 'unresolved'] as const).map((value) => (
            <button
              key={value}
              className={cn('filter-chip', filter === value && 'filter-chip-active')}
              onClick={() => onFilterChange(value)}
            >
              {filterLabels[value]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="task-table-wrap flex-1">
        <table className="task-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => onSortChange(col.key)}
                >
                  <span className="flex items-center gap-1.5">
                    {col.label}
                    {sortKey === col.key ? (
                      <ArrowDown className="h-3 w-3 text-[var(--accent)]" />
                    ) : (
                      <ArrowUpDown className="h-3 w-3 opacity-40" />
                    )}
                  </span>
                </th>
              ))}
              <th>Resolution</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((task) => (
              <tr
                key={task.id}
                onClick={() => void navigate({ to: '/tasks/$taskId', params: { taskId: task.id } })}
              >
                <td style={{ maxWidth: 280 }}>
                  <div className="font-semibold text-[var(--text-primary)] leading-tight">
                    {task.title}
                  </div>
                  {task.description && (
                    <div className="mt-0.5 text-xs text-[var(--text-tertiary)] leading-4 line-clamp-1">
                      {task.description}
                    </div>
                  )}
                </td>
                <td>
                  <StatusBadge status={task.status} />
                </td>
                <td className="text-xs font-bold text-[var(--text-primary)]">
                  #{task.importanceRank + 1}
                </td>
                <td className="text-xs font-bold text-[var(--text-primary)]">
                  #{task.urgencyRank + 1}
                </td>
                <td className="text-xs text-[var(--text-secondary)] whitespace-nowrap">
                  {formatDueDateContext(task.dueDate)}
                </td>
                <td>
                  <ResolutionBadge resolutionType={task.resolutionType} />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-[var(--text-tertiary)]">
                  No tasks match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
