import type { HistoryState } from '@tanstack/history'

export type TaskRouteView = 'matrix' | 'list'

export type TaskRouteState = {
  from: '/' | '/list'
  view: TaskRouteView
}

export function getTaskRouteState(view: TaskRouteView): TaskRouteState {
  return { from: view === 'list' ? '/list' : '/', view }
}

export function getViewState(view: TaskRouteView): Pick<TaskRouteState, 'view'> {
  return { view }
}

export function getTaskRouteView(state: HistoryState | undefined, pathname: string): TaskRouteView {
  return state?.view ?? (pathname.startsWith('/list') ? 'list' : 'matrix')
}

declare module '@tanstack/history' {
  interface HistoryState {
    from?: TaskRouteState['from']
    view?: TaskRouteState['view']
  }
}
