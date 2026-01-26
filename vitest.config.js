import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['scripts/fixers/**/*.js'],
      exclude: ['scripts/fixers/__tests__/**', 'scripts/fixers/**/*.test.js']
    },
    include: ['scripts/fixers/__tests__/**/*.test.js'],
    reporters: ['verbose']
  }
});
