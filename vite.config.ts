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
          target: 'https://car-scout-india-main-production.up.railway.app',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    plugins: [
      react()
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Define global constants
    define: {
      'import.meta.env.VITE_API_BASE_URL': 
        mode === 'production' 
          ? JSON.stringify('/api') 
          : JSON.stringify('https://car-scout-india-main-production.up.railway.app/api')
    }
  };
});