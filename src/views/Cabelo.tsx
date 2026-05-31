import React, { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { PageHeader, Modal } from '../components/PageHeader';
import { Card } from '../components/Card';
import { FilterSelect } from '../components/FilterSelect';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useAIGenerate } from '../hooks/useAIGenerate';
import { ImageUpload } from '../components/ImageUpload';
import { User, ImageIcon, Sparkles } from 'lucide-react';
import { CabeloItem } from '../types';
import { SortableGrid, SortableItem } from '../components/SortableGrid';

export function Cabelo() {
  const { data, addItem, updateItem, deleteItem, toggleComplete, reorderItems } = useAppData();
  const [search, setSearch] = useState('');
  const [completedFilter, setCompletedFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CabeloItem | null>(null);
  const [foto, setFoto] = useState<string | undefined>(undefined);

  const debouncedSearch = useDebouncedValue(search, 200);
  const hasActiveFilters = completedFilter !== '';

  const filteredItems = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return data.cabelo.filter((item) => {
      if (q) {
        const matches =
          item.tipoCorte.toLowerCase().includes(q) ||
          item.referencia.toLowerCase().includes(q) ||
          item.frequencia.toLowerCase().includes(q) ||
          item.barbeiro.toLowerCase().includes(q) ||
          item.produtos.toLowerCase().includes(q) ||
          item.observacoes.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (completedFilter === 'pendente' && item.completed) return false;
      if (completedFilter === 'concluido' && !item.completed) return false;
      return true;
    });
  }, [data.cabelo, debouncedSearch, completedFilter]);

  const { result: aiResult, loading: aiLoading, error: aiError, generate: generateAI, reset: resetAI, available: geminiEnabled } = useAIGenerate();
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const handleGeraRotina = (item: CabeloItem) => {
    setIsAIModalOpen(true);
    generateAI(
      `Você é especialista em cuidados capilares masculinos. Crie uma rotina de cuidados para o corte descrito. Responda em português do Brasil com passos numerados (máximo 8). Apenas os passos, sem introdução.\n\nCorte: ${item.tipoCorte}\nFrequência de corte: ${item.frequencia}\nBarbeiro/Local: ${item.barbeiro || 'não definido'}\nProdutos e observações: ${item.observacoes || 'nenhum'}`,
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemData = {
      tipoCorte: formData.get('tipoCorte') as string,
      referencia: formData.get('referencia') as string,
      frequencia: formData.get('frequencia') as string,
      produtos: formData.get('produtos') as string,
      barbeiro: formData.get('barbeiro') as string,
      observacoes: formData.get('observacoes') as string,
      foto,
    };

    if (editingItem) {
      updateItem('cabelo', editingItem.id, itemData);
    } else {
      addItem('cabelo', {
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
        title="Cabelo"
        description="Organize seu corte, estilo e manutenção. Guarde referências visuais e contatos de barbeiros."
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
          </div>
        }
      />

      <SortableGrid
        ids={filteredItems.map((i) => i.id)}
        onReorder={(from, to) => reorderItems('cabelo', from, to)}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        disabled={hasActiveFilters || !!debouncedSearch}
      >
        {filteredItems.map((item) => (
          <SortableItem id={item.id} key={item.id}>
          <Card
            title={item.tipoCorte}
            subtitle={item.frequencia}
            completed={item.completed}
            onToggle={() => toggleComplete('cabelo', item.id)}
            onDelete={() => deleteItem('cabelo', item.id)}
            onEdit={() => {
              setEditingItem(item);
              setFoto(item.foto);
              setIsModalOpen(true);
            }}
            icon={<User />}
            footer={item.barbeiro ? `Barbeiro: ${item.barbeiro}` : 'Manutenção'}
          >
            <div className="space-y-3">
              {item.foto && (
                <img
                  src={item.foto}
                  alt={item.tipoCorte}
                  className="h-36 w-full rounded-xl object-cover"
                />
              )}
              {item.referencia && (
                <div className="flex items-center gap-3 overflow-hidden rounded-xl bg-gray-100 p-3 text-xs font-bold text-gray-500 uppercase dark:bg-gray-800">
                  <ImageIcon className="shrink-0" />
                  <span className="truncate">{item.referencia}</span>
                </div>
              )}
              <p className="text-sm text-gray-600 italic dark:text-gray-300">
                &ldquo;{item.observacoes || 'Sem notas.'}&rdquo;
              </p>
              {geminiEnabled && (
                <button
                  onClick={() => handleGeraRotina(item)}
                  className="flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-600 transition-colors hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/40"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Gerar Rotina com IA
                </button>
              )}
            </div>
          </Card>
          </SortableItem>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full rounded-[32px] border border-dashed border-gray-200 bg-white py-20 text-center">
            <p className="font-medium text-gray-400 italic">
              Cadastre seu estilo de corte para começar.
            </p>
          </div>
        )}
      </SortableGrid>

      {/* Modal IA — Rotina */}
      <Modal
        isOpen={isAIModalOpen}
        onClose={() => { setIsAIModalOpen(false); resetAI(); }}
        title="Rotina Recomendada ✨"
      >
        {aiLoading && (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-500" />
          </div>
        )}
        {aiError && <p className="text-sm text-red-500">Erro ao gerar. Verifique a chave Gemini.</p>}
        {!aiLoading && !aiError && aiResult && (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {aiResult}
          </p>
        )}
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Estilo de Cabelo">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="cabelo-tipoCorte"
              className="text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500"
            >
              Tipo de Corte
            </label>
            <input
              id="cabelo-tipoCorte"
              name="tipoCorte"
              required
              defaultValue={editingItem?.tipoCorte}
              className="w-full rounded-2xl border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-gray-100 dark:focus:bg-gray-900"
              placeholder="Ex: Fade, Side Part, Buzz Cut..."
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="cabelo-referencia"
              className="text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500"
            >
              Referência (Link ou Nome)
            </label>
            <input
              id="cabelo-referencia"
              name="referencia"
              defaultValue={editingItem?.referencia}
              className="w-full rounded-2xl border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-gray-100 dark:focus:bg-gray-900"
              placeholder="Link do Pinterest ou nome da referência"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="cabelo-frequencia"
                className="text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500"
              >
                Frequência
              </label>
              <input
                id="cabelo-frequencia"
                name="frequencia"
                required
                defaultValue={editingItem?.frequencia}
                className="w-full rounded-2xl border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-gray-100 dark:focus:bg-gray-900"
                placeholder="Ex: Mensal"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="cabelo-barbeiro"
                className="text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500"
              >
                Barbeiro/Local
              </label>
              <input
                id="cabelo-barbeiro"
                name="barbeiro"
                defaultValue={editingItem?.barbeiro}
                className="w-full rounded-2xl border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-gray-100 dark:focus:bg-gray-900"
                placeholder="Nome ou Local"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="cabelo-observacoes"
              className="text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500"
            >
              Observações / Produtos
            </label>
            <textarea
              id="cabelo-observacoes"
              name="observacoes"
              defaultValue={editingItem?.observacoes}
              className="min-h-[80px] w-full rounded-2xl border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-gray-100 dark:focus:bg-gray-900"
              placeholder="Shampoo específico, pomada mate..."
            />
          </div>
          <ImageUpload value={foto} onChange={setFoto} label="Foto de Referência" />
          <button className="w-full rounded-2xl bg-gray-900 py-4 font-black tracking-widest text-white uppercase">
            Salvar
          </button>
        </form>
      </Modal>
    </div>
  );
}
