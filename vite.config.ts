import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        '/api': {
          target: mode === 'development'
            ? 'http://localhost:3001'  // Development: local backend
            : 'https://car-scout-india-main-production.up.railway.app', // Production
          changeOrigin: true,
          secure: false,
        }
      },
    },
    plugins: [
      react()
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Optimize build output
    build: {
      // Reduce chunk size warnings threshold
      chunkSizeWarningLimit: 1000,

      // Optimize assets
      assetsInlineLimit: 4096, // Inline assets smaller than 4kb

      // Rollup options for optimization
      rollupOptions: {
        output: {
          // Manual chunk splitting for better caching
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['lucide-react'],
          },

          // Asset file naming with hash for cache busting
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.') || [];
            const ext = info[info.length - 1];

            // Images get special treatment with content hash
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || '')) {
              return `assets/images/[name]-[hash][extname]`;
            }

            // CSS files
            if (ext === 'css') {
              return `assets/css/[name]-[hash][extname]`;
            }

            // Other assets
            return `assets/[name]-[hash][extname]`;
          },

          // Chunk file naming
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
        },
      },

      // Source maps for production debugging (optional)
      sourcemap: mode === 'production' ? false : true,

      // Minification
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production', // Remove console logs in production
          drop_debugger: true,
        },
      },
    },

    // Define global constants
    define: {
      'import.meta.env.VITE_API_BASE_URL':
        mode === 'production'
          ? JSON.stringify('/api')
          : JSON.stringify('/api') // Use proxy in both cases
    },

    // Optimize dependencies
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
      exclude: [],
    },
  };
});