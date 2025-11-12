import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const initializeWidget = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("Error: El elemento con id='root' no fue encontrado. Asegúrate de que el div de montaje exista en tu HTML.");
    return;
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Espera a que el contenido del DOM esté completamente cargado antes de ejecutar el script.
// Esto soluciona el problema de que el script se ejecute antes de que exista el elemento #root.
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initializeWidget);
} else {
  initializeWidget();
}
