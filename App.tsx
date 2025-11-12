import React, { useState, useCallback, useEffect, useRef } from 'react';
import { generateSuggestions, getAnswerForSuggestion } from './services/geminiService';
import SuggestionCard from './components/SuggestionCard';
import LoadingSpinner from './components/LoadingSpinner';

const App: React.FC = () => {
  const [articleText, setArticleText] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(true);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState<boolean>(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const answerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Captura el texto del artículo del DOM cuando el componente se monta.
    const articleElement = document.getElementById('page-wrapper');
    if (articleElement && articleElement.innerText.trim()) {
      setArticleText(articleElement.innerText);
    } else {
        setError('No se pudo encontrar el contenido del artículo. Asegúrate de que el artículo esté dentro de un elemento con id="page-wrapper".');
        setIsLoadingSuggestions(false);
    }
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!articleText) return;

      setIsLoadingSuggestions(true);
      setError(null);
      setSuggestions([]);
      setAnswer(null);
      setSelectedSuggestion(null);

      try {
        const result = await generateSuggestions(articleText);
        setSuggestions(result);
      } catch (err) {
        setError('Hubo un error al generar las sugerencias. Por favor, inténtalo de nuevo.');
        console.error(err);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    if(articleText) {
      fetchSuggestions();
    }
  }, [articleText]);

  useEffect(() => {
    // Desplaza a la vista la respuesta cuando aparece o cuando empieza a cargar
    if ((isLoadingAnswer || answer) && answerRef.current) {
      answerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [answer, isLoadingAnswer]);

  const handleSuggestionClick = useCallback(async (suggestion: string) => {
    // Si ya se está mostrando una respuesta para esta sugerencia, no hacer nada
    if (selectedSuggestion === suggestion && answer) return;
    
    setSelectedSuggestion(suggestion);
    setIsLoadingAnswer(true);
    setAnswer(null);
    setError(null);

    try {
      const result = await getAnswerForSuggestion(suggestion, articleText);
      setAnswer(result);
    } catch (err) {
      setError('No se pudo obtener la respuesta. Por favor, inténtalo de nuevo.');
      console.error(err);
    } finally {
      setIsLoadingAnswer(false);
    }
  }, [articleText, answer, selectedSuggestion]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8">
      <div className="flex items-center mb-6">
        <div className="bg-indigo-500 p-2 rounded-full mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Explora Más Sobre Este Artículo</h1>
      </div>
      
      {error && (
        <div className="mt-4 text-center text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2">Error de Configuración</h3>
            <p>{error}</p>
        </div>
      )}
      
      {!error && (
        <>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            He analizado este artículo y he preparado algunos temas que podrían interesarte. Haz clic en cualquiera de ellos para obtener una respuesta al instante.
          </p>
          
          {isLoadingSuggestions && (
             <div className="mt-8 pt-6 flex flex-col items-center justify-center">
                <LoadingSpinner />
                <p className="mt-4 text-gray-600 dark:text-gray-300">Generando ideas...</p>
             </div>
          )}

          {!isLoadingSuggestions && suggestions.length > 0 && (
            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Haz clic en un tema para explorar:</h2>
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <SuggestionCard key={index} suggestion={suggestion} onClick={handleSuggestionClick} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div ref={answerRef} className="mt-6 pt-2">
        {isLoadingAnswer && (
          <div className="flex items-center justify-center p-4 text-gray-600 dark:text-gray-300">
            <LoadingSpinner />
            <span className="ml-3">Buscando la respuesta...</span>
          </div>
        )}

        {answer && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  Respuesta a: <span className="text-indigo-500 dark:text-indigo-400">{selectedSuggestion}</span>
              </h3>
              <div 
                className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: answer.replace(/\n/g, '<br />') }}
              />
          </div>
        )}
      </div>

    </div>
  );
};

export default App;
