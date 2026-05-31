import { useEffect, useState, useCallback } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'vestir_melhor_theme';

/**
 * Retorna o tema salvo no localStorage; se nao houver, infere a partir de
 * prefers-color-scheme. Light por padrao se nada disso estiver disponivel.
 */
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';

  const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (saved === 'light' || saved === 'dark') return saved;

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

/**
 * Hook de tema. Aplica/remove a classe `dark` no <html> e persiste a escolha.
 *
 * Uso:
 *   const { theme, toggle, setTheme } = useTheme();
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  // Sincroniza a classe `dark` no <html> e persiste no localStorage.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
  }, []);

  const toggle = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, setTheme, toggle };
}
