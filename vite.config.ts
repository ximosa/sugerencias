import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carga las variables de entorno del archivo .env correspondiente al modo actual
  // En Vercel, esto cargará las variables de entorno del proyecto.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    // Esta es la sección clave que soluciona el problema.
    // 'define' reemplaza cualquier instancia de `process.env.API_KEY` en el código
    // con el valor real de `env.VITE_API_KEY` durante el proceso de build.
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY)
    },
    build: {
      rollupOptions: {
        output: {
          // Forzamos el nombre del archivo de entrada a 'widget.js'
          // para que la URL del script de instalación sea estable.
          entryFileNames: `widget.js`,
          chunkFileNames: `[name].js`,
          assetFileNames: `[name].[ext]`,
        }
      }
    }
  }
})
