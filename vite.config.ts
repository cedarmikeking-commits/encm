import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { viteMockServe } from 'vite-plugin-mock';
// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [
    react(),
    viteMockServe({
      mockPath: './mock',
      enable: true,
      logger: true,
    }),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  css: {
    preprocessorOptions: {
      scss: {},
    },
  },
  build: {
    sourcemap: true,
  },
  server: {
    port: 5177,
    proxy: {
      '/api': {
        target: 'http://62.234.182.118:13001',
        //target: 'http://localhost:13001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
