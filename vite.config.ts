import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Ya no usamos el modo 'lib', hacemos un build de aplicación normal.
    // Vite usará `index.html` como punto de entrada por defecto.
    rollupOptions: {
      output: {
        // Forzamos el nombre del archivo de entrada a 'widget.js'
        // para que la URL del script de instalación sea estable.
        entryFileNames: `widget.js`,
        // También podemos controlar los nombres de otros archivos si es necesario,
        // pero para este caso, lo principal es el entryFileNames.
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
      }
    }
  }
})
