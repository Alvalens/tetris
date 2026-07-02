import path from 'node:path'
import { defineConfig } from 'vitest/config'

// Tests run from the repo root so both the pure engine (client/src/engine)
// and the DB layer (server) are discovered. The `@` alias mirrors vite.config.js
// so engine tests can import via `@/engine/...`.
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'client/src'),
    },
  },
  test: {
    include: ['{client,server}/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
  },
})
