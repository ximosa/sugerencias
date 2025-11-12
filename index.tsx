import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './widget.css';

const rootElement = document.getElementById('root');

// Progressive enhancement: only load if root element exists and browser supports required features
if (rootElement && typeof window !== 'undefined') {
  // Check for basic required features
  const hasRequiredFeatures = !!(
    window.fetch instanceof Function &&
    window.Promise &&
    window.Map &&
    window.IntersectionObserver
  );

  if (hasRequiredFeatures) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    console.warn("Sugerencias Gemini: El navegador no soporta las características requeridas. El widget no se cargará.");
    rootElement.innerHTML = '<p style="color: #6b7280; font-size: 14px;">Tu navegador no es compatible con este widget.</p>';
  }
} else {
  console.error("Sugerencias Gemini: No se pudo encontrar el elemento con id='root'. El widget no se puede cargar.");
}
