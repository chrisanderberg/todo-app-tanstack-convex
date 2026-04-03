import { Link, useRouterState } from '@tanstack/react-router'
import { LayoutGrid, List } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ViewToggle() {
  const routerState = useRouterState()
  const isMatrix = routerState.location.pathname === '/'
  const isList = routerState.location.pathname === '/list'

  return (
    <div className="view-toggle">
      <Link
        to="/"
        className={cn('view-toggle-btn', isMatrix && 'view-toggle-btn-active')}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        Matrix
      </Link>
      <Link
        to="/list"
        className={cn('view-toggle-btn', isList && 'view-toggle-btn-active')}
      >
        <List className="h-3.5 w-3.5" />
        List
      </Link>
    </div>
  )
}
