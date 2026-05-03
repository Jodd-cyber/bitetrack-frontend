import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  // ✅ ADD THIS if not present
  server: {
    historyApiFallback: true,
  }
})