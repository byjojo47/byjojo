import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;

          if (
            id.includes('react') ||
            id.includes('react-dom') ||
            id.includes('react-router-dom')
          ) {
            return 'react-vendor';
          }

          if (
            id.includes('@tanstack/react-query') ||
            id.includes('axios')
          ) {
            return 'data-vendor';
          }

          if (
            id.includes('lucide-react') ||
            id.includes('framer-motion') ||
            id.includes('react-hot-toast')
          ) {
            return 'ui-vendor';
          }

          if (
            id.includes('react-hook-form') ||
            id.includes('@hookform/resolvers') ||
            id.includes('zod')
          ) {
            return 'forms-vendor';
          }

          if (id.includes('react-helmet-async')) {
            return 'seo-vendor';
          }

          return 'vendor';
        },
      },
    },
  },
});