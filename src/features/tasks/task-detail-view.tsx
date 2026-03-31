import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Archive, ArrowLeft, CheckCircle2, RotateCcw } from 'lucide-react'
import { TaskMiniMatrix } from '@/components/charts/task-mini-matrix'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { ResolutionBadge, StatusBadge } from '@/features/tasks/task-badges'
import {
  canReRank,
  formatDueDate,
  formatDueDateContext,
  useMatrixTasks,
  useRankingChoices,
  useTaskActions,
  useTaskDetail,
} from '@/features/tasks/use-task-data'
import { RESOLUTION_VALUES, resolutionLabels, type ResolutionType } from '@/lib/task-model'

export function TaskDetailView({ taskId }: { taskId: string }) {
  const task = useTaskDetail(taskId)
  const points = useMatrixTasks()
  const { importance, urgency } = useRankingChoices(taskId)
  const { restoreTask, setTaskStatus, updateTask } = useTaskActions()
  const [draftTitle, setDraftTitle] = useState('')
  const [draftDescription, setDraftDescription] = useState('')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const saveTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!task) {
      return
    }

    setDraftTitle(task.title)
    setDraftDescription(task.description)
  }, [task])

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current)
      }
    }
  }, [])

  function beginSaving() {
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current)
    }

    setErrorMessage(null)
    setSaveState('saving')
  }

  function finishSaving() {
    setSaveState('saved')
    saveTimerRef.current = window.setTimeout(() => {
      setSaveState('idle')
    }, 1800)
  }

  function failSaving(error: unknown) {
    setSaveState('error')
    setErrorMessage(error instanceof Error ? error.message : 'Unable to save changes.')
  }

  if (!task) {
    return (
      <main className="page-shell py-16">
        <Card>
          <CardHeader>
            <CardTitle>Loading task...</CardTitle>
          </CardHeader>
        </Card>
      </main>
    )
  }

  return (
    <main className="page-shell py-10">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button asChild size="sm" variant="ghost">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Back to matrix
          </Link>
        </Button>
        {task.status === 'active' ? (
          <>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => void setTaskStatus({ taskId: task.id as never, status: 'completed' })}
            >
              <CheckCircle2 className="h-4 w-4" />
              Complete
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => void setTaskStatus({ taskId: task.id as never, status: 'archived' })}
            >
              <Archive className="h-4 w-4" />
              Archive
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              void restoreTask({
                taskId: task.id as never,
                importancePosition: task.importanceRank,
                urgencyPosition: task.urgencyRank,
              })
            }
          >
            <RotateCcw className="h-4 w-4" />
            Restore to active
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_420px]">
        <Card>
          <CardHeader>
            <p className="eyebrow">Task detail</p>
            <CardTitle>{task.title}</CardTitle>
            <CardDescription>
              {task.description || 'No description'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="flex flex-wrap gap-3">
              <StatusBadge status={task.status} />
              <ResolutionBadge resolutionType={task.resolutionType} />
              {saveState === 'saving' ? (
                <span className="inline-flex items-center rounded-full bg-[var(--panel-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-ink)]">
                  Updating
                </span>
              ) : null}
              {saveState === 'saved' ? (
                <span className="inline-flex items-center rounded-full bg-[rgba(87,125,111,0.16)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--moss)]">
                  Saved
                </span>
              ) : null}
              {saveState === 'error' ? (
                <span className="inline-flex items-center rounded-full bg-[rgba(181,86,57,0.14)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--tone-drop)]">
                  Save failed
                </span>
              ) : null}
            </div>
            {errorMessage ? (
              <p className="rounded-[1rem] border border-[rgba(181,86,57,0.16)] bg-[rgba(181,86,57,0.08)] px-4 py-3 text-sm text-[var(--tone-drop)]">
                {errorMessage}
              </p>
            ) : null}

            <Separator />

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="detail-title">Title</Label>
                <Input
                  id="detail-title"
                  value={draftTitle}
                  onBlur={async () => {
                    const nextTitle = draftTitle.trim()
                    if (!nextTitle || nextTitle === task.title) {
                      setDraftTitle(task.title)
                      return
                    }

                    beginSaving()
                    try {
                      await updateTask({
                        taskId: task.id as never,
                        title: nextTitle,
                      })
                      finishSaving()
                    } catch (error) {
                      failSaving(error)
                    }
                  }}
                  onChange={(event) => setDraftTitle(event.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="detail-description">Description</Label>
                <Textarea
                  id="detail-description"
                  value={draftDescription}
                  onBlur={async () => {
                    if (draftDescription === task.description) {
                      return
                    }

                    beginSaving()
                    try {
                      await updateTask({
                        taskId: task.id as never,
                        description: draftDescription.trim(),
                      })
                      finishSaving()
                    } catch (error) {
                      failSaving(error)
                    }
                  }}
                  onChange={(event) => setDraftDescription(event.target.value)}
                />
              </div>
            </div>

            <Separator />

            <dl className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <dt className="eyebrow">Importance rank</dt>
                <dd className="mt-2 text-xl font-semibold text-[var(--ink)]">
                  #{task.importanceRank + 1}
                </dd>
                <p className="mt-1 text-sm text-[var(--muted-ink)]">
                  {(task.importancePercentile * 100).toFixed(0)}th percentile
                </p>
                {canReRank(task.status) ? (
                  <div className="mt-3 grid gap-2">
                    <Label>Move immediately</Label>
                    <Select
                      value={String(task.importanceRank)}
                      onValueChange={(next) => {
                        void (async () => {
                          beginSaving()
                          try {
                            await updateTask({
                              taskId: task.id as never,
                              importancePosition: Number(next),
                            })
                            finishSaving()
                          } catch (error) {
                            failSaving(error)
                          }
                        })()
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {importance.map((option) => (
                          <SelectItem key={option.value} value={String(option.value)}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
              </div>
              <div>
                <dt className="eyebrow">Urgency rank</dt>
                <dd className="mt-2 text-xl font-semibold text-[var(--ink)]">
                  #{task.urgencyRank + 1}
                </dd>
                <p className="mt-1 text-sm text-[var(--muted-ink)]">
                  {(task.urgencyPercentile * 100).toFixed(0)}th percentile
                </p>
                {canReRank(task.status) ? (
                  <div className="mt-3 grid gap-2">
                    <Label>Move immediately</Label>
                    <Select
                      value={String(task.urgencyRank)}
                      onValueChange={(next) => {
                        void (async () => {
                          beginSaving()
                          try {
                            await updateTask({
                              taskId: task.id as never,
                              urgencyPosition: Number(next),
                            })
                            finishSaving()
                          } catch (error) {
                            failSaving(error)
                          }
                        })()
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {urgency.map((option) => (
                          <SelectItem key={option.value} value={String(option.value)}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
              </div>
              <div>
                <dt className="eyebrow">Due date</dt>
                <dd className="mt-2 text-base font-semibold text-[var(--ink)]">{formatDueDate(task.dueDate)}</dd>
                <p className="mt-1 text-sm text-[var(--muted-ink)]">{formatDueDateContext(task.dueDate)}</p>
                <div className="mt-3 grid gap-2">
                  <Label htmlFor="detail-due-date">Update immediately</Label>
                  <Input
                    id="detail-due-date"
                    type="date"
                    value={task.dueDate ?? ''}
                    onChange={(event) => {
                      void (async () => {
                        beginSaving()
                        try {
                          await updateTask({
                            taskId: task.id as never,
                            dueDate: event.target.value || null,
                          })
                          finishSaving()
                        } catch (error) {
                          failSaving(error)
                        }
                      })()
                    }}
                  />
                </div>
              </div>
              <div>
                <dt className="eyebrow">Resolution</dt>
                <dd className="mt-2 text-base font-semibold text-[var(--ink)]">
                  {task.resolutionType ? resolutionLabels[task.resolutionType] : 'No resolution'}
                </dd>
                <div className="mt-3 grid gap-2">
                  <Label>Set immediately</Label>
                  <Select
                    value={task.resolutionType ?? 'none'}
                    onValueChange={(next) => {
                      void (async () => {
                        beginSaving()
                        try {
                          await updateTask({
                            taskId: task.id as never,
                            resolutionType: next === 'none' ? null : (next as ResolutionType),
                          })
                          finishSaving()
                        } catch (error) {
                          failSaving(error)
                        }
                      })()
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No resolution</SelectItem>
                      {RESOLUTION_VALUES.map((resolution) => (
                        <SelectItem key={resolution} value={resolution}>
                          {resolutionLabels[resolution]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <p className="eyebrow">Mini matrix</p>
            <CardTitle>Where this task sits</CardTitle>
            <CardDescription>
              All active tasks stay muted while the current task remains highlighted and anchored in context.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TaskMiniMatrix currentTaskId={taskId} points={points} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
