import { Badge } from '@/components/ui/badge'
import {
  resolutionLabels,
  statusLabels,
  type ResolutionType,
  type TaskStatus,
} from '@/lib/task-model'

const resolutionStyles: Record<Exclude<ResolutionType, null>, string> = {
  do: 'border-[var(--tone-do)] bg-[var(--tone-do-soft)] text-[var(--tone-do)]',
  schedule: 'border-[var(--tone-schedule)] bg-[var(--tone-schedule-soft)] text-[var(--tone-schedule)]',
  delegate: 'border-[var(--tone-delegate)] bg-[var(--tone-delegate-soft)] text-[var(--tone-delegate)]',
  drop: 'border-[var(--tone-drop)] bg-[var(--tone-drop-soft)] text-[var(--tone-drop)]',
}

export function ResolutionBadge({
  resolutionType,
}: {
  resolutionType: ResolutionType
}) {
  if (!resolutionType) {
    return <Badge>Unresolved</Badge>
  }

  return (
    <Badge className={resolutionStyles[resolutionType]}>
      {resolutionLabels[resolutionType]}
    </Badge>
  )
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  const styles: Record<TaskStatus, string> = {
    active: 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-hover)]',
    completed: 'border-[var(--tone-do)] bg-[var(--tone-do-soft)] text-[var(--tone-do)]',
    archived: 'border-[var(--border-strong)] bg-[var(--bg-hover)] text-[var(--text-tertiary)]',
  }

  return <Badge className={styles[status]}>{statusLabels[status]}</Badge>
}
