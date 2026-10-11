import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/mfe/sales/',
  publicDir: 'node_modules/@bysellens/frontend-core/assets',
  plugins: [react()],
  server: { port: 5177, strictPort: true },
  test: { globals: true, environment: 'jsdom', setupFiles: 'node_modules/@bysellens/frontend-core/testing/setupTests.ts' },
}));
