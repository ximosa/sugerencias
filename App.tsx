import { useState, useEffect, useCallback, useRef } from 'react';
import { geminiService } from './services/geminiService';
import { SuggestionCard } from './components/SuggestionCard';
import { LoadingSpinner } from './components/LoadingSpinner';
import './widget.css';

function App() {
  const [articleText, setArticleText] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [streamingAnswer, setStreamingAnswer] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const answerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadWidget = () => {
      const articleElement = document.getElementById('page-wrapper');
      if (articleElement && articleElement.innerText.trim()) {
        setArticleText(articleElement.innerText);
      } else {
        setError('No se pudo encontrar el contenido del artículo (id="page-wrapper").');
        setIsLoadingSuggestions(false);
      }
    };

    // Progressive enhancement: check if Intersection Observer is available
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          loadWidget();
          observer.disconnect();
        }
      }, { threshold: 0.1 });

      const widgetElement = document.getElementById('root');
      if (widgetElement) {
        observer.observe(widgetElement);
      } else {
        // Fallback if root element not found
        loadWidget();
      }
    } else {
      // Fallback for browsers without Intersection Observer
      loadWidget();
    }
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!articleText) return;
      setIsLoadingSuggestions(true);
      setError(null);
      try {
        const result = await geminiService.generateSuggestions(articleText);
        setSuggestions(result);
      } catch (err: any) {
        setError(err.message || 'Hubo un error al generar las sugerencias.');
        console.error(err);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    // Add a small delay to show loading state for better UX
    const timeoutId = setTimeout(fetchSuggestions, 300);

    return () => clearTimeout(timeoutId);
  }, [articleText]);

  useEffect(() => {
    if ((isLoadingAnswer || answer) && answerRef.current) {
      answerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [answer, isLoadingAnswer]);

  const handleSuggestionClick = useCallback(async (suggestion: string) => {
    if (selectedSuggestion === suggestion && answer) return;
    setSelectedSuggestion(suggestion);
    setIsLoadingAnswer(true);
    setAnswer(null);
    setStreamingAnswer('');
    setError(null);
    setIsStreaming(true);

    try {
      const result = await geminiService.getAnswerForSuggestion(
        suggestion,
        articleText,
        (chunk: string) => {
          setStreamingAnswer(chunk);
        }
      );
      setAnswer(result);
      setStreamingAnswer(result); // Ensure final answer is set
      setRetryCount(0); // Reset retry count on success
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'No se pudo obtener la respuesta.');
      setRetryCount(prev => prev + 1);
      setIsStreaming(false);
    } finally {
      setIsLoadingAnswer(false);
      setIsStreaming(false);
    }
  }, [articleText, answer, selectedSuggestion]);

  const handleRetry = useCallback(() => {
    if (selectedSuggestion && retryCount < 3) {
      handleSuggestionClick(selectedSuggestion);
    }
  }, [selectedSuggestion, retryCount, handleSuggestionClick]);

  // Auto-retry logic for overloaded service
  useEffect(() => {
    if (error && error.includes('sobrecargado') && retryCount < 3) {
      const autoRetryTimeout = setTimeout(() => {
        if (selectedSuggestion) {
          handleSuggestionClick(selectedSuggestion);
        }
      }, Math.pow(2, retryCount) * 2000); // Exponential backoff: 2s, 4s, 8s

      return () => clearTimeout(autoRetryTimeout);
    }
  }, [error, retryCount, selectedSuggestion, handleSuggestionClick]);

  return (
    <div className="gemini-suggestions-widget">
      <div className="widget-container">
        {error && (
          <div className="widget-error">
            <h3 className="widget-error-title">Error</h3>
            <p>{error}</p>
          </div>
        )}

        {!error && (
          <>
            {isLoadingSuggestions && (
              <div className="widget-loading-suggestions">
                <LoadingSpinner />
                <p>Generando ideas...</p>
              </div>
            )}

            {!isLoadingSuggestions && suggestions.length > 0 && (
              <section className="suggestions-section">
                <h2 className="suggestions-title">Haz clic en un tema para explorar:</h2>
                <div className="suggestions-list">
                  {suggestions.map((suggestion, index) => (
                    <SuggestionCard key={index} suggestion={suggestion} onClick={handleSuggestionClick} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <div ref={answerRef} className="answer-area">
           {isLoadingAnswer && (
             <div className="widget-loading-answer">
               <LoadingSpinner />
               <span>Buscando la respuesta...</span>
             </div>
           )}
           {error && selectedSuggestion && retryCount < 3 && (
             <div className="widget-retry">
               <p className="retry-message">
                 {error.includes('sobrecargado')
                   ? `Reintentando automáticamente en ${Math.pow(2, retryCount)} segundos...`
                   : 'Error al cargar la respuesta.'}
               </p>
               <button onClick={handleRetry} className="retry-button">
                 Reintentar ahora ({retryCount}/3)
               </button>
             </div>
           )}
           {(isStreaming || answer) && (
             <div className="answer-content">
               <h3 className="answer-title">
                 Respuesta a: <span className="answer-title-highlight">{selectedSuggestion}</span>
               </h3>
               <div
                 className="answer-text"
                 dangerouslySetInnerHTML={{
                   __html: isStreaming ? streamingAnswer : (answer || '')
                 }}
               />
               {isStreaming && (
                 <div className="streaming-cursor">|</div>
               )}
               {!isStreaming && answer && (
                 <div className="answer-actions">
                   <button
                     onClick={() => {
                       setAnswer(null);
                       setSelectedSuggestion(null);
                       // Scroll to suggestions section
                       const suggestionsSection = document.querySelector('.suggestions-section');
                       if (suggestionsSection) {
                         suggestionsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                       }
                     }}
                     className="back-to-suggestions-button"
                   >
                     ← Volver a las sugerencias
                   </button>
                 </div>
               )}
             </div>
           )}
         </div>
      </div>
    </div>
  );
}

export default App;