import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
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
          // Séparer les dépendances principales
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-tabs', '@radix-ui/react-toast'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-query': ['@tanstack/react-query'],
          // Séparer les graphiques pour lazy loading
          'vendor-charts-core': ['recharts/lib/chart/LineChart', 'recharts/lib/chart/BarChart'],
          'vendor-charts-advanced': ['recharts/lib/chart/PieChart', 'recharts/lib/chart/AreaChart'],
          'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge'],
          'vendor-icons': ['lucide-react'],
        },
        // Optimiser la taille des chunks
      },
    },
    // Optimisations de build
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production', // Supprimer console.log en production
        drop_debugger: true,
      },
    },
    // Code splitting automatique
  },
  // Optimisations de développement
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      '@tanstack/react-query',
    ],
  },
}));
