import React, { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { PageHeader, Modal } from '../components/PageHeader';
import { Card } from '../components/Card';
import { FilterSelect } from '../components/FilterSelect';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { Package, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { Produto } from '../types';
import { SortableGrid, SortableItem } from '../components/SortableGrid';

export function Produtos() {
  const { data, addItem, updateItem, deleteItem, toggleComplete, reorderItems } = useAppData();
  const [search, setSearch] = useState('');
  const [completedFilter, setCompletedFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Produto | null>(null);

  const debouncedSearch = useDebouncedValue(search, 200);
  const hasActiveFilters = completedFilter !== '' || statusFilter !== '';

  const filteredItems = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return data.produtos.filter((item) => {
      if (q) {
        const matches =
          item.nome.toLowerCase().includes(q) ||
          item.categoria.toLowerCase().includes(q) ||
          item.marca.toLowerCase().includes(q) ||
          item.frequenciaUso.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (completedFilter === 'pendente' && item.completed) return false;
      if (completedFilter === 'concluido' && !item.completed) return false;
      if (statusFilter && item.status !== statusFilter) return false;
      return true;
    });
  }, [data.produtos, debouncedSearch, completedFilter, statusFilter]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemData = {
      nome: formData.get('nome') as string,
      categoria: formData.get('categoria') as string,
      marca: formData.get('marca') as string,
      frequenciaUso: formData.get('frequenciaUso') as string,
      nota: Number(formData.get('nota')),
      status: formData.get('status') as Produto['status'],
    };

    if (editingItem) {
      updateItem('produtos', editingItem.id, itemData);
    } else {
      addItem('produtos', {
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
        title="Produtos"
        description="Cadastre seus produtos de cuidado pessoal. Perfumes, hidratantes, pomadas e protetores solares em um só lugar."
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
            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'uso diário', label: 'Uso Diário' },
                { value: 'testar', label: 'Testar' },
                { value: 'comprar', label: 'Comprar' },
              ]}
            />
          </div>
        }
      />

      <SortableGrid
        ids={filteredItems.map((i) => i.id)}
        onReorder={(from, to) => reorderItems('produtos', from, to)}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        disabled={hasActiveFilters || !!debouncedSearch}
      >
        {filteredItems.map((item) => (
          <SortableItem id={item.id} key={item.id}>
          <Card
            title={item.nome}
            subtitle={`${item.marca} • ${item.categoria}`}
            completed={item.completed}
            onToggle={() => toggleComplete('produtos', item.id)}
            onDelete={() => deleteItem('produtos', item.id)}
            onEdit={() => {
              setEditingItem(item);
              setIsModalOpen(true);
            }}
            icon={<Package />}
            footer={
              <div className="flex items-center gap-4">
                <span
                  className={cn(
                    'rounded-md px-2 py-1 text-[10px] font-bold tracking-wider uppercase',
                    item.status === 'uso diário'
                      ? 'bg-emerald-100 text-emerald-700'
                      : item.status === 'testar'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-600',
                  )}
                >
                  {item.status}
                </span>
                <div className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs text-gray-900">{item.nota}</span>
                </div>
              </div>
            }
          >
            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase">
              Frequência: <span className="text-gray-900">{item.frequenciaUso}</span>
            </p>
          </Card>
          </SortableItem>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full rounded border border-dashed border-gray-200 bg-white py-20 text-center">
            <p className="font-medium text-gray-400 italic">Nenhum produto cadastrado.</p>
          </div>
        )}
      </SortableGrid>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Produto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="produto-nome"
              className="text-xs font-bold tracking-widest text-gray-400 uppercase"
            >
              Nome do Produto
            </label>
            <input
              id="produto-nome"
              name="nome"
              required
              defaultValue={editingItem?.nome}
              className="w-full rounded border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="produto-marca"
                className="text-xs font-bold tracking-widest text-gray-400 uppercase"
              >
                Marca
              </label>
              <input
                id="produto-marca"
                name="marca"
                required
                defaultValue={editingItem?.marca}
                className="w-full rounded border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="produto-categoria"
                className="text-xs font-bold tracking-widest text-gray-400 uppercase"
              >
                Categoria
              </label>
              <input
                id="produto-categoria"
                name="categoria"
                required
                defaultValue={editingItem?.categoria}
                className="w-full rounded border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="produto-frequenciaUso"
                className="text-xs font-bold tracking-widest text-gray-400 uppercase"
              >
                Frequência de Uso
              </label>
              <input
                id="produto-frequenciaUso"
                name="frequenciaUso"
                required
                defaultValue={editingItem?.frequenciaUso}
                className="w-full rounded border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white"
                placeholder="Ex: Diário"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="produto-nota"
                className="text-xs font-bold tracking-widest text-gray-400 uppercase"
              >
                Nota (0-10)
              </label>
              <input
                id="produto-nota"
                name="nota"
                type="number"
                min="0"
                max="10"
                required
                defaultValue={editingItem?.nota || 8}
                className="w-full rounded border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="produto-status"
              className="text-xs font-bold tracking-widest text-gray-400 uppercase"
            >
              Status
            </label>
            <select
              id="produto-status"
              name="status"
              defaultValue={editingItem?.status || 'uso diário'}
              className="w-full rounded border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white"
            >
              <option value="uso diário">Uso Diário</option>
              <option value="testar">Testar</option>
              <option value="comprar">Comprar</option>
            </select>
          </div>
          <button className="w-full rounded bg-gray-900 py-4 font-black tracking-widest text-white uppercase">
            Salvar
          </button>
        </form>
      </Modal>
    </div>
  );
}
