import { Badge } from '@/components/ui/badge'
import {
  resolutionLabels,
  resolutionTone,
  statusLabels,
  type ResolutionType,
  type TaskStatus,
} from '@/lib/task-model'

export function ResolutionBadge({
  resolutionType,
}: {
  resolutionType: ResolutionType
}) {
  if (!resolutionType) {
    return <Badge>Unresolved</Badge>
  }

  return (
    <Badge
      className="border-transparent text-white"
      style={{ backgroundColor: resolutionTone[resolutionType] }}
    >
      {resolutionLabels[resolutionType]}
    </Badge>
  )
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  const styles: Record<TaskStatus, string> = {
    active: 'border-transparent bg-[var(--accent-soft)] text-[var(--accent-ink)]',
    completed: 'border-transparent bg-[rgba(87,125,111,0.16)] text-[var(--moss)]',
    archived: 'border-transparent bg-[rgba(72,61,53,0.08)] text-[var(--muted-ink)]',
  }

  return <Badge className={styles[status]}>{statusLabels[status]}</Badge>
}
