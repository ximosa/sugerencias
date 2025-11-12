import { GoogleGenAI, Type } from "@google/genai";

// Fix: Per Gemini API guidelines, initialize the SDK with process.env.API_KEY.
// This resolves the TypeScript error for `import.meta.env` and aligns with the requirement
// to exclusively use `process.env.API_KEY`.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateSuggestions = async (articleText: string): Promise<string[]> => {
  const prompt = `
    Eres un asistente experto en análisis de contenido. Tu tarea es leer un artículo y generar exactamente 4 preguntas o sugerencias de continuación que despierten la curiosidad del lector.
    Estas sugerencias deben ser concisas y formuladas de manera que puedan ser usadas directamente como un prompt en un chat de IA.
    Debes devolver tu respuesta únicamente como un array JSON de strings, sin ningún texto adicional, formato markdown o explicación.
    Ejemplo de salida: ["¿Cuál es el impacto económico de la polinización?", "Explica la estructura social de una colmena.", "¿Qué amenazas enfrentan las abejas hoy en día?", "Crea una lista de plantas para atraer abejas a mi jardín."]

    Artículo:
    ---
    ${articleText.substring(0, 15000)}
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

    const text = response.text;
    if (!text) {
      throw new Error("La respuesta de la API para las sugerencias no contenía texto.");
    }
    
    const jsonText = text.trim();
    const suggestions = JSON.parse(jsonText);
    if (Array.isArray(suggestions) && suggestions.every(item => typeof item === 'string')) {
      return suggestions.slice(0, 4); // Asegurarse de que solo haya 4
    }
    throw new Error("La respuesta de la API no tiene el formato de array de strings esperado.");
  } catch (error) {
    console.error("Error en generateSuggestions:", error);
    throw new Error("No se pudieron generar las sugerencias desde la API.");
  }
};

const getAnswerForSuggestion = async (suggestion: string, articleContext: string): Promise<string> => {
  const prompt = `
    Actúa como un asistente experto. Basándote en el siguiente artículo, proporciona una respuesta clara, bien estructurada y útil a la pregunta del usuario.
    Tu respuesta debe ser directa y concisa. No uses Markdown, pero sí saltos de línea para la legibilidad.
    
    Artículo de Contexto:
    ---
    ${articleContext.substring(0, 15000)}
    ---

    Pregunta del Usuario: "${suggestion}"
  `;
  try {
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    
    const text = response.text;
    if (!text) {
      throw new Error("La respuesta de la API para la respuesta no contenía texto.");
    }

    // Limpiamos la respuesta para evitar markdown
    return text.replace(/`/g, "").replace(/\*/g, "").replace(/#/g, "");
  } catch (error) {
    console.error("Error en getAnswerForSuggestion:", error);
    throw new Error("No se pudo obtener la respuesta desde la API.");
  }
};
    
export const geminiService = { generateSuggestions, getAnswerForSuggestion };