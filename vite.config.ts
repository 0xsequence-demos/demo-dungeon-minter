import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/demo-lootbox/",
  build: {
    outDir: 'dist',
    rollupOptions: {
      // additional options can be configured here
    }
  }
})
