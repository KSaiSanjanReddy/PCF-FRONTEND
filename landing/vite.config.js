import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Unique dir so hashed assets do not collide with the platform SPA at /assets/
  build: {
    assetsDir: 'site-assets',
  },
})
