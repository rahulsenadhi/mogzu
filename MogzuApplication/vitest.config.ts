import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'lcov'],
      include: ['src/lib/**'],
      exclude: ['src/lib/database.types.ts', 'src/lib/supabase.ts'],
    },
  },
})
