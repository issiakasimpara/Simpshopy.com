import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 4000,
    open: true,
    cors: true,
    middlewareMode: false,
    fs: {
      strict: false
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Chunks optimisés pour réduire la taille
          'vendor-core': [
            'react', 
            'react-dom'
          ],
          'vendor-router': [
            'react-router-dom'
          ],
          'vendor-query': [
            '@tanstack/react-query'
          ],
          'vendor-ui': [
            '@radix-ui/react-dialog', 
            '@radix-ui/react-dropdown-menu', 
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-switch',
            '@radix-ui/react-toast',
            'lucide-react'
          ],
          'vendor-forms': [
            'react-hook-form',
            '@hookform/resolvers',
            'zod'
          ],
          'vendor-utils': [
            'clsx',
            'tailwind-merge',
            'class-variance-authority'
          ],
          // Séparer les pages admin lourdes
          'admin-dashboard': [
            './src/pages/Dashboard.tsx',
            './src/pages/Analytics.tsx',
            './src/pages/Products.tsx',
            './src/pages/Orders.tsx',
            './src/pages/Customers.tsx'
          ],
          'admin-config': [
            './src/pages/Settings.tsx',
            './src/pages/StoreConfig.tsx',
            './src/pages/SiteBuilder.tsx'
          ],
          'admin-integrations': [
            './src/pages/Integrations.tsx',
            './src/pages/MarketsShipping.tsx',
            './src/pages/Payments.tsx'
          ],
        },
      },
    },
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
      },
    },
    chunkSizeWarningLimit: 2000,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query'
    ],
  },
}));
