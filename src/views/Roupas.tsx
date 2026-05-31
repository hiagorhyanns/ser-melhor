import React, { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { PageHeader, Modal } from '../components/PageHeader';
import { Card } from '../components/Card';
import { FilterSelect } from '../components/FilterSelect';
import { ImageUpload } from '../components/ImageUpload';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { Shirt } from 'lucide-react';
import { cn } from '../lib/utils';
import { Roupa } from '../types';
import { SortableGrid, SortableItem } from '../components/SortableGrid';

export function Roupas() {
  const { data, addItem, updateItem, deleteItem, toggleComplete, reorderItems } = useAppData();
  const [search, setSearch] = useState('');
  const [completedFilter, setCompletedFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Roupa | null>(null);
  const [foto, setFoto] = useState<string | undefined>(undefined);

  const debouncedSearch = useDebouncedValue(search, 200);
  const hasActiveFilters = completedFilter !== '' || statusFilter !== '' || categoriaFilter !== '';

  const filteredItems = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return data.roupas.filter((item) => {
      if (q) {
        const matches =
          item.nome.toLowerCase().includes(q) ||
          item.categoria.toLowerCase().includes(q) ||
          item.cor.toLowerCase().includes(q) ||
          item.ocasiao.toLowerCase().includes(q) ||
          item.combinacoes.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (completedFilter === 'pendente' && item.completed) return false;
      if (completedFilter === 'concluido' && !item.completed) return false;
      if (statusFilter && item.status !== statusFilter) return false;
      if (categoriaFilter && item.categoria !== categoriaFilter) return false;
      return true;
    });
  }, [data.roupas, debouncedSearch, completedFilter, statusFilter, categoriaFilter]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemData = {
      nome: formData.get('nome') as string,
      categoria: formData.get('categoria') as string,
      cor: formData.get('cor') as string,
      ocasiao: formData.get('ocasiao') as string,
      combinacoes: formData.get('combinacoes') as string,
      status: formData.get('status') as Roupa['status'],
      foto,
    };

    if (editingItem) {
      updateItem('roupas', editingItem.id, itemData);
    } else {
      addItem('roupas', {
        id: crypto.randomUUID(),
        completed: false,
        createdAt: Date.now(),
        ...itemData,
      });
    }

    setIsModalOpen(false);
    setEditingItem(null);
    setFoto(undefined);
  };

  return (
    <div>
      <PageHeader
        title="Roupas"
        description="Organize seu guarda-roupa por categorias. Identifique o que você tem, o que precisa comprar ou substituir."
        onAdd={() => {
          setEditingItem(null);
          setFoto(undefined);
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
                { value: 'tenho', label: 'Tenho' },
                { value: 'comprar', label: 'Comprar' },
                { value: 'substituir', label: 'Substituir' },
              ]}
            />
            <FilterSelect
              label="Categoria"
              value={categoriaFilter}
              onChange={setCategoriaFilter}
              options={[
                { value: 'Camisetas', label: 'Camisetas' },
                { value: 'Camisas', label: 'Camisas' },
                { value: 'Calças', label: 'Calças' },
                { value: 'Bermudas', label: 'Bermudas' },
                { value: 'Jaquetas', label: 'Jaquetas' },
                { value: 'Tênis', label: 'Tênis' },
                { value: 'Sapatos', label: 'Sapatos' },
                { value: 'Acessórios', label: 'Acessórios' },
              ]}
            />
          </div>
        }
      />

      <SortableGrid
        ids={filteredItems.map((i) => i.id)}
        onReorder={(from, to) => reorderItems('roupas', from, to)}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        disabled={hasActiveFilters || !!debouncedSearch}
      >
        {filteredItems.map((item) => (
          <SortableItem id={item.id} key={item.id}>
          <Card
            title={item.nome}
            subtitle={`${item.categoria} • ${item.cor}`}
            completed={item.completed}
            onToggle={() => toggleComplete('roupas', item.id)}
            onDelete={() => deleteItem('roupas', item.id)}
            onEdit={() => {
              setEditingItem(item);
              setFoto(item.foto);
              setIsModalOpen(true);
            }}
            icon={<Shirt />}
            footer={
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'rounded-md px-2 py-1 text-[10px] font-bold tracking-wider uppercase',
                    item.status === 'tenho'
                      ? 'bg-emerald-100 text-emerald-700'
                      : item.status === 'comprar'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-amber-100 text-amber-700',
                  )}
                >
                  {item.status}
                </span>
                <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                  {item.ocasiao}
                </span>
              </div>
            }
          >
            {item.foto && (
              <img
                src={item.foto}
                alt={item.nome}
                className="mb-3 h-36 w-full rounded object-cover"
              />
            )}
            <div className="rounded bg-gray-50 p-3">
              <h4 className="mb-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                Combinações
              </h4>
              <p className="text-xs font-medium text-gray-600">
                {item.combinacoes || 'Nenhuma combinação sugerida.'}
              </p>
            </div>
          </Card>
          </SortableItem>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full rounded border border-dashed border-gray-200 bg-white py-20 text-center">
            <p className="font-medium text-gray-400 italic">Nenhuma peça cadastrada.</p>
          </div>
        )}
      </SortableGrid>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Peça">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="roupa-nome"
              className="text-xs font-bold tracking-widest text-gray-400 uppercase"
            >
              Nome da Peça
            </label>
            <input
              id="roupa-nome"
              name="nome"
              required
              defaultValue={editingItem?.nome}
              className="w-full rounded border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white"
              placeholder="Ex: Camiseta Branca Básica"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="roupa-categoria"
                className="text-xs font-bold tracking-widest text-gray-400 uppercase"
              >
                Categoria
              </label>
              <select
                id="roupa-categoria"
                name="categoria"
                defaultValue={editingItem?.categoria || 'Camisetas'}
                className="w-full rounded border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white"
              >
                <option>Camisetas</option>
                <option>Camisas</option>
                <option>Calças</option>
                <option>Bermudas</option>
                <option>Jaquetas</option>
                <option>Tênis</option>
                <option>Sapatos</option>
                <option>Acessórios</option>
              </select>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="roupa-cor"
                className="text-xs font-bold tracking-widest text-gray-400 uppercase"
              >
                Cor
              </label>
              <input
                id="roupa-cor"
                name="cor"
                required
                defaultValue={editingItem?.cor}
                className="w-full rounded border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="roupa-ocasiao"
              className="text-xs font-bold tracking-widest text-gray-400 uppercase"
            >
              Ocasião de Uso
            </label>
            <input
              id="roupa-ocasiao"
              name="ocasiao"
              defaultValue={editingItem?.ocasiao}
              className="w-full rounded border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white"
              placeholder="Ex: Casual, Trabalho, Noite..."
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="roupa-status"
              className="text-xs font-bold tracking-widest text-gray-400 uppercase"
            >
              Status
            </label>
            <select
              id="roupa-status"
              name="status"
              defaultValue={editingItem?.status || 'tenho'}
              className="w-full rounded border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white"
            >
              <option value="tenho">Tenho</option>
              <option value="comprar">Comprar</option>
              <option value="substituir">Substituir</option>
            </select>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="roupa-combinacoes"
              className="text-xs font-bold tracking-widest text-gray-400 uppercase"
            >
              Combinações Recomendadas
            </label>
            <textarea
              id="roupa-combinacoes"
              name="combinacoes"
              defaultValue={editingItem?.combinacoes}
              className="min-h-[80px] w-full rounded border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white"
            />
          </div>
          <ImageUpload value={foto} onChange={setFoto} label="Foto da Peça" />
          <button className="w-full rounded bg-gray-900 py-4 font-black tracking-widest text-white uppercase">
            Salvar
          </button>
        </form>
      </Modal>
    </div>
  );
}
