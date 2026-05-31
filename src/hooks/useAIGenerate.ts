import { useCallback, useState } from 'react';
import { generateTextStream, isGeminiAvailable } from '../lib/gemini';

type State = { result: string; loading: boolean; error: boolean };

const INIT: State = { result: '', loading: false, error: false };

/**
 * Hook genérico para chamadas ao Gemini com streaming.
 * `result` cresce chunk a chunk — ideal para exibição progressiva no modal.
 * Não faz cache — cada chamada vai direto à API.
 */
export function useAIGenerate() {
  const [state, setState] = useState<State>(INIT);

  const generate = useCallback((prompt: string) => {
    setState({ result: '', loading: true, error: false });
    generateTextStream(prompt, (chunk) => {
      setState((prev) => ({ ...prev, result: prev.result + chunk }));
    })
      .then(() => setState((prev) => ({ ...prev, loading: false })))
      .catch(() => setState({ result: '', loading: false, error: true }));
  }, []);

  const reset = useCallback(() => setState(INIT), []);

  return { ...state, generate, reset, available: isGeminiAvailable() };
}
