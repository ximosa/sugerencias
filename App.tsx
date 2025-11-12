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
  const answerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const articleElement = document.getElementById('page-wrapper');
    if (articleElement && articleElement.innerText.trim()) {
      setArticleText(articleElement.innerText);
    } else {
      setError('No se pudo encontrar el contenido del artículo (id="page-wrapper").');
      setIsLoadingSuggestions(false);
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
    fetchSuggestions();
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
    setError(null);
    try {
      const result = await geminiService.getAnswerForSuggestion(suggestion, articleText);
      setAnswer(result);
    } catch (err: any) {
      setError(err.message || 'No se pudo obtener la respuesta.');
      console.error(err);
    } finally {
      setIsLoadingAnswer(false);
    }
  }, [articleText, answer, selectedSuggestion]);

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
          {answer && (
            <div className="answer-content">
              <h3 className="answer-title">
                Respuesta a: <span className="answer-title-highlight">{selectedSuggestion}</span>
              </h3>
              <div
                className="answer-text"
                dangerouslySetInnerHTML={{ __html: answer }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;