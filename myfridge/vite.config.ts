import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react() ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    hmr: {
      protocol: "ws",           // Ensures WebSocket is being used
      host: "localhost",        // Ensures it's binding to localhost
      port: 5173,               // Correct port where your dev server is running
      clientPort: 5173,         // You can try setting this if using non-standard setups
    },
  },
})
