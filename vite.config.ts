import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import tsconfigPaths from 'vite-tsconfig-paths'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig(({ mode }) => {
  const isTest = mode === 'test' || process.env.VITEST === 'true'

  return {
    plugins: [
      !isTest && devtools(),
      !isTest && nitro({ rollupConfig: { external: [/^@sentry\//] } }),
      tsconfigPaths({ projects: ['./tsconfig.json'] }),
      tailwindcss(),
      !isTest &&
        tanstackStart({
          spa: {
            enabled: true,
          },
        }),
      viteReact(),
    ].filter(Boolean),
    test: {
      environment: 'node',
      include: ['src/**/*.test.ts'],
    },
  }
})

export default config
