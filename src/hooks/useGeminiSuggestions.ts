import { useCallback, useEffect, useState } from 'react';
import { generateText, isGeminiAvailable } from '../lib/gemini';
import type { AppData } from '../types';

export type AISuggestion = { titulo: string; descricao: string };

const CACHE_KEY = 'vestir_melhor_ai_cache';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

type CacheEntry = { hash: string; ts: number; items: AISuggestion[] };

/** Hash leve baseado em contagens por categoria — muda quando itens são adicionados/removidos */
function dataHash(data: AppData): string {
  return Object.entries(data)
    .map(([k, v]) => `${k}:${v.length}:${v.filter((i) => i.completed).length}`)
    .join('|');
}

/** Extrai nome legível de qualquer tipo de item */
function itemName(item: Record<string, unknown>): string {
  return String(
    item['nome'] ?? item['titulo'] ?? item['musculo'] ?? item['estilo'] ?? item['tipoCorte'] ?? '',
  );
}

function buildPrompt(data: AppData): string {
  const summary = (Object.entries(data) as [string, unknown[]][]).map(([cat, items]) => {
    const typedItems = items as (Record<string, unknown> & { completed: boolean })[];
    return {
      categoria: cat,
      total: typedItems.length,
      concluidos: typedItems.filter((i) => i.completed).length,
      exemplos: typedItems.slice(0, 3).map(itemName).filter(Boolean),
    };
  });

  return `Você é um coach de estilo pessoal. Analise os dados do app e sugira 3 melhorias concretas, acionáveis e motivadoras em português do Brasil. Responda SOMENTE com JSON válido: array de 3 objetos {"titulo":"...","descricao":"..."}. titulo ≤ 40 chars, descricao ≤ 100 chars. Nenhum texto fora do JSON.

${JSON.stringify(summary)}`;
}

function loadCache(hash: string): AISuggestion[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry;
    if (entry.hash === hash && Date.now() - entry.ts < CACHE_TTL && entry.items.length > 0) {
      return entry.items;
    }
  } catch { /* ignore bad cache */ }
  return null;
}

function saveCache(hash: string, items: AISuggestion[]): void {
  const entry: CacheEntry = { hash, ts: Date.now(), items };
  localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
}

export function useGeminiSuggestions(data: AppData) {
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [fromAI, setFromAI] = useState(false);

  const fetchSuggestions = useCallback(
    (ignoreCache = false) => {
      if (!isGeminiAvailable()) return;
      if (Object.values(data).flat().length === 0) return;

      const hash = dataHash(data);

      if (!ignoreCache) {
        const cached = loadCache(hash);
        if (cached) {
          setAiSuggestions(cached);
          setFromAI(true);
          return;
        }
      }

      setLoading(true);
      generateText(buildPrompt(data))
        .then((text) => {
          const cleaned = text.replace(/```json?\n?|```/g, '').trim();
          const parsed = JSON.parse(cleaned) as AISuggestion[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAiSuggestions(parsed);
            setFromAI(true);
            saveCache(hash, parsed);
          }
        })
        .catch(() => { /* silencioso — UI usa fallback */ })
        .finally(() => setLoading(false));
    },
    [data],
  );

  // Executa só na montagem — cache cuida da stale data
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchSuggestions(); }, []);

  const refresh = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    setAiSuggestions([]);
    setFromAI(false);
    fetchSuggestions(true);
  }, [fetchSuggestions]);

  return { aiSuggestions, loading, fromAI, refresh };
}
