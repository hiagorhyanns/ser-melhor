import React, { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { PageHeader, Modal } from '../components/PageHeader';
import { Card } from '../components/Card';
import { FilterSelect } from '../components/FilterSelect';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { ExternalLink, Tag } from 'lucide-react';
import { cn } from '../lib/utils';
import { Loja } from '../types';
import { SortableGrid, SortableItem } from '../components/SortableGrid';

export function Lojas() {
  const { data, addItem, updateItem, deleteItem, toggleComplete, reorderItems } = useAppData();
  const [search, setSearch] = useState('');
  const [completedFilter, setCompletedFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Loja | null>(null);

  const debouncedSearch = useDebouncedValue(search, 200);
  const hasActiveFilters = completedFilter !== '' || statusFilter !== '';

  const filteredItems = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return data.lojas.filter((item) => {
      if (q) {
        const matches =
          item.nome.toLowerCase().includes(q) ||
          item.categoria.toLowerCase().includes(q) ||
          item.observacao.toLowerCase().includes(q) ||
          item.faixaPreco.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (completedFilter === 'pendente' && item.completed) return false;
      if (completedFilter === 'concluido' && !item.completed) return false;
      if (statusFilter && item.status !== statusFilter) return false;
      return true;
    });
  }, [data.lojas, debouncedSearch, completedFilter, statusFilter]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemData = {
      nome: formData.get('nome') as string,
      link: formData.get('link') as string,
      categoria: formData.get('categoria') as string,
      faixaPreco: formData.get('faixaPreco') as string,
      observacao: formData.get('observacao') as string,
      status: formData.get('status') as Loja['status'],
    };

    if (editingItem) {
      updateItem('lojas', editingItem.id, itemData);
    } else {
      addItem('lojas', {
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
        title="Lojas"
        description="Cadastre lojas físicas ou online. Organize onde comprar suas roupas e acessórios com status de interesse."
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
                { value: 'ver depois', label: 'Ver depois' },
                { value: 'comprar', label: 'Comprar' },
                { value: 'favorita', label: 'Favorita' },
              ]}
            />
          </div>
        }
      />

      <SortableGrid
        ids={filteredItems.map((i) => i.id)}
        onReorder={(from, to) => reorderItems('lojas', from, to)}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        disabled={hasActiveFilters || !!debouncedSearch}
      >
        {filteredItems.map((item) => (
          <SortableItem id={item.id} key={item.id}>
          <Card
            title={item.nome}
            subtitle={item.categoria}
            completed={item.completed}
            onToggle={() => toggleComplete('lojas', item.id)}
            onDelete={() => deleteItem('lojas', item.id)}
            onEdit={() => {
              setEditingItem(item);
              setIsModalOpen(true);
            }}
            footer={
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'rounded-md px-2 py-1 text-[10px] font-bold tracking-wider uppercase',
                    item.status === 'favorita'
                      ? 'bg-amber-100 text-amber-700'
                      : item.status === 'comprar'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600',
                  )}
                >
                  {item.status}
                </span>
                <span className="font-bold text-emerald-600">{item.faixaPreco}</span>
              </div>
            }
            icon={
              item.link ? (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink />
                </a>
              ) : (
                <Tag />
              )
            }
          >
            <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
              {item.observacao || 'Sem observações'}
            </p>
          </Card>
          </SortableItem>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full rounded-[32px] border border-dashed border-gray-200 bg-white py-20 text-center">
            <p className="font-medium text-gray-400 italic">Nenhuma loja encontrada.</p>
          </div>
        )}
      </SortableGrid>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Editar Loja' : 'Nova Loja'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2 md:col-span-1">
              <label
                htmlFor="loja-nome"
                className="text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500"
              >
                Nome
              </label>
              <input
                id="loja-nome"
                name="nome"
                required
                defaultValue={editingItem?.nome}
                className="w-full rounded-2xl border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-gray-100 dark:focus:bg-gray-900"
              />
            </div>
            <div className="col-span-2 space-y-2 md:col-span-1">
              <label
                htmlFor="loja-categoria"
                className="text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500"
              >
                Categoria
              </label>
              <input
                id="loja-categoria"
                name="categoria"
                required
                defaultValue={editingItem?.categoria}
                className="w-full rounded-2xl border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-gray-100 dark:focus:bg-gray-900"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="loja-link"
              className="text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500"
            >
              Link / URL
            </label>
            <input
              id="loja-link"
              name="link"
              defaultValue={editingItem?.link}
              className="w-full rounded-2xl border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-gray-100 dark:focus:bg-gray-900"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="loja-faixaPreco"
                className="text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500"
              >
                Faixa de Preço
              </label>
              <select
                id="loja-faixaPreco"
                name="faixaPreco"
                defaultValue={editingItem?.faixaPreco || '$$'}
                className="w-full rounded-2xl border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-gray-100 dark:focus:bg-gray-900"
              >
                <option>$ (Econômico)</option>
                <option>$$ (Médio)</option>
                <option>$$$ (Premium)</option>
                <option>$$$$ (Luxo)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="loja-status"
                className="text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500"
              >
                Status
              </label>
              <select
                id="loja-status"
                name="status"
                defaultValue={editingItem?.status || 'ver depois'}
                className="w-full rounded-2xl border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-gray-100 dark:focus:bg-gray-900"
              >
                <option value="ver depois">Ver depois</option>
                <option value="comprar">Comprar</option>
                <option value="favorita">Favorita</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="loja-observacao"
              className="text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500"
            >
              Observação
            </label>
            <textarea
              id="loja-observacao"
              name="observacao"
              defaultValue={editingItem?.observacao}
              className="min-h-[80px] w-full rounded-2xl border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-gray-100 dark:focus:bg-gray-900"
            />
          </div>
          <button className="w-full rounded-2xl bg-gray-900 py-4 font-black tracking-widest text-white uppercase shadow-xl shadow-gray-200">
            Salvar
          </button>
        </form>
      </Modal>
    </div>
  );
}
