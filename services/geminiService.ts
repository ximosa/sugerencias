// FIX: Implemented the geminiService to fetch suggestions and answers from the Gemini API.
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Google Gemini AI client using the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a list of suggested topics based on the provided article text.
 * @param articleText The full text of the article to analyze.
 * @returns A promise that resolves to an array of suggestion strings.
 */
async function generateSuggestions(articleText: string): Promise<string[]> {
  try {
    const model = 'gemini-2.5-flash'; // For basic text tasks.
    const prompt = `Analiza el siguiente artículo y genera 3 o 4 preguntas o temas de seguimiento interesantes que un lector podría tener. Tu respuesta DEBE ser únicamente un array JSON de strings válido. No agregues ninguna explicación ni texto introductorio.

    Artículo:
    ${articleText.substring(0, 30000)}
    `;

    const response = await ai.models.generateContent({
      model: model,
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

    // The response.text will be a JSON string due to the configuration.
    const suggestions = JSON.parse(response.text);
    return suggestions;

  } catch (error) {
    console.error("Error al generar sugerencias con Gemini:", error);
    // Propagate a user-friendly error message.
    throw new Error("No se pudieron generar las sugerencias. Por favor, verifica tu conexión o la configuración de la API.");
  }
}

/**
 * Gets a detailed answer for a specific suggestion, using the article as context.
 * @param suggestion The question or topic to get an answer for.
 * @param articleText The context article.
 * @returns A promise that resolves to the answer string, formatted as simple HTML.
 */
async function getAnswerForSuggestion(suggestion: string, articleText: string): Promise<string> {
  try {
    const model = 'gemini-2.5-flash'; // For basic text tasks.
    const prompt = `Basado en el siguiente artículo, proporciona una respuesta detallada a la pregunta del usuario. Formatea tu respuesta usando HTML simple (puedes usar etiquetas como <p>, <ul>, <ol>, <li>, <strong>, y <em>). No incluyas \`<html>\`, \`<body>\` o bloques \`\`\`html.

    Artículo de contexto:
    """
    ${articleText.substring(0, 30000)}
    """

    Pregunta del usuario: "${suggestion}"
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    
    // The model is prompted to return HTML, which can be used with dangerouslySetInnerHTML
    return response.text;

  } catch (error) {
    console.error("Error al obtener respuesta de Gemini:", error);
    // Propagate a user-friendly error message.
    throw new Error("No se pudo obtener la respuesta. Por favor, inténtalo de nuevo.");
  }
}

export const geminiService = {
  generateSuggestions,
  getAnswerForSuggestion,
};
