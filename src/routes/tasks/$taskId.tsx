import { createFileRoute, useNavigate, useRouterState } from '@tanstack/react-router'
import { SlideOver } from '@/components/layout/slide-over'
import { TaskDetailView } from '@/features/tasks/task-detail-view'

export const Route = createFileRoute('/tasks/$taskId')({
  component: TaskDetailRoute,
})

function TaskDetailRoute() {
  const { taskId } = Route.useParams()
  const navigate = useNavigate()
  const routerState = useRouterState()
  const state = routerState.location.state as
    | { from?: '/' | '/list'; view?: 'matrix' | 'list' }
    | undefined
  const from = state?.from ?? '/'
  const view = state?.view ?? (from === '/list' ? 'list' : 'matrix')

  function handleClose() {
    void navigate({ to: from, state: { view } as never })
  }

  return (
    <SlideOver open onClose={handleClose}>
      <TaskDetailView taskId={taskId} />
    </SlideOver>
  )
}
