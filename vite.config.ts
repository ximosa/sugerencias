import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'index.tsx'),
      name: 'GeminiSuggestionsWidget',
      fileName: (format) => `widget.js`,
      formats: ['iife']
    },
    rollupOptions: {
      // No externalizamos React/ReactDOM, los incluimos en el bundle
      // para que el widget sea autocontenido.
    }
  }
})
