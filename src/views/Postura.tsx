import React, { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { PageHeader, Modal } from '../components/PageHeader';
import { Card } from '../components/Card';
import { FilterSelect } from '../components/FilterSelect';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { Accessibility } from 'lucide-react';
import { PosturaItem } from '../types';
import { SortableGrid, SortableItem } from '../components/SortableGrid';

const GUIDE_POSTURA = [
  {
    label: 'OS 3 PILARES',
    titulo: 'Fundamentos',
    texto:
      'Ombros para trás e para baixo. Peito ligeiramente para frente. Olhos no horizonte — queixo nivelado. Mantenha esses 3 e a postura corrige naturalmente.',
  },
  {
    label: 'EXERCÍCIO CHAVE',
    titulo: 'Dead Hang Diário',
    texto:
      '30-60 segundos pendurado na barra por dia. Descomprime toda a coluna. Abre os ombros. Melhora a postura em semanas. Um dos exercícios mais subestimados.',
  },
  {
    label: 'VISUAL',
    titulo: 'Impacto na Aparência',
    texto:
      'Postura ereta cria ilusão de 3-5 cm a mais. Ombros abertos ampliam o tórax. A roupa cai melhor em um corpo ereto. Transmite confiança e presença instantânea.',
  },
  {
    label: 'ROTINA',
    titulo: '30 Dias Para Mudar',
    texto:
      'Manhã: 2 min de abertura de tórax. Alarme a cada 2h para checar postura. Noite: 1 min de hip flexor stretch. Consistência de 30 dias cria o hábito permanente.',
  },
];

export function Postura() {
  const { data, addItem, updateItem, deleteItem, toggleComplete, reorderItems } = useAppData();
  const [search, setSearch] = useState('');
  const [completedFilter, setCompletedFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PosturaItem | null>(null);

  const debouncedSearch = useDebouncedValue(search, 200);
  const hasActiveFilters = completedFilter !== '';

  const filteredItems = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return data.postura.filter((item) => {
      if (q) {
        const matches =
          item.titulo.toLowerCase().includes(q) || item.descricao.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (completedFilter === 'pendente' && item.completed) return false;
      if (completedFilter === 'concluido' && !item.completed) return false;
      return true;
    });
  }, [data.postura, debouncedSearch, completedFilter]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemData = {
      titulo: formData.get('titulo') as string,
      descricao: formData.get('descricao') as string,
    };

    if (editingItem) {
      updateItem('postura', editingItem.id, itemData);
    } else {
      addItem('postura', {
        id: crypto.randomUUID(),
        completed: false,
        createdAt: Date.now(),
        ...itemData,
      });
    }

    setIsModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div>
      <PageHeader
        onAdd={() => {
          setEditingItem(null);
          setIsModalOpen(true);
        }}
        searchValue={search}
        onSearchChange={setSearch}
        hasActiveFilters={hasActiveFilters}
        filterPanel={
          <div className="flex flex-wrap gap-4">
            <FilterSelect
              label="Conclusão"
              value={completedFilter}
              onChange={setCompletedFilter}
              options={[
                { value: 'pendente', label: 'Pendente' },
                { value: 'concluido', label: 'Concluído' },
              ]}
            />
          </div>
        }
      />

      {/* ── Guia ── */}
      <div className="-mx-4 mb-6 overflow-x-auto px-4 md:mx-0 md:px-0">
        <div className="flex gap-3 pb-1" style={{ width: 'max-content' }}>
          {GUIDE_POSTURA.map((card) => (
            <div key={card.titulo} className="w-56 shrink-0 rounded border border-zinc-100 bg-white p-4 shadow-sm">
              <p className="mb-1 text-[9px] font-bold tracking-widest text-zinc-400 uppercase">{card.label}</p>
              <p className="mb-1.5 text-sm font-bold text-[#0C2E2D]">{card.titulo}</p>
              <p className="text-xs leading-relaxed text-zinc-500">{card.texto}</p>
            </div>
          ))}
        </div>
      </div>

      <SortableGrid
        ids={filteredItems.map((i) => i.id)}
        onReorder={(from, to) => reorderItems('postura', from, to)}
        className="grid gap-6 md:grid-cols-2"
        disabled={hasActiveFilters || !!debouncedSearch}
      >
        {filteredItems.map((item) => (
          <SortableItem id={item.id} key={item.id}>
          <Card
            title={item.titulo}
            completed={item.completed}
            onToggle={() => toggleComplete('postura', item.id)}
            onDelete={() => deleteItem('postura', item.id)}
            onEdit={() => {
              setEditingItem(item);
              setIsModalOpen(true);
            }}
            icon={<Accessibility />}
          >
            <p className="text-sm leading-relaxed text-gray-600">
              {item.descricao}
            </p>
          </Card>
          </SortableItem>
        ))}
      </SortableGrid>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova Orientação de Postura"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="postura-titulo"
              className="text-xs font-bold tracking-widest text-gray-400 uppercase"
            >
              Título
            </label>
            <input
              id="postura-titulo"
              name="titulo"
              required
              defaultValue={editingItem?.titulo}
              className="w-full rounded border border-transparent bg-gray-50 p-4 font-medium text-[#0C2E2D] transition-all outline-none focus:border-[#0C2E2D] focus:bg-white"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="postura-descricao"
              className="text-xs font-bold tracking-widest text-gray-400 uppercase"
            >
              Descrição/Dica
            </label>
            <textarea
              id="postura-descricao"
              name="descricao"
              required
              defaultValue={editingItem?.descricao}
              className="min-h-[100px] w-full rounded border border-transparent bg-gray-50 p-4 font-medium text-[#0C2E2D] transition-all outline-none focus:border-[#0C2E2D] focus:bg-white"
            />
          </div>
          <button className="w-full rounded bg-[#0C2E2D] py-4 font-black tracking-widest text-white uppercase">
            Salvar
          </button>
        </form>
      </Modal>
    </div>
  );
}
