import React, { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { PageHeader, Modal } from '../components/PageHeader';
import { Card } from '../components/Card';
import { FilterSelect } from '../components/FilterSelect';
import { ImageUpload } from '../components/ImageUpload';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useAIGenerate } from '../hooks/useAIGenerate';
import { Shirt, Sparkles } from 'lucide-react';
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

  const { result: aiResult, loading: aiLoading, error: aiError, generate: generateAI, reset: resetAI, available: geminiEnabled } = useAIGenerate();
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const handleGeraCombinacao = () => {
    const disponiveis = data.roupas
      .filter((r) => r.status === 'tenho')
      .map((r) => ({ nome: r.nome, categoria: r.categoria, cor: r.cor, ocasiao: r.ocasiao }));
    if (disponiveis.length === 0) return;
    setIsAIModalOpen(true);
    generateAI(
      `Você é um estilista pessoal. Sugira 3 combinações de looks completos baseados nas roupas abaixo. Responda SOMENTE com JSON válido: array de 3 objetos com campos "nome" (string), "pecas" (array de strings), "ocasiao" (string). Nenhum texto fora do JSON.\n\nRoupas disponíveis:\n${JSON.stringify(disponiveis)}`,
    );
  };

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

      {geminiEnabled && (
        <div className="mb-6">
          <button
            onClick={handleGeraCombinacao}
            disabled={data.roupas.filter((r) => r.status === 'tenho').length === 0}
            className="flex items-center gap-2 rounded-2xl bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-600 transition-colors hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/40"
          >
            <Sparkles className="h-4 w-4" />
            Gerar Combinação com IA
          </button>
        </div>
      )}

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
                className="mb-3 h-36 w-full rounded-xl object-cover"
              />
            )}
            <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
              <h4 className="mb-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                Combinações
              </h4>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                {item.combinacoes || 'Nenhuma combinação sugerida.'}
              </p>
            </div>
          </Card>
          </SortableItem>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full rounded-[32px] border border-dashed border-gray-200 bg-white py-20 text-center">
            <p className="font-medium text-gray-400 italic">Nenhuma peça cadastrada.</p>
          </div>
        )}
      </SortableGrid>

      {/* Modal IA — Combinações */}
      <Modal
        isOpen={isAIModalOpen}
        onClose={() => { setIsAIModalOpen(false); resetAI(); }}
        title="Combinações Sugeridas ✨"
      >
        {aiLoading && (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-500" />
          </div>
        )}
        {aiError && (
          <p className="text-sm text-red-500">Erro ao gerar. Verifique a chave Gemini.</p>
        )}
        {!aiLoading && !aiError && aiResult && (
          <div className="space-y-3">
            {(() => {
              try {
                const outfits = JSON.parse(aiResult) as { nome: string; pecas: string[]; ocasiao: string }[];
                return outfits.map((outfit, i) => (
                  <div key={i} className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-800">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="font-bold text-gray-900 dark:text-gray-100">{outfit.nome}</h4>
                      <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-indigo-700 uppercase dark:bg-indigo-900/40 dark:text-indigo-400">
                        {outfit.ocasiao}
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {outfit.pecas.map((peca, j) => (
                        <li key={j} className="text-sm text-gray-600 dark:text-gray-300">
                          • {peca}
                        </li>
                      ))}
                    </ul>
                  </div>
                ));
              } catch {
                return (
                  <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                    {aiResult}
                  </p>
                );
              }
            })()}
          </div>
        )}
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Peça">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="roupa-nome"
              className="text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500"
            >
              Nome da Peça
            </label>
            <input
              id="roupa-nome"
              name="nome"
              required
              defaultValue={editingItem?.nome}
              className="w-full rounded-2xl border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-gray-100 dark:focus:bg-gray-900"
              placeholder="Ex: Camiseta Branca Básica"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="roupa-categoria"
                className="text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500"
              >
                Categoria
              </label>
              <select
                id="roupa-categoria"
                name="categoria"
                defaultValue={editingItem?.categoria || 'Camisetas'}
                className="w-full rounded-2xl border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-gray-100 dark:focus:bg-gray-900"
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
                className="text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500"
              >
                Cor
              </label>
              <input
                id="roupa-cor"
                name="cor"
                required
                defaultValue={editingItem?.cor}
                className="w-full rounded-2xl border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-gray-100 dark:focus:bg-gray-900"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="roupa-ocasiao"
              className="text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500"
            >
              Ocasião de Uso
            </label>
            <input
              id="roupa-ocasiao"
              name="ocasiao"
              defaultValue={editingItem?.ocasiao}
              className="w-full rounded-2xl border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-gray-100 dark:focus:bg-gray-900"
              placeholder="Ex: Casual, Trabalho, Noite..."
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="roupa-status"
              className="text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500"
            >
              Status
            </label>
            <select
              id="roupa-status"
              name="status"
              defaultValue={editingItem?.status || 'tenho'}
              className="w-full rounded-2xl border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-gray-100 dark:focus:bg-gray-900"
            >
              <option value="tenho">Tenho</option>
              <option value="comprar">Comprar</option>
              <option value="substituir">Substituir</option>
            </select>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="roupa-combinacoes"
              className="text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500"
            >
              Combinações Recomendadas
            </label>
            <textarea
              id="roupa-combinacoes"
              name="combinacoes"
              defaultValue={editingItem?.combinacoes}
              className="min-h-[80px] w-full rounded-2xl border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-gray-100 dark:focus:bg-gray-900"
            />
          </div>
          <ImageUpload value={foto} onChange={setFoto} label="Foto da Peça" />
          <button className="w-full rounded-2xl bg-gray-900 py-4 font-black tracking-widest text-white uppercase">
            Salvar
          </button>
        </form>
      </Modal>
    </div>
  );
}
