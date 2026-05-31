import { useEffect, useState } from 'react';

/**
 * Retorna uma versao atrasada (debounced) do valor recebido.
 * Util para evitar filtrar/buscar a cada tecla digitada.
 *
 * Uso:
 *   const debounced = useDebouncedValue(search, 200);
 *   const items = list.filter(i => i.nome.includes(debounced));
 */
export function useDebouncedValue<T>(value: T, delayMs = 200): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
