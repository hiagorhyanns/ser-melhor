import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { AppData, BaseItem } from '../types';
import { SEED_LOJAS, SEED_ROUPAS, SEED_PRODUTOS } from '../data/seed';
import { supabase, SUPABASE_ENABLED } from '../lib/supabase';

const STORAGE_KEY = 'vestir_melhor_data';
const STATE_ROW_ID = 1;

const INITIAL_DATA: AppData = {
  marcas: [],
  lojas: SEED_LOJAS,
  barba: [],
  cabelo: [],
  produtos: SEED_PRODUTOS,
  roupas: SEED_ROUPAS,
  postura: [
    {
      id: '1',
      titulo: 'Postura ao andar',
      descricao: 'Mantenha o peito aberto e o olhar no horizonte.',
      completed: false,
      createdAt: Date.now(),
    },
    {
      id: '2',
      titulo: 'Postura sentado',
      descricao: 'Costa reta, pés no chão e ombros relaxados.',
      completed: false,
      createdAt: Date.now(),
    },
    {
      id: '3',
      titulo: 'Ombros alinhados',
      descricao: 'Evite rotacionar os ombros para frente.',
      completed: false,
      createdAt: Date.now(),
    },
    {
      id: '4',
      titulo: 'Cabeça erguida',
      descricao: 'Não force o pescoço para baixo ao olhar o celular.',
      completed: false,
      createdAt: Date.now(),
    },
  ],
  musculos: [
    {
      id: '1',
      musculo: 'Peito',
      objetivo: 'Definição',
      exercicio: 'Supino',
      frequenciaSemanal: '2x',
      observacao: '',
      completed: false,
      createdAt: Date.now(),
    },
    {
      id: '2',
      musculo: 'Costas',
      objetivo: 'Largura',
      exercicio: 'Puxada',
      frequenciaSemanal: '2x',
      observacao: '',
      completed: false,
      createdAt: Date.now(),
    },
  ],
  roupaCategorias: [],
  produtoCategorias: [],
  lojaLogos: {},
};

/**
 * Preenche coleções semeadas vazias com o seed do código.
 * Não sobrescreve dados já existentes do usuário.
 */
function backfillSeed(d: AppData): AppData {
  return {
    ...d,
    lojas: d.lojas?.length ? d.lojas : INITIAL_DATA.lojas,
    roupas: d.roupas?.length ? d.roupas : INITIAL_DATA.roupas,
    produtos: d.produtos?.length ? d.produtos : INITIAL_DATA.produtos,
  };
}

function readLocal(): AppData {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return backfillSeed(JSON.parse(saved) as AppData);
    } catch {
      return INITIAL_DATA;
    }
  }
  return INITIAL_DATA;
}

// Apenas as chaves cujo valor é uma lista de itens (exclui categorias/logos).
type CollectionKey = {
  [K in keyof AppData]-?: NonNullable<AppData[K]> extends BaseItem[] ? K : never;
}[keyof AppData];

