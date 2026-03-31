import { HeadContent, Link, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { AppProviders, getConvexSetupError } from '@/lib/convex-provider'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Eisenhower Todo',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const convexError = getConvexSetupError()
  const siteChrome = (
    <div className="site-frame">
      <header className="site-header">
        <div className="page-shell flex flex-wrap items-center justify-between gap-4 py-5">
          <div>
            <p className="eyebrow">Local-first task ranking</p>
            <Link className="brand-mark" to="/">
              Eisenhower Todo
            </Link>
          </div>
          <nav className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel-soft)] p-1">
            <Link
              activeProps={{ className: 'nav-pill nav-pill-active' }}
              activeOptions={{ exact: true }}
              className="nav-pill"
              to="/"
            >
              Matrix
            </Link>
            <Link
              activeProps={{ className: 'nav-pill nav-pill-active' }}
              className="nav-pill"
              to="/list"
            >
              List
            </Link>
          </nav>
        </div>
      </header>

      {convexError ? (
        <div className="page-shell pt-6">
          <div className="rounded-[1.4rem] border border-[var(--line-strong)] bg-[var(--paper)] px-5 py-4 text-sm text-[var(--muted-ink)]">
            {convexError}
          </div>
        </div>
      ) : (
        children
      )}

      <footer className="page-shell pb-10 pt-4 text-sm text-[var(--muted-ink)]">
        <div className="rounded-[1.4rem] border border-[var(--line)] bg-[var(--panel-soft)] px-5 py-4">
          Ordered ranks stay canonical. Percentiles remain derived.
        </div>
      </footer>
    </div>
  )

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-[var(--bg)] font-sans text-[var(--ink)] antialiased">
        {convexError ? siteChrome : <AppProviders>{siteChrome}</AppProviders>}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
