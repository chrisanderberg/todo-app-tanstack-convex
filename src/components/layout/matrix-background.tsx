import { useEffect, useRef } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { MatrixView } from '@/components/layout/matrix-view'
import { ListView } from '@/components/layout/list-view'
import { getTaskRouteView } from '@/lib/task-route-state'

/**
 * Always renders the matrix or list view so it stays mounted
 * as a background when the task detail slide-over is open.
 */
export function MatrixBackground() {
  const routerState = useRouterState()
  const pathname = routerState.location.pathname
  const preservedView = routerState.location.state.view
  const lastMainRef = useRef<'matrix' | 'list'>('matrix')

  useEffect(() => {
    if (preservedView) {
      lastMainRef.current = preservedView
      return
    }

    if (pathname === '/list') lastMainRef.current = 'list'
    else if (pathname === '/') lastMainRef.current = 'matrix'
  }, [pathname, preservedView])

  const current =
    pathname.startsWith('/tasks/')
      ? preservedView ?? lastMainRef.current
      : getTaskRouteView(routerState.location.state, pathname)

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      {current === 'matrix' ? <MatrixView /> : <ListView />}
    </div>
  )
}
