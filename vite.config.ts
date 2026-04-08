import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@core': path.resolve(__dirname, 'src/core'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@templates': path.resolve(__dirname, 'src/templates'),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
  build: {
    target: 'es2022',
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/three/')) return 'three';
          if (id.includes('node_modules/@react-three/')) return 'drei';
          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) {
            return 'react-vendor';
          }
          return undefined;
        },
      },
    },
  },
});
