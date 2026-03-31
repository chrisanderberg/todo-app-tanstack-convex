import { TaskMatrixChart } from '@/components/charts/task-matrix-chart'
import type { MatrixPoint } from '@/lib/task-model'

export function TaskMiniMatrix({
  currentTaskId,
  points,
}: {
  currentTaskId: string
  points: MatrixPoint[]
}) {
  return (
    <TaskMatrixChart
      currentTaskId={currentTaskId}
      points={points}
      subtitle="Context view"
    />
  )
}
