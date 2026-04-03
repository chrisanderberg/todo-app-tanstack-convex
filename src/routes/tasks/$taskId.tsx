import { useNavigate, createFileRoute } from '@tanstack/react-router'
import { SlideOver } from '@/components/layout/slide-over'
import { TaskDetailView } from '@/features/tasks/task-detail-view'

export const Route = createFileRoute('/tasks/$taskId')({
  component: TaskDetailRoute,
})

function TaskDetailRoute() {
  const { taskId } = Route.useParams()
  const navigate = useNavigate()

  function handleClose() {
    void navigate({ to: '/' })
  }

  return (
    <SlideOver open onClose={handleClose}>
      <TaskDetailView taskId={taskId} />
    </SlideOver>
  )
}
