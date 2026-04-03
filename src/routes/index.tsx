import { createFileRoute } from '@tanstack/react-router'
import { MatrixView } from '@/components/layout/matrix-view'

export const Route = createFileRoute('/')({ component: MatrixView })
