import { Link, useRouterState } from '@tanstack/react-router'
import { LayoutGrid, List } from 'lucide-react'
import { getTaskRouteView, getViewState } from '@/lib/task-route-state'
import { cn } from '@/lib/utils'

export function ViewToggle() {
  const routerState = useRouterState()
  const pathname = routerState.location.pathname
  const currentView = getTaskRouteView(routerState.location.state, pathname)
  const isMatrix = currentView === 'matrix'
  const isList = currentView === 'list'

  return (
    <div className="view-toggle">
      <Link
        to="/"
        state={getViewState('matrix')}
        className={cn('view-toggle-btn', isMatrix && 'view-toggle-btn-active')}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        Matrix
      </Link>
      <Link
        to="/list"
        state={getViewState('list')}
        className={cn('view-toggle-btn', isList && 'view-toggle-btn-active')}
      >
        <List className="h-3.5 w-3.5" />
        List
      </Link>
    </div>
  )
}
