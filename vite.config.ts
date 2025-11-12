import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cssInjectedByJs from 'vite-plugin-css-injected-by-js';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    cssInjectedByJs(), // Inyecta el CSS directamente en el bundle de JS
  ],
  build: {
    rollupOptions: {
      output: {
        // Asegura que el archivo de salida siempre se llame widget.js
        entryFileNames: `widget.js`,
        assetFileNames: `[name].[ext]`,
      },
    },
  },
  define: {
    // Pasa la variable de entorno de Vercel (VITE_API_KEY) al código del cliente
    'process.env.API_KEY': JSON.stringify(process.env.VITE_API_KEY),
  },
});
