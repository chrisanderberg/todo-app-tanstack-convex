import { ConvexReactClient, ConvexProvider } from 'convex/react'
import type { PropsWithChildren } from 'react'

const convexUrl = import.meta.env.VITE_CONVEX_URL

const convexClient = convexUrl
  ? new ConvexReactClient(convexUrl, {
      unsavedChangesWarning: false,
    })
  : null

export function AppProviders({ children }: PropsWithChildren) {
  if (!convexClient) {
    return <>{children}</>
  }

  return <ConvexProvider client={convexClient}>{children}</ConvexProvider>
}

export function getConvexSetupError() {
  if (!convexUrl) {
    return 'Missing VITE_CONVEX_URL. Run `npm run convex:dev` to create the local Convex environment.'
  }

  return null
}
