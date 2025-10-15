import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  server: { port: 4444, cors: true },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'atlas-dashboard': resolve(__dirname, 'src/entrypoints/atlas-dashboard.tsx'),
        'atlas-weekly-board': resolve(__dirname, 'src/entrypoints/atlas-weekly-board.tsx'),
        'atlas-session-checkin': resolve(__dirname, 'src/entrypoints/atlas-session-checkin.tsx'),
      },
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
  },
});
