import { createFileRoute, useNavigate, useRouterState } from '@tanstack/react-router'
import { SlideOver } from '@/components/layout/slide-over'
import { TaskDetailView } from '@/features/tasks/task-detail-view'
import { getTaskRouteView, type TaskRouteState } from '@/lib/task-route-state'

export const Route = createFileRoute('/tasks/$taskId')({
  component: TaskDetailRoute,
})

function TaskDetailRoute() {
  const { taskId } = Route.useParams()
  const navigate = useNavigate()
  const routerState = useRouterState()
  const state = routerState.location.state
  const from = state?.from ?? '/'
  const view = getTaskRouteView(state, from)

  function handleClose() {
    void navigate({ to: from, state: { view } satisfies Pick<TaskRouteState, 'view'> })
  }

  return (
    <SlideOver open onClose={handleClose}>
      <TaskDetailView taskId={taskId} />
    </SlideOver>
  )
}
