import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // <--- ESTO ES CRÍTICO: Permite que Electron encuentre los archivos html/css/js
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
})