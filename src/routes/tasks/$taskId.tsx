import { createFileRoute } from '@tanstack/react-router'
import { TaskDetailView } from '@/features/tasks/task-detail-view'

export const Route = createFileRoute('/tasks/$taskId')({
  component: TaskDetailRoute,
})

function TaskDetailRoute() {
  const { taskId } = Route.useParams()
  return <TaskDetailView taskId={taskId} />
}
