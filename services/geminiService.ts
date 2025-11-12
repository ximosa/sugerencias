import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY no encontrada. Asegúrate de que esté configurada en las variables de entorno.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Genera 4 preguntas o sugerencias basadas en el texto de un artículo.
 */
export const generateSuggestions = async (articleText: string): Promise<string[]> => {
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
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
            description: "Una sugerencia o pregunta basada en el artículo."
          }
        }
      }
    });

    const jsonText = response.text.trim();
    const suggestions = JSON.parse(jsonText);

    if (Array.isArray(suggestions) && suggestions.every(item => typeof item === 'string')) {
      return suggestions;
    } else {
      throw new Error("La respuesta de la API no tiene el formato de array de strings esperado.");
    }
  } catch (error) {
    console.error("Error al llamar a la API de Gemini para generar sugerencias:", error);
    throw new Error("No se pudieron generar las sugerencias desde la API.");
  }
};

/**
 * Obtiene una respuesta detallada para una sugerencia específica, usando el artículo como contexto.
 */
export const getAnswerForSuggestion = async (suggestion: string, articleContext: string): Promise<string> => {
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
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error al llamar a la API de Gemini para obtener una respuesta:", error);
    throw new Error("No se pudo obtener la respuesta desde la API.");
  }
};
