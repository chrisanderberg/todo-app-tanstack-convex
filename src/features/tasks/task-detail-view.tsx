import { useEffect, useRef, useState } from 'react'
import { Archive, CheckCircle2, RotateCcw } from 'lucide-react'
import { EisenhowerMatrix } from '@/components/charts/eisenhower-matrix'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { ResolutionBadge, StatusBadge } from '@/features/tasks/task-badges'
import {
  canReRank,
  formatDueDateContext,
  useMatrixTasks,
  useRankingChoices,
  useTaskActions,
  useTaskDetail,
} from '@/features/tasks/use-task-data'
import { RESOLUTION_VALUES, resolutionLabels, type ResolutionType } from '@/lib/task-model'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export function TaskDetailView({ taskId }: { taskId: string }) {
  const task = useTaskDetail(taskId)
  const points = useMatrixTasks()
  const { importance, urgency } = useRankingChoices(taskId)
  const { restoreTask, setTaskStatus, updateTask } = useTaskActions()
  const [draftTitle, setDraftTitle] = useState('')
  const [draftDescription, setDraftDescription] = useState('')
  const [draftDueDate, setDraftDueDate] = useState('')
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const saveTimerRef = useRef<number | null>(null)
  const previousTaskRef = useRef<typeof task>(null)
  const restoreImportancePosition = Math.max(0, importance.length - 1)
  const restoreUrgencyPosition = Math.max(0, urgency.length - 1)

  useEffect(() => {
    if (!task) return
    const prev = previousTaskRef.current
    const titlePristine = draftTitle === (prev?.title ?? '')
    const descPristine = draftDescription === (prev?.description ?? '')
    if (prev?.id !== task.id || (titlePristine && descPristine)) {
      setDraftTitle(task.title)
      setDraftDescription(task.description)
      setDraftDueDate(task.dueDate ?? '')
    }
    previousTaskRef.current = task
  }, [draftDescription, draftTitle, task])

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)
    }
  }, [])

  function beginSaving() {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)
    setErrorMessage(null)
    setSaveState('saving')
  }

  function finishSaving() {
    setSaveState('saved')
    saveTimerRef.current = window.setTimeout(() => setSaveState('idle'), 1800)
  }

  function failSaving(error: unknown) {
    setSaveState('error')
    setErrorMessage(error instanceof Error ? error.message : 'Unable to save changes.')
  }

  async function runSavingMutation(mutation: () => Promise<unknown>) {
    beginSaving()
    try {
      await mutation()
      finishSaving()
    } catch (error) {
      failSaving(error)
    }
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-[var(--text-tertiary)]">Loading task…</p>
      </div>
    )
  }

  const saveIndicator =
    saveState === 'saving' ? (
      <span className="text-xs text-[var(--text-tertiary)]">Saving…</span>
    ) : saveState === 'saved' ? (
      <span className="text-xs text-[var(--tone-do)]">Saved</span>
    ) : saveState === 'error' ? (
      <span className="text-xs text-[var(--tone-drop)]">Save failed</span>
    ) : null

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-[var(--border)]">
        <div className="flex items-start justify-between gap-3 pr-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <StatusBadge status={task.status} />
              <ResolutionBadge resolutionType={task.resolutionType} />
              {saveIndicator}
            </div>
            <h2 className="text-lg font-bold tracking-[-0.02em] text-[var(--text-primary)] leading-tight">
              {task.title}
            </h2>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {task.status === 'active' ? (
            <>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  void runSavingMutation(() =>
                    setTaskStatus({ taskId: task.id, status: 'completed' }),
                  )
                }
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Complete
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  void runSavingMutation(() =>
                    setTaskStatus({ taskId: task.id, status: 'archived' }),
                  )
                }
              >
                <Archive className="h-3.5 w-3.5" />
                Archive
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                void runSavingMutation(() =>
                  restoreTask({
                    taskId: task.id,
                    importancePosition: restoreImportancePosition,
                    urgencyPosition: restoreUrgencyPosition,
                  }),
                )
              }
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Restore
            </Button>
          )}
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {errorMessage && (
          <div className="rounded-lg border border-[var(--tone-drop)] bg-[var(--tone-drop-soft)] px-3 py-2.5 text-sm text-[var(--tone-drop)]">
            {errorMessage}
          </div>
        )}

        {/* Title edit */}
        <div className="space-y-1.5">
          <Label htmlFor="detail-title">Title</Label>
          <Input
            id="detail-title"
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onBlur={async () => {
              const next = draftTitle.trim()
              if (!next || next === task.title) { setDraftTitle(task.title); return }
              await runSavingMutation(() => updateTask({ taskId: task.id, title: next }))
            }}
          />
        </div>

        {/* Description edit */}
        <div className="space-y-1.5">
          <Label htmlFor="detail-desc">Description</Label>
          <Textarea
            id="detail-desc"
            value={draftDescription}
            onChange={(e) => setDraftDescription(e.target.value)}
            onBlur={async () => {
              const next = draftDescription.trim()
              if (next === task.description) {
                setDraftDescription(task.description)
                return
              }
              setDraftDescription(next)
              await runSavingMutation(() => updateTask({ taskId: task.id, description: next }))
            }}
          />
        </div>

        <Separator />

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Resolution */}
          <div className="space-y-1.5">
            <Label>Resolution</Label>
            <Select
              value={task.resolutionType ?? 'none'}
              onValueChange={(next) => {
                void runSavingMutation(() =>
                  updateTask({
                    taskId: task.id,
                    resolutionType: next === 'none' ? null : (next as ResolutionType),
                  }),
                )
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unresolved</SelectItem>
                {RESOLUTION_VALUES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {resolutionLabels[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due date */}
          <div className="space-y-1.5">
            <Label htmlFor="detail-due">Due date</Label>
            <Input
              id="detail-due"
              type="date"
              value={draftDueDate}
              onChange={(e) => setDraftDueDate(e.target.value)}
              onBlur={(e) => {
                const next = e.target.value || null
                if (next === task.dueDate) return
                void runSavingMutation(() => updateTask({ taskId: task.id, dueDate: next }))
              }}
            />
            {task.dueDate && (
              <p className="text-xs text-[var(--text-tertiary)]">
                {formatDueDateContext(task.dueDate)}
              </p>
            )}
          </div>

          {/* Importance rank */}
          <div className="space-y-1.5">
            <Label>Importance rank</Label>
            <div className="text-xl font-bold text-[var(--text-primary)]">
              #{task.importanceRank + 1}
            </div>
            <p className="text-xs text-[var(--text-tertiary)]">
              {(task.importancePercentile * 100).toFixed(0)}th percentile
            </p>
            {canReRank(task.status) && (
              <Select
                value={String(task.importanceRank)}
                onValueChange={(next) => {
                  void runSavingMutation(() =>
                    updateTask({ taskId: task.id, importancePosition: Number(next) }),
                  )
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {importance.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Urgency rank */}
          <div className="space-y-1.5">
            <Label>Urgency rank</Label>
            <div className="text-xl font-bold text-[var(--text-primary)]">
              #{task.urgencyRank + 1}
            </div>
            <p className="text-xs text-[var(--text-tertiary)]">
              {(task.urgencyPercentile * 100).toFixed(0)}th percentile
            </p>
            {canReRank(task.status) && (
              <Select
                value={String(task.urgencyRank)}
                onValueChange={(next) => {
                  void runSavingMutation(() =>
                    updateTask({ taskId: task.id, urgencyPosition: Number(next) }),
                  )
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {urgency.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <Separator />

        {/* Mini matrix */}
        <div>
          <p className="eyebrow mb-3">Position in matrix</p>
          <div className="task-detail-mini-matrix rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
            <EisenhowerMatrix
              currentTaskId={task.id}
              points={points}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
