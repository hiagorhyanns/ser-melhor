import { createContext, useContext, useEffect, useState } from 'react';
import type { AppData, BaseItem } from '../types';
import { SEED_LOJAS, SEED_ROUPAS, SEED_PRODUTOS } from '../data/seed';

const STORAGE_KEY = 'vestir_melhor_data';

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
};

type AppDataContextValue = {
  data: AppData;
  addItem: <K extends keyof AppData>(key: K, item: AppData[K][number]) => void;
  updateItem: <K extends keyof AppData>(
    key: K,
    id: string,
    updates: Partial<AppData[K][number]>,
  ) => void;
  deleteItem: <K extends keyof AppData>(key: K, id: string) => void;
  toggleComplete: <K extends keyof AppData>(key: K, id: string) => void;
  reorderItems: <K extends keyof AppData>(key: K, activeId: string, overId: string) => void;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AppData;
        // Backfill: se uma coleção semeada estiver vazia no localStorage
        // (ex.: visita antiga antes do seed), preenche com o seed do código.
        // Não sobrescreve dados existentes do usuário.
        return {
          ...parsed,
          lojas: parsed.lojas?.length ? parsed.lojas : INITIAL_DATA.lojas,
          roupas: parsed.roupas?.length ? parsed.roupas : INITIAL_DATA.roupas,
          produtos: parsed.produtos?.length ? parsed.produtos : INITIAL_DATA.produtos,
        };
      } catch {
        return INITIAL_DATA;
      }
    }
    return INITIAL_DATA;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  function addItem<K extends keyof AppData>(key: K, item: AppData[K][number]) {
    setData((prev) => ({ ...prev, [key]: [item, ...prev[key]] }));
  }

  function updateItem<K extends keyof AppData>(
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

  function deleteItem<K extends keyof AppData>(key: K, id: string) {
    setData((prev) => ({
      ...prev,
      [key]: (prev[key] as BaseItem[]).filter((item) => item.id !== id) as AppData[K],
    }));
  }

  function reorderItems<K extends keyof AppData>(key: K, activeId: string, overId: string) {
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

  function toggleComplete<K extends keyof AppData>(key: K, id: string) {
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
    <AppDataContext.Provider value={{ data, addItem, updateItem, deleteItem, toggleComplete, reorderItems }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used inside <AppDataProvider>');
  return ctx;
}
