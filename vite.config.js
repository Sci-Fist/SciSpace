import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Explicitly set the entry point
  build: {
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  // Configure optimizeDeps to include React
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  },
  css: {
    preprocessorOptions: {
      scss: {
        // You can add global SCSS imports here if needed, e.g., for variables
        // additionalData: `@import "./src/styles/_variables.scss";`
      },
    },
  },
  // Configure the development server port
  server: {
    port: 8080,
    host: true, // Enable host access
  },
});
