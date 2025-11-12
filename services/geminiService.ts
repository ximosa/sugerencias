// FIX: Implemented the geminiService to fetch suggestions and answers from the Gemini API.
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Google Gemini AI client using the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Cache for API responses to avoid redundant requests
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Model fallback system for handling overloaded models
const MODELS = {
  primary: 'models/gemini-2.5-pro',
  fallback: 'models/gemini-flash-latest'
} as const;

type ModelType = typeof MODELS.primary | typeof MODELS.fallback;

let currentModel: ModelType = MODELS.primary;
let lastModelSwitch = 0;
const MODEL_SWITCH_COOLDOWN = 30 * 1000; // 30 seconds cooldown between model switches

function getCacheKey(type: string, input: string): string {
  return `${type}:${input.substring(0, 100)}`; // Use first 100 chars as key
}

function getCachedResponse(key: string): any | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  if (cached) {
    cache.delete(key); // Remove expired cache
  }
  return null;
}

function setCachedResponse(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

function switchToFallbackModel(): void {
  const now = Date.now();
  if (now - lastModelSwitch > MODEL_SWITCH_COOLDOWN) {
    console.log(`Switching from ${currentModel} to ${MODELS.fallback} due to overload`);
    currentModel = MODELS.fallback;
    lastModelSwitch = now;
  }
}

function resetToPrimaryModel(): void {
  if (currentModel !== MODELS.primary) {
    console.log(`Resetting to primary model ${MODELS.primary}`);
    currentModel = MODELS.primary;
  }
}

/**
 * Generates a list of suggested topics based on the provided article text.
 * @param articleText The full text of the article to analyze.
 * @returns A promise that resolves to an array of suggestion strings.
 */
async function generateSuggestions(articleText: string): Promise<string[]> {
  const cacheKey = getCacheKey('suggestions', articleText);

  // Check cache first
  const cachedSuggestions = getCachedResponse(cacheKey);
  if (cachedSuggestions) {
    resetToPrimaryModel(); // Reset to primary if cache hit
    return cachedSuggestions;
  }

  // Try with current model, fallback to alternative if overloaded
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const prompt = `Analiza el siguiente artículo y genera 3 o 4 preguntas o temas de seguimiento interesantes que un lector podría tener. Tu respuesta DEBE ser únicamente un array JSON de strings válido. No agregues ninguna explicación ni texto introductorio.

      Artículo:
      ${articleText.substring(0, 30000)}
      `;

      const response = await ai.models.generateContent({
        model: currentModel,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
              description: "Una pregunta o tema sugerido basado en el artículo."
            }
          },
        },
      });

      const textResponse = response.text;
      if (!textResponse) {
        throw new Error("La API de Gemini no devolvió contenido de texto para las sugerencias.");
      }

      // The response.text will be a JSON string due to the configuration.
      const suggestions = JSON.parse(textResponse.trim());

      // Cache the result
      setCachedResponse(cacheKey, suggestions);

      // Reset to primary model on success
      resetToPrimaryModel();

      return suggestions;

    } catch (error) {
      console.error(`Error al generar sugerencias con ${currentModel}:`, error);

      // Check if it's an overload error and we haven't tried the fallback yet
      if (error instanceof Error &&
          (error.message.includes('503') || error.message.includes('overloaded') || error.message.includes('UNAVAILABLE')) &&
          attempt === 0 && currentModel === MODELS.primary) {

        switchToFallbackModel();
        console.log('Attempting with fallback model...');
        continue; // Try again with fallback model
      }

      // Enhanced error handling with more specific messages
      if (error instanceof Error) {
        if (error.message.includes('API_KEY')) {
          throw new Error("Error de configuración: La clave de API de Gemini no está configurada correctamente.");
        } else if (error.message.includes('quota') || error.message.includes('limit')) {
          throw new Error("Se ha alcanzado el límite de uso de la API. Por favor, inténtalo más tarde.");
        } else if (error.message.includes('503') || error.message.includes('overloaded') || error.message.includes('UNAVAILABLE')) {
          throw new Error("El servicio de Gemini está temporalmente sobrecargado. Por favor, inténtalo en unos momentos.");
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new Error("Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.");
        }
      }
      // Propagate a user-friendly error message.
      throw new Error("No se pudieron generar las sugerencias. Por favor, verifica tu conexión o la configuración de la API.");
    }
  }

  // If we get here, both models failed
  throw new Error("No se pudieron generar las sugerencias. Por favor, verifica tu conexión o la configuración de la API.");
}

