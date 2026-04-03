import { createFileRoute } from '@tanstack/react-router'
import { ListView } from '@/components/layout/list-view'

export const Route = createFileRoute('/list')({ component: ListView })
