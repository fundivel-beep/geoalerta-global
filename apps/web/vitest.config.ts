import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@geoalerta/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@geoalerta/mesh-protocol': path.resolve(__dirname, '../../packages/mesh-protocol/src'),
    },
  },
});
