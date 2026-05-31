import React, { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { PageHeader, Modal } from '../components/PageHeader';
import { Card } from '../components/Card';
import { FilterSelect } from '../components/FilterSelect';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useAIGenerate } from '../hooks/useAIGenerate';
import { CheckSquare, Square, Scissors, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { BarbaItem } from '../types';
import { SortableGrid, SortableItem } from '../components/SortableGrid';

export function Barba() {
  const { data, addItem, updateItem, deleteItem, toggleComplete, reorderItems } = useAppData();
  const [search, setSearch] = useState('');
  const [completedFilter, setCompletedFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BarbaItem | null>(null);

  const debouncedSearch = useDebouncedValue(search, 200);
  const hasActiveFilters = completedFilter !== '';

  const filteredItems = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return data.barba.filter((item) => {
      if (q) {
        const matches =
          item.estilo.toLowerCase().includes(q) ||
          item.frequencia.toLowerCase().includes(q) ||
          item.produtos.toLowerCase().includes(q) ||
          item.observacoes.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (completedFilter === 'pendente' && item.completed) return false;
      if (completedFilter === 'concluido' && !item.completed) return false;
      return true;
    });
  }, [data.barba, debouncedSearch, completedFilter]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemData = {
      estilo: formData.get('estilo') as string,
      frequencia: formData.get('frequencia') as string,
      produtos: formData.get('produtos') as string,
      observacoes: formData.get('observacoes') as string,
      checklist: editingItem?.checklist || [
        { text: 'Lavar', done: false },
        { text: 'Hidratar', done: false },
        { text: 'Alinhar', done: false },
        { text: 'Aparar pescoço', done: false },
        { text: 'Desenhar contorno', done: false },
      ],
    };

    if (editingItem) {
      updateItem('barba', editingItem.id, itemData);
    } else {
      addItem('barba', {
        id: crypto.randomUUID(),
        completed: false,
        createdAt: Date.now(),
        ...itemData,
      });
    }

    setIsModalOpen(false);
    setEditingItem(null);
  };

  const { result: aiResult, loading: aiLoading, error: aiError, generate: generateAI, reset: resetAI, available: geminiEnabled } = useAIGenerate();
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const handleGeraRotina = (item: BarbaItem) => {
    setIsAIModalOpen(true);
    generateAI(
      `Você é especialista em grooming masculino. Crie uma rotina de cuidados para o estilo de barba descrito. Responda em português do Brasil com passos numerados (máximo 8). Apenas os passos, sem introdução.\n\nEstilo: ${item.estilo}\nFrequência: ${item.frequencia}\nProdutos: ${item.produtos || 'a definir'}\nObservações: ${item.observacoes || 'nenhuma'}`,
    );
  };

  const toggleChecklist = (itemId: string, index: number) => {
    const item = data.barba.find((b) => b.id === itemId);
    if (!item) return;
    const newChecklist = [...item.checklist];
    newChecklist[index].done = !newChecklist[index].done;
    updateItem('barba', itemId, { checklist: newChecklist });
  };

  return (
    <div>
      <PageHeader
        title="Barba"
        description="Rotina de cuidados com a barba. Mantenha o estilo e a manutenção em dia com checklists práticos."
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
        onReorder={(from, to) => reorderItems('barba', from, to)}
        className="grid gap-8 md:grid-cols-2"
        disabled={hasActiveFilters || !!debouncedSearch}
      >
        {filteredItems.map((item) => (
          <SortableItem id={item.id} key={item.id}>
          <Card
            title={item.estilo}
            subtitle={item.frequencia}
            completed={item.completed}
            onToggle={() => toggleComplete('barba', item.id)}
            onDelete={() => deleteItem('barba', item.id)}
            onEdit={() => {
              setEditingItem(item);
              setIsModalOpen(true);
            }}
            icon={<Scissors />}
          >
            <div className="space-y-4">
              <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-800">
                <h4 className="mb-3 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                  Checklist de Rotina
                </h4>
                <div className="space-y-2">
                  {item.checklist.map((check, idx) => (
                    <button
                      key={idx}
                      onClick={() => toggleChecklist(item.id, idx)}
                      className="group flex w-full items-center gap-3 text-sm"
                    >
                      {check.done ? (
                        <CheckSquare className="h-5 w-5 text-green-500" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-300 group-hover:text-gray-900" />
                      )}
                      <span
                        className={cn(
                          'font-medium',
                          check.done ? 'text-gray-400 line-through' : 'text-gray-700',
                        )}
                      >
                        {check.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="mb-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                  Produtos Úteis
                </h4>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {item.produtos || 'Nenhum produto cadastrado.'}
                </p>
              </div>
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
            <p className="font-medium text-gray-400 italic">Nenhum estilo de barba cadastrado.</p>
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Cuidados com a Barba"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="barba-estilo"
              className="text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500"
            >
              Estilo Desejado
            </label>
            <input
              id="barba-estilo"
              name="estilo"
              required
              defaultValue={editingItem?.estilo}
              className="w-full rounded-2xl border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-gray-100 dark:focus:bg-gray-900"
              placeholder="Ex: Barba Cerrada, Viking..."
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="barba-frequencia"
              className="text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500"
            >
              Frequência de Manutenção
            </label>
            <input
              id="barba-frequencia"
              name="frequencia"
              required
              defaultValue={editingItem?.frequencia}
              className="w-full rounded-2xl border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-gray-100 dark:focus:bg-gray-900"
              placeholder="Ex: Semanal, a cada 15 dias..."
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="barba-produtos"
              className="text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500"
            >
              Produtos Usados
            </label>
            <input
              id="barba-produtos"
              name="produtos"
              defaultValue={editingItem?.produtos}
              className="w-full rounded-2xl border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-gray-100 dark:focus:bg-gray-900"
              placeholder="Óleo, Balm, Shampoo..."
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="barba-observacoes"
              className="text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500"
            >
              Observações
            </label>
            <textarea
              id="barba-observacoes"
              name="observacoes"
              defaultValue={editingItem?.observacoes}
              className="min-h-[80px] w-full rounded-2xl border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-gray-100 dark:focus:bg-gray-900"
            />
          </div>
          <button className="w-full rounded-2xl bg-gray-900 py-4 font-black tracking-widest text-white uppercase">
            Salvar
          </button>
        </form>
      </Modal>
    </div>
  );
}
