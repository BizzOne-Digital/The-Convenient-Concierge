import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
      // `server-only` throws outside the React Server environment; tests run server code directly.
      'server-only': fileURLToPath(new URL('./tests/helpers/empty.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.{ts,tsx}', 'tests/integration/**/*.test.ts'],
    testTimeout: 30000,
    hookTimeout: 120000,
    env: { AUTH_SECRET: 'test-secret-that-is-definitely-longer-than-32-chars' },
  },
})