type AppDataContextValue = {
  data: AppData;
  addItem: <K extends CollectionKey>(key: K, item: AppData[K][number]) => void;
  updateItem: <K extends CollectionKey>(
    key: K,
    id: string,
    updates: Partial<AppData[K][number]>,
  ) => void;
  deleteItem: <K extends CollectionKey>(key: K, id: string) => void;
  toggleComplete: <K extends CollectionKey>(key: K, id: string) => void;
  reorderItems: <K extends CollectionKey>(key: K, activeId: string, overId: string) => void;
  /** Atualiza campos da raiz (ex.: categorias personalizadas, biblioteca de logos). */
  patchRoot: (updates: Partial<AppData>) => void;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  // Estado inicial: localStorage no modo offline; seed enquanto a nuvem carrega.
  const [data, setData] = useState<AppData>(() =>
    SUPABASE_ENABLED ? INITIAL_DATA : readLocal(),
  );

  // Guarda o último JSON sincronizado para evitar eco de realtime e regravações.
  const lastSync = useRef<string>('');
  // Só persiste depois do primeiro carregamento (evita sobrescrever a nuvem com o seed).
  const ready = useRef(!SUPABASE_ENABLED);

  // ── Carga inicial da nuvem + realtime (multi-device) ──
  useEffect(() => {
    if (!SUPABASE_ENABLED || !supabase) return;
    const sb = supabase; // narrowing estável dentro das closures
    let active = true;

    (async () => {
      const { data: row, error } = await sb
        .from('app_state')
        .select('data')
        .eq('id', STATE_ROW_ID)
        .maybeSingle();
      if (!active) return;

      if (error) {
        // Falha de rede/config → cai no localStorage para não travar o app.
        console.error('[Supabase] load falhou, usando localStorage:', error.message);
        setData(readLocal());
        ready.current = true;
        return;
      }

      if (row?.data) {
        const merged = backfillSeed(row.data as AppData);
        lastSync.current = JSON.stringify(merged);
        setData(merged);
      } else {
        // Primeira vez: semeia a nuvem com o seed do código.
        lastSync.current = JSON.stringify(INITIAL_DATA);
        await sb.from('app_state').upsert({ id: STATE_ROW_ID, data: INITIAL_DATA });
        setData(INITIAL_DATA);
      }
      ready.current = true;
    })();

    // Sincroniza mudanças feitas em outros dispositivos em tempo real.
    const channel = sb
      .channel('app_state_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_state' },
        (payload) => {
          const incoming = (payload.new as { data?: AppData } | null)?.data;
          if (!incoming) return;
          const json = JSON.stringify(incoming);
          if (json === lastSync.current) return; // eco da própria gravação
          lastSync.current = json;
          setData(incoming);
        },
      )
      .subscribe();

    return () => {
      active = false;
      sb.removeChannel(channel);
    };
  }, []);

  // ── Persistência (debounced) ──
  useEffect(() => {
    if (!ready.current) return;
    const json = JSON.stringify(data);
    if (json === lastSync.current) return;
    lastSync.current = json;

    if (SUPABASE_ENABLED && supabase) {
      const t = setTimeout(() => {
        supabase!
          .from('app_state')
          .upsert({ id: STATE_ROW_ID, data, updated_at: new Date().toISOString() })
          .then(({ error }) => {
            if (error) console.error('[Supabase] save falhou:', error.message);
          });
      }, 400);
      return () => clearTimeout(t);
    }

    localStorage.setItem(STORAGE_KEY, json);
  }, [data]);

  function addItem<K extends CollectionKey>(key: K, item: AppData[K][number]) {
    setData((prev) => ({ ...prev, [key]: [item, ...prev[key]] }));
  }

  function updateItem<K extends CollectionKey>(
    key: K,
    id: string,
    updates: Partial<AppData[K][number]>,
  ) {
    setData((prev) => ({
      ...prev,
      [key]: (prev[key] as BaseItem[]).map((item) =>
        item.id === id ? { ...item, ...updates } : item,
      ) as AppData[K],
    }));
  }

  function deleteItem<K extends CollectionKey>(key: K, id: string) {
    setData((prev) => ({
      ...prev,
      [key]: (prev[key] as BaseItem[]).filter((item) => item.id !== id) as AppData[K],
    }));
  }

  function reorderItems<K extends CollectionKey>(key: K, activeId: string, overId: string) {
    setData((prev) => {
      const items = [...(prev[key] as BaseItem[])];
      const fromIdx = items.findIndex((i) => i.id === activeId);
      const toIdx = items.findIndex((i) => i.id === overId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const [moved] = items.splice(fromIdx, 1);
      items.splice(toIdx, 0, moved);
      return { ...prev, [key]: items as AppData[K] };
    });
  }

  function patchRoot(updates: Partial<AppData>) {
    setData((prev) => ({ ...prev, ...updates }));
  }

  function toggleComplete<K extends CollectionKey>(key: K, id: string) {
    setData((prev) => {
      const items = [...(prev[key] as BaseItem[])];
      const index = items.findIndex((i) => i.id === id);
      if (index === -1) return prev;

      const item = { ...items[index], completed: !items[index].completed };
      items.splice(index, 1);

      // Concluído → fim da lista; desmarcado → início
      if (item.completed) {
        items.push(item);
      } else {
        items.unshift(item);
      }

      return { ...prev, [key]: items as AppData[K] };
    });
  }

  return (
    <AppDataContext.Provider value={{ data, addItem, updateItem, deleteItem, toggleComplete, reorderItems, patchRoot }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used inside <AppDataProvider>');
  return ctx;
}