/**
 * Gets a detailed answer for a specific suggestion, using the article as context.
 * @param suggestion The question or topic to get an answer for.
 * @param articleText The context article.
 * @param onChunk Callback function to handle streaming chunks
 * @returns A promise that resolves to the answer string, formatted as simple HTML.
 */
async function getAnswerForSuggestion(
  suggestion: string,
  articleText: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const cacheKey = getCacheKey('answer', `${suggestion}:${articleText.substring(0, 100)}`);

  // Check cache first
  const cachedAnswer = getCachedResponse(cacheKey);
  if (cachedAnswer) {
    resetToPrimaryModel(); // Reset to primary if cache hit
    return cachedAnswer;
  }

  // Try with current model, fallback to alternative if overloaded
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const prompt = `Basado en el siguiente artículo, proporciona una respuesta detallada a la pregunta del usuario. Formatea tu respuesta usando HTML simple (puedes usar etiquetas como <p>, <ul>, <ol>, <li>, <strong>, y <em>). No incluyas \`<html>\`, \`<body>\` o bloques \`\`\`html.

      Artículo de contexto:
      """
      ${articleText.substring(0, 30000)}
      """

      Pregunta del usuario: "${suggestion}"
      `;

      const response = await ai.models.generateContent({
        model: currentModel,
        contents: prompt,
      });

      const textResponse = response.text;
      if (!textResponse) {
          throw new Error("La API de Gemini no devolvió contenido de texto para la respuesta.");
      }

      // The model is prompted to return HTML, which can be used with dangerouslySetInnerHTML
      const answer = textResponse.trim();

      // Simulate streaming effect by splitting the response into chunks
      if (onChunk) {
        const words = answer.split(' ');
        let currentText = '';
        const chunkSize = 3; // Words per chunk

        for (let i = 0; i < words.length; i += chunkSize) {
          const chunk = words.slice(i, i + chunkSize).join(' ') + ' ';
          currentText += chunk;
          onChunk(currentText);
          // Add delay to simulate typing effect
          await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
        }
      }

      // Cache the result
      setCachedResponse(cacheKey, answer);

      // Reset to primary model on success
      resetToPrimaryModel();

      return answer;

    } catch (error) {
      console.error(`Error al obtener respuesta con ${currentModel}:`, error);

      // Check if it's an overload error and we haven't tried the fallback yet
      if (error instanceof Error &&
          (error.message.includes('503') || error.message.includes('overloaded') || error.message.includes('UNAVAILABLE')) &&
          attempt === 0 && currentModel === MODELS.primary) {

        switchToFallbackModel();
        console.log('Attempting with fallback model...');
        continue; // Try again with fallback model
      }

      // Enhanced error handling with more specific messages
      if (error instanceof Error) {
        if (error.message.includes('API_KEY')) {
          throw new Error("Error de configuración: La clave de API de Gemini no está configurada correctamente.");
        } else if (error.message.includes('quota') || error.message.includes('limit')) {
          throw new Error("Se ha alcanzado el límite de uso de la API. Por favor, inténtalo más tarde.");
        } else if (error.message.includes('503') || error.message.includes('overloaded') || error.message.includes('UNAVAILABLE')) {
          throw new Error("El servicio de Gemini está temporalmente sobrecargado. Por favor, inténtalo en unos momentos.");
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new Error("Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.");
        }
      }
      // Propagate a user-friendly error message.
      throw new Error("No se pudo obtener la respuesta. Por favor, inténtalo de nuevo.");
    }
  }

  // If we get here, both models failed
  throw new Error("No se pudo obtener la respuesta. Por favor, inténtalo de nuevo.");
}

export const geminiService = {
  generateSuggestions,
  getAnswerForSuggestion,
  // Expose cache clearing for testing/debugging
  clearCache: () => cache.clear(),
};