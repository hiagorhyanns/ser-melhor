import { GoogleGenAI } from '@google/genai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/** true se VITE_GEMINI_API_KEY está definida no .env.local */
export const isGeminiAvailable = (): boolean => Boolean(API_KEY);

let _ai: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!API_KEY) throw new Error('VITE_GEMINI_API_KEY not configured');
  if (!_ai) _ai = new GoogleGenAI({ apiKey: API_KEY });
  return _ai;
}

const MODEL = 'gemini-2.0-flash';
const CONFIG = { maxOutputTokens: 400 } as const;

/**
 * Envia um prompt e retorna o texto completo (não-streaming).
 * Usado por useGeminiSuggestions onde o JSON precisa vir completo.
 */
export async function generateText(prompt: string): Promise<string> {
  const response = await getAI().models.generateContent({
    model: MODEL,
    contents: prompt,
    config: CONFIG,
  });
  return response.text ?? '';
}

/**
 * Envia um prompt e chama `onChunk` conforme os tokens chegam (streaming).
 * Usado por useAIGenerate para exibição progressiva no modal.
 */
export async function generateTextStream(
  prompt: string,
  onChunk: (text: string) => void,
): Promise<void> {
  const stream = await getAI().models.generateContentStream({
    model: MODEL,
    contents: prompt,
    config: CONFIG,
  });
  for await (const chunk of stream) {
    if (chunk.text) onChunk(chunk.text);
  }
}
