import React, { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { PageHeader, Modal } from '../components/PageHeader';
import { Card } from '../components/Card';
import { FilterSelect } from '../components/FilterSelect';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { Accessibility } from 'lucide-react';
import { PosturaItem } from '../types';
import { SortableGrid, SortableItem } from '../components/SortableGrid';

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
        title="Postura"
        description="Melhore sua presença visual através da postura. Siga as orientações e marque como concluído ao praticar."
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
              className="w-full rounded border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white"
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
              className="min-h-[100px] w-full rounded border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white"
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
