import { HeadContent, Outlet, Scripts, createRootRoute, useRouterState } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { AppProviders, getConvexSetupError } from '@/lib/convex-provider'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { ViewToggle } from '@/components/layout/view-toggle'
import { MatrixBackground } from '@/components/layout/matrix-background'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Eisenhower' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: RootDocument,
})

function AppShell() {
  const convexError = getConvexSetupError()
  const routerState = useRouterState()
  const pathname = routerState.location.pathname
  const isTaskRoute = pathname.startsWith('/tasks/')

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <div className="app-topbar-inner">
          <div className="flex items-center gap-2">
            <span className="brand-mark">Eisenhower</span>
            <span className="brand-sub">Todo</span>
          </div>
          <ViewToggle />
          <div className="w-[120px]" />
        </div>
      </header>

      {convexError ? (
        <div className="p-6">
          <div className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg-raised)] px-4 py-3 text-sm text-[var(--text-secondary)]">
            {convexError}
          </div>
        </div>
      ) : (
        <div className="app-body" style={{ height: 'calc(100vh - 56px)' }}>
          <aside className="app-sidebar">
            <AppSidebar />
          </aside>
          <main className="app-main" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Always render the matrix/list route content */}
            <MatrixBackground />
            {/* Task detail slide-over renders on top when on /tasks/* route */}
            {isTaskRoute && <Outlet />}
          </main>
        </div>
      )}
    </div>
  )
}

function RootDocument() {
  const convexError = getConvexSetupError()
  const shell = <AppShell />

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-[var(--bg)] font-sans text-[var(--text-primary)] antialiased">
        {convexError ? shell : <AppProviders>{shell}</AppProviders>}
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[{ name: 'Tanstack Router', render: <TanStackRouterDevtoolsPanel /> }]}
        />
        <Scripts />
      </body>
    </html>
  )
}
