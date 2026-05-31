import React, { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { PageHeader, Modal } from '../components/PageHeader';
import { Card } from '../components/Card';
import { FilterSelect } from '../components/FilterSelect';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { Dumbbell } from 'lucide-react';
import { MusculoItem } from '../types';
import { SortableGrid, SortableItem } from '../components/SortableGrid';

export function Musculos() {
  const { data, addItem, updateItem, deleteItem, toggleComplete, reorderItems } = useAppData();
  const [search, setSearch] = useState('');
  const [completedFilter, setCompletedFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MusculoItem | null>(null);

  const debouncedSearch = useDebouncedValue(search, 200);
  const hasActiveFilters = completedFilter !== '';

  const filteredItems = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return data.musculos.filter((item) => {
      if (q) {
        const matches =
          item.musculo.toLowerCase().includes(q) ||
          item.objetivo.toLowerCase().includes(q) ||
          item.exercicio.toLowerCase().includes(q) ||
          item.observacao.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (completedFilter === 'pendente' && item.completed) return false;
      if (completedFilter === 'concluido' && !item.completed) return false;
      return true;
    });
  }, [data.musculos, debouncedSearch, completedFilter]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemData = {
      musculo: formData.get('musculo') as string,
      objetivo: formData.get('objetivo') as string,
      exercicio: formData.get('exercicio') as string,
      frequenciaSemanal: formData.get('frequenciaSemanal') as string,
      observacao: formData.get('observacao') as string,
    };

    if (editingItem) {
      updateItem('musculos', editingItem.id, itemData);
    } else {
      addItem('musculos', {
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
        title="Músculos"
        description="Acompanhamento visual da sua evolução muscular. Defina objetivos por grupo muscular e exercícios chave."
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

      <SortableGrid
        ids={filteredItems.map((i) => i.id)}
        onReorder={(from, to) => reorderItems('musculos', from, to)}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        disabled={hasActiveFilters || !!debouncedSearch}
      >
        {filteredItems.map((item) => (
          <SortableItem id={item.id} key={item.id}>
          <Card
            title={item.musculo}
            subtitle={item.objetivo}
            completed={item.completed}
            onToggle={() => toggleComplete('musculos', item.id)}
            onDelete={() => deleteItem('musculos', item.id)}
            onEdit={() => {
              setEditingItem(item);
              setIsModalOpen(true);
            }}
            icon={<Dumbbell />}
            footer={`Frequência: ${item.frequenciaSemanal}`}
          >
            <div className="space-y-4">
              <div className="rounded bg-gray-50 p-4">
                <h4 className="mb-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                  Exercício Recomendado
                </h4>
                <p className="text-sm font-bold text-gray-900">
                  {item.exercicio}
                </p>
              </div>
              {item.observacao && (
                <p className="text-xs font-medium text-gray-500 italic">
                  &ldquo;{item.observacao}&rdquo;
                </p>
              )}
            </div>
          </Card>
          </SortableItem>
        ))}
      </SortableGrid>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Grupo Muscular">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="musculo-musculo"
                className="text-xs font-bold tracking-widest text-gray-400 uppercase"
              >
                Músculo
              </label>
              <input
                id="musculo-musculo"
                name="musculo"
                required
                defaultValue={editingItem?.musculo}
                className="w-full rounded border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white"
                placeholder="Ex: Peito, Costas..."
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="musculo-objetivo"
                className="text-xs font-bold tracking-widest text-gray-400 uppercase"
              >
                Objetivo
              </label>
              <input
                id="musculo-objetivo"
                name="objetivo"
                required
                defaultValue={editingItem?.objetivo}
                className="w-full rounded border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white"
                placeholder="Ex: Definição, Volume..."
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="musculo-exercicio"
                className="text-xs font-bold tracking-widest text-gray-400 uppercase"
              >
                Exercício Principal
              </label>
              <input
                id="musculo-exercicio"
                name="exercicio"
                required
                defaultValue={editingItem?.exercicio}
                className="w-full rounded border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="musculo-frequenciaSemanal"
                className="text-xs font-bold tracking-widest text-gray-400 uppercase"
              >
                Freq. Semanal
              </label>
              <input
                id="musculo-frequenciaSemanal"
                name="frequenciaSemanal"
                required
                defaultValue={editingItem?.frequenciaSemanal}
                className="w-full rounded border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white"
                placeholder="Ex: 2x"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="musculo-observacao"
              className="text-xs font-bold tracking-widest text-gray-400 uppercase"
            >
              Observação
            </label>
            <textarea
              id="musculo-observacao"
              name="observacao"
              defaultValue={editingItem?.observacao}
              className="min-h-[80px] w-full rounded border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white"
            />
          </div>
          <button className="w-full rounded bg-gray-900 py-4 font-black tracking-widest text-white uppercase">
            Salvar
          </button>
        </form>
      </Modal>
    </div>
  );
}
