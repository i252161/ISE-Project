import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globalSetup: ['./src/data-access/test-setup.ts'],
    include: ['src/**/*.test.ts'],
    testTimeout: 30000,
    hookTimeout: 60000
  }
});
