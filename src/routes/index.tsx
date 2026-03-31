import { useMemo, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { AlarmClockCheck, CircleHelp, Plus, Sparkles, Target, type LucideIcon } from 'lucide-react'
import { TaskMatrixChart } from '@/components/charts/task-matrix-chart'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TaskEmptyState } from '@/features/tasks/task-empty-state'
import { TaskFormDialog } from '@/features/tasks/task-form'
import {
  formatShortDueDate,
  getDefaultTaskFormValues,
  getDashboardSummary,
  useMatrixTasks,
  useRankingChoices,
  useTaskActions,
} from '@/features/tasks/use-task-data'
import { resolutionLabels, type MatrixPoint } from '@/lib/task-model'

export const Route = createFileRoute('/')({ component: MatrixRoute })

export function SummaryTaskRow({
  Icon,
  index,
  task,
}: {
  Icon: LucideIcon
  index: number
  task: MatrixPoint
}) {
  return (
    <div className="summary-task">
      <div className="flex items-start gap-3">
        <span className="summary-rank">
          <Icon className="h-3.5 w-3.5" />
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <Link
            className="summary-task-link"
            params={{ taskId: task.id }}
            to="/tasks/$taskId"
          >
            {task.title}
          </Link>
          <p className="summary-task-meta">{formatShortDueDate(task.dueDate)}</p>
        </div>
        <Badge>
          {task.resolutionType ? resolutionLabels[task.resolutionType] : 'Unresolved'}
        </Badge>
      </div>
    </div>
  )
}

function MatrixRoute() {
  const navigate = useNavigate()
  const points = useMatrixTasks()
  const rankingChoices = useRankingChoices()
  const { createTask, seedData, updateTask } = useTaskActions()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)
  const [seedError, setSeedError] = useState<string | null>(null)
  const summary = getDashboardSummary(points)
  const createInitialValues = useMemo(
    () =>
      getDefaultTaskFormValues(
        rankingChoices.importance,
        rankingChoices.urgency,
      ),
    [rankingChoices.importance, rankingChoices.urgency],
  )

  return (
    <main className="page-shell py-10">
      <section className="dashboard-toolbar mb-6">
        <div>
          <p className="eyebrow">Today</p>
          <h1 className="text-3xl font-display font-semibold tracking-[-0.04em] text-[var(--ink)]">
            Matrix
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            New task
          </Button>
          <Button asChild variant="secondary">
            <Link to="/list">Open list view</Link>
          </Button>
        </div>
      </section>

      <section className="dashboard-grid">
        {points.length === 0 ? (
          <TaskEmptyState
            errorMessage={seedError}
            isSeeding={isSeeding}
            onCreate={() => setIsCreateOpen(true)}
            onSeed={async () => {
              if (isSeeding) {
                return
              }

              setSeedError(null)
              setIsSeeding(true)

              try {
                await seedData({})
              } catch (error) {
                console.error('Failed to seed sample tasks.', error)
                setSeedError(
                  error instanceof Error
                    ? error.message
                    : 'Unable to load sample tasks right now.',
                )
              } finally {
                setIsSeeding(false)
              }
            }}
          />
        ) : (
          <>
            <Card className="min-w-0">
              <CardHeader>
                <p className="eyebrow">Priority field</p>
                <CardTitle>Main matrix</CardTitle>
                <CardDescription>
                  Drag any point to reorder both dimensions together. Click a point to open task detail.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TaskMatrixChart
                  onPointClick={(taskId) => {
                    void navigate({ to: '/tasks/$taskId', params: { taskId } })
                  }}
                  onPointReorder={async (taskId, next) => {
                    await updateTask({
                      taskId,
                      importancePosition: next.importancePosition,
                      urgencyPosition: next.urgencyPosition,
                    })
                  }}
                  points={points}
                />
              </CardContent>
            </Card>

            <aside className="grid gap-4">
              <Card className="summary-card">
                <CardHeader className="pb-4">
                  <p className="eyebrow">Live summary</p>
                  <CardTitle>
                    {summary.activeCount} active {summary.activeCount === 1 ? 'task' : 'tasks'}
                  </CardTitle>
                  <CardDescription>
                    The matrix works best when the sidebar helps you spot what needs a decision next.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 text-sm">
                  <div className="stat-chip">
                    <span className="stat-label">Due soon</span>
                    <span className="stat-value">{summary.dueSoonCount}</span>
                  </div>
                  <div className="stat-chip">
                    <span className="stat-label">Unresolved</span>
                    <span className="stat-value">{summary.unresolvedCount}</span>
                  </div>
                  <div className="stat-chip">
                    <span className="stat-label">X axis</span>
                    <span className="stat-value">Importance</span>
                  </div>
                  <div className="stat-chip">
                    <span className="stat-label">Y axis</span>
                    <span className="stat-value">Urgency</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="summary-card">
                <CardHeader className="pb-4">
                  <p className="eyebrow">Top importance</p>
                  <CardTitle>What matters most</CardTitle>
                  <CardDescription>
                    These are the tasks currently nearest the top of the importance ordering.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {summary.highestImportance.map((task, index) => (
                    <SummaryTaskRow Icon={Target} index={index} key={task.id} task={task} />
                  ))}
                </CardContent>
              </Card>

              <Card className="summary-card">
                <CardHeader className="pb-4">
                  <p className="eyebrow">Top urgency</p>
                  <CardTitle>What needs attention fast</CardTitle>
                  <CardDescription>
                    A quick scan of the tasks sitting highest in the urgency ordering.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {summary.highestUrgency.map((task, index) => (
                    <SummaryTaskRow
                      Icon={AlarmClockCheck}
                      index={index}
                      key={task.id}
                      task={task}
                    />
                  ))}
                </CardContent>
              </Card>

              <Card className="summary-card">
                <CardHeader className="pb-4">
                  <p className="eyebrow">How to use it</p>
                  <CardTitle>Quick rhythm</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm text-[var(--muted-ink)]">
                  <div className="summary-note">
                    <Sparkles className="h-4 w-4 text-[var(--accent-ink)]" />
                    Create tasks directly from the matrix when you know roughly where they belong.
                  </div>
                  <div className="summary-note">
                    <CircleHelp className="h-4 w-4 text-[var(--moss)]" />
                    Use the list screen when you want precise rank-by-rank editing in just one dimension.
                  </div>
                </CardContent>
              </Card>
            </aside>
          </>
        )}
      </section>

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
        title="Create ranked task"
        urgencyOptions={rankingChoices.urgency}
      />
    </main>
  )
}
