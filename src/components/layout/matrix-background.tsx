import { useEffect, useRef } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { MatrixView } from '@/components/layout/matrix-view'
import { ListView } from '@/components/layout/list-view'

/**
 * Always renders the matrix or list view so it stays mounted
 * as a background when the task detail slide-over is open.
 */
export function MatrixBackground() {
  const routerState = useRouterState()
  const pathname = routerState.location.pathname
  const preservedView = (routerState.location.state as { view?: 'matrix' | 'list' } | undefined)?.view
  const lastMainRef = useRef<'matrix' | 'list'>('matrix')

  useEffect(() => {
    if (preservedView) {
      lastMainRef.current = preservedView
      return
    }

    if (pathname === '/list') lastMainRef.current = 'list'
    else if (pathname === '/') lastMainRef.current = 'matrix'
  }, [pathname, preservedView])

  const current = preservedView
    ?? (pathname === '/list'
      ? 'list'
      : pathname === '/'
        ? 'matrix'
        : lastMainRef.current)

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      {current === 'matrix' ? <MatrixView /> : <ListView />}
    </div>
  )
}
