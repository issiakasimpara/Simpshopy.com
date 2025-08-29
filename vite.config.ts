import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Analyseur de bundle pour identifier les dépendances lourdes
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Chunks optimisés pour performance maximale
          'vendor-core': [
            'react', 
            'react-dom', 
            'react-router-dom',
            '@tanstack/react-query',
            '@supabase/supabase-js'
          ],
          'vendor-ui': [
            '@radix-ui/react-dialog', 
            '@radix-ui/react-dropdown-menu', 
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-switch',
            '@radix-ui/react-slider',
            '@radix-ui/react-toast',
            '@radix-ui/react-progress',
            '@radix-ui/react-tooltip',
            'clsx', 
            'tailwind-merge', 
            'class-variance-authority',
            'lucide-react'
          ],
          'vendor-forms': [
            'react-hook-form',
            '@hookform/resolvers',
            'zod',
            'date-fns'
          ],
          'vendor-charts': ['recharts'],
          'vendor-carousel': ['embla-carousel-react'],
          // Bundle principal optimisé (toutes les pages admin)
          'admin-bundle': [
            './src/pages/Dashboard.tsx',
            './src/pages/Analytics.tsx',
            './src/pages/Products.tsx',
            './src/pages/Orders.tsx',
            './src/pages/Customers.tsx',
            './src/pages/Settings.tsx',
            './src/pages/SiteBuilder.tsx',
            './src/pages/Integrations.tsx',
            './src/pages/Categories.tsx',
            './src/pages/StoreConfig.tsx',
            './src/pages/MarketsShipping.tsx',
            './src/pages/Payments.tsx',
            './src/pages/Themes.tsx',
            './src/pages/Domains.tsx',
            './src/pages/PopupsReductions.tsx',
            './src/components/DashboardLayout.tsx'
          ],
        },
      },
    },
    // Optimisations de build ultra-agressives
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2,
        unsafe: true,
        unsafe_comps: true,
        unsafe_Function: true,
        unsafe_math: true,
        unsafe_proto: true,
        unsafe_regexp: true,
        unsafe_undefined: true,
      },
      mangle: {
        toplevel: true,
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    chunkSizeWarningLimit: 500,
    sourcemap: false,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      '@tanstack/react-query',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      'clsx',
      'tailwind-merge',
      'lucide-react',
      'recharts',
    ],
    exclude: [
      'embla-carousel-react',
      'date-fns',
      'react-hook-form',
      '@hookform/resolvers',
      'zod',
    ],
  },
}));
