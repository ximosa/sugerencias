// Este archivo es una versión auto-contenida y compilada de la aplicación de React.
// No necesita un paso de compilación en el navegador del usuario.

(function () {
  'use strict';

  // --- Dependencias (simulando importaciones de CDN) ---
  const React = window.React;
  const ReactDOM = window.ReactDOM;
  const { GoogleGenAI, Type } = window.GoogleGenAI;
  
  if (!React || !ReactDOM || !GoogleGenAI) {
    console.error("Error: Las dependencias (React, ReactDOM, GoogleGenAI) no se cargaron correctamente. Asegúrate de que los scripts de la CDN estén en la página.");
    return;
  }

  // --- Componente LoadingSpinner ---
  const LoadingSpinner = () => {
    return React.createElement(
      'svg',
      {
        className: 'animate-spin h-5 w-5 text-indigo-500',
        xmlns: 'http://www.w3.org/2000/svg',
        fill: 'none',
        viewBox: '0 0 24 24',
      },
      React.createElement('circle', {
        className: 'opacity-25',
        cx: '12',
        cy: '12',
        r: '10',
        stroke: 'currentColor',
        strokeWidth: '4',
      }),
      React.createElement('path', {
        className: 'opacity-75',
        fill: 'currentColor',
        d: 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z',
      })
    );
  };

  // --- Componente SuggestionCard ---
  const SuggestionCard = ({ suggestion, onClick }) => {
    return React.createElement(
      'button',
      {
        onClick: () => onClick(suggestion),
        className: 'w-full text-left p-4 bg-gray-100 dark:bg-slate-700/50 rounded-lg hover:bg-indigo-100 dark:hover:bg-slate-600/70 group transition-all duration-300 transform hover:-translate-y-1',
      },
      React.createElement(
        'div',
        { className: 'flex items-center justify-between' },
        React.createElement(
          'p',
          { className: 'text-gray-700 dark:text-gray-200 group-hover:text-indigo-800 dark:group-hover:text-white font-medium' },
          suggestion
        ),
        React.createElement(
          'svg',
          {
            xmlns: 'http://www.w3.org/2000/svg',
            className: 'h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-transform duration-300 group-hover:translate-x-1',
            fill: 'none',
            viewBox: '0 0 24 24',
            stroke: 'currentColor',
            strokeWidth: 2,
          },
          React.createElement('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            d: 'M13 7l5 5-5 5M6 12h12',
          })
        )
      )
    );
  };
  
  // --- Servicio geminiService ---
  const geminiService = (() => {
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
      console.error("API_KEY no encontrada. Asegúrate de que esté configurada en las variables de entorno del iframe.");
      // No lanzamos un error para no romper la carga, el error se mostrará en la UI.
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const generateSuggestions = async (articleText) => {
       if (!API_KEY) throw new Error("API_KEY no configurada.");
       const prompt = `
        Eres un asistente experto en análisis de contenido. Tu tarea es leer un artículo y generar exactamente 4 preguntas o sugerencias de continuación que despierten la curiosidad del lector.
        Estas sugerencias deben ser concisas y formuladas de manera que puedan ser usadas directamente como un prompt en un chat de IA.
        Debes devolver tu respuesta únicamente como un array JSON de strings, sin ningún texto adicional, formato markdown o explicación.
        Ejemplo de salida: ["¿Cuál es el impacto económico de la polinización?", "Explica la estructura social de una colmena.", "¿Qué amenazas enfrentan las abejas hoy en día?", "Crea una lista de plantas para atraer abejas a mi jardín."]

        Artículo:
        ---
        ${articleText}
        ---
      `;
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        });
        const jsonText = response.text.trim();
        const suggestions = JSON.parse(jsonText);
        if (Array.isArray(suggestions) && suggestions.every(item => typeof item === 'string')) {
          return suggestions;
        }
        throw new Error("La respuesta de la API no tiene el formato de array de strings esperado.");
      } catch (error) {
        console.error("Error en generateSuggestions:", error);
        throw new Error("No se pudieron generar las sugerencias desde la API.");
      }
    };

    const getAnswerForSuggestion = async (suggestion, articleContext) => {
      if (!API_KEY) throw new Error("API_KEY no configurada.");
      const prompt = `
        Actúa como un asistente experto. Basándote en el siguiente artículo, proporciona una respuesta clara, bien estructurada y útil a la pregunta del usuario.
        Formatea tu respuesta usando saltos de línea para una mejor legibilidad. No uses Markdown.
        
        Artículo de Contexto:
        ---
        ${articleContext}
        ---

        Pregunta del Usuario: "${suggestion}"
      `;
      try {
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
        return response.text;
      } catch (error) {
        console.error("Error en getAnswerForSuggestion:", error);
        throw new Error("No se pudo obtener la respuesta desde la API.");
      }
    };
    
    return { generateSuggestions, getAnswerForSuggestion };
  })();

  // --- Componente Principal App ---
  const App = () => {
    const { useState, useEffect, useCallback, useRef } = React;
    const [articleText, setArticleText] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
    const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
    const [answer, setAnswer] = useState(null);
    const [selectedSuggestion, setSelectedSuggestion] = useState(null);
    const [error, setError] = useState(null);
    const answerRef = useRef(null);
    
    useEffect(() => {
      const articleElement = document.getElementById('page-wrapper');
      if (articleElement && articleElement.innerText.trim()) {
        setArticleText(articleElement.innerText);
      } else {
        setError('No se pudo encontrar el contenido del artículo (id="page-wrapper").');
        setIsLoadingSuggestions(false);
      }
      if (!process.env.API_KEY) {
        setError('La API KEY de Gemini no está configurada. El widget no puede funcionar.');
        setIsLoadingSuggestions(false);
      }
    }, []);

    useEffect(() => {
      const fetchSuggestions = async () => {
        if (!articleText || !process.env.API_KEY) return;
        setIsLoadingSuggestions(true);
        setError(null);
        try {
          const result = await geminiService.generateSuggestions(articleText);
          setSuggestions(result);
        } catch (err) {
          setError('Hubo un error al generar las sugerencias.');
          console.error(err);
        } finally {
          setIsLoadingSuggestions(false);
        }
      };
      fetchSuggestions();
    }, [articleText]);

    useEffect(() => {
      if ((isLoadingAnswer || answer) && answerRef.current) {
        answerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, [answer, isLoadingAnswer]);

    const handleSuggestionClick = useCallback(async (suggestion) => {
      if (selectedSuggestion === suggestion && answer) return;
      setSelectedSuggestion(suggestion);
      setIsLoadingAnswer(true);
      setAnswer(null);
      setError(null);
      try {
        const result = await geminiService.getAnswerForSuggestion(suggestion, articleText);
        setAnswer(result);
      } catch (err) {
        setError('No se pudo obtener la respuesta.');
        console.error(err);
      } finally {
        setIsLoadingAnswer(false);
      }
    }, [articleText, answer, selectedSuggestion]);

    // Usamos React.createElement para no necesitar JSX
    return React.createElement(
      'div',
      { className: 'w-full max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8' },
      React.createElement(
          'div', {className: 'flex items-center mb-6'},
          React.createElement('div', {className: 'bg-indigo-500 p-2 rounded-full mr-4'},
             React.createElement('svg', {xmlns: 'http://www.w3.org/2000/svg', className: 'h-6 w-6 text-white', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor'},
              React.createElement('path', {strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' }))
          ),
          React.createElement('h1', {className: 'text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white'}, 'Explora Más Sobre Este Artículo')
      ),
      error && React.createElement(
          'div', { className: 'mt-4 text-center text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/50 p-4 rounded-lg' },
          React.createElement('h3', { className: 'font-bold text-lg mb-2' }, 'Error'),
          React.createElement('p', null, error)
      ),
      !error && React.createElement(
        React.Fragment,
        null,
        React.createElement('p', { className: 'text-gray-600 dark:text-gray-300 mb-6' }, 'He analizado este artículo y he preparado algunos temas que podrían interesarte. Haz clic en cualquiera de ellos para obtener una respuesta al instante.'),
        isLoadingSuggestions && React.createElement(
          'div', { className: 'mt-8 pt-6 flex flex-col items-center justify-center' },
          React.createElement(LoadingSpinner),
          React.createElement('p', { className: 'mt-4 text-gray-600 dark:text-gray-300' }, 'Generando ideas...')
        ),
        !isLoadingSuggestions && suggestions.length > 0 && React.createElement(
          'div', { className: 'mt-8 border-t border-gray-200 dark:border-gray-700 pt-6' },
          React.createElement('h2', { className: 'text-xl font-semibold text-gray-800 dark:text-white mb-4' }, 'Haz clic en un tema para explorar:'),
          React.createElement(
            'div', { className: 'space-y-3' },
            suggestions.map((suggestion, index) => React.createElement(SuggestionCard, { key: index, suggestion: suggestion, onClick: handleSuggestionClick }))
          )
        )
      ),
      React.createElement(
        'div', { ref: answerRef, className: 'mt-6 pt-2' },
        isLoadingAnswer && React.createElement(
          'div', { className: 'flex items-center justify-center p-4 text-gray-600 dark:text-gray-300' },
          React.createElement(LoadingSpinner),
          React.createElement('span', { className: 'ml-3' }, 'Buscando la respuesta...')
        ),
        answer && React.createElement(
          'div', { className: 'border-t border-gray-200 dark:border-gray-700 pt-6' },
          React.createElement('h3', { className: 'text-xl font-semibold text-gray-800 dark:text-white mb-4' },
            'Respuesta a: ',
            React.createElement('span', { className: 'text-indigo-500 dark:text-indigo-400' }, selectedSuggestion)
          ),
          React.createElement('div', {
            className: 'prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300',
            dangerouslySetInnerHTML: { __html: answer.replace(/\n/g, '<br />') },
          })
        )
      )
    );
  };
  
  // --- Inicialización de la Aplicación ---
  const initializeWidget = () => {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      console.error("Error: El elemento con id='root' no fue encontrado.");
      return;
    }
    // Cargar TailwindCSS si no está presente
    if (!document.querySelector('script[src="https://cdn.tailwindcss.com"]')) {
        const tailwindScript = document.createElement('script');
        tailwindScript.src = "https://cdn.tailwindcss.com";
        document.head.appendChild(tailwindScript);
    }
    
    // Cargar las dependencias de la CDN si no están presentes
    const loadScript = (src, onLoad) => {
        if(document.querySelector(`script[src="${src}"]`)) {
            if (onLoad) onLoad();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = onLoad;
        document.head.appendChild(script);
    };

    loadScript("https://aistudiocdn.com/react@^19.2.0", () => {
        loadScript("https://aistudiocdn.com/react-dom@^19.2.0/client", () => {
             loadScript("https://aistudiocdn.com/@google/genai@^1.29.0", () => {
                const root = ReactDOM.createRoot(rootElement);
                root.render(React.createElement(App));
             });
        });
    });
  };

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initializeWidget);
  } else {
    initializeWidget();
  }

})();
