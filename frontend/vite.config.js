import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The /api proxy connects the frontend to your Express backend on port 3000.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

