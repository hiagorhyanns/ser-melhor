import React, { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { PageHeader, Modal } from '../components/PageHeader';
import { Card } from '../components/Card';
import { FilterSelect } from '../components/FilterSelect';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { CheckSquare, Square, Scissors } from 'lucide-react';
import { cn } from '../lib/utils';
import { BarbaItem } from '../types';
import { SortableGrid, SortableItem } from '../components/SortableGrid';

const GUIDE_BARBA = [
  {
    label: 'ESTILOS',
    titulo: 'Barba Cerrada',
    texto:
      'Cobre boa parte do rosto. Exige contorno 2x/semana e hidratação diária para manter o traço limpo. O estilo mais versátil do momento.',
  },
  {
    label: 'FORMATO DO ROSTO',
    titulo: 'Qual Barba Combina',
    texto:
      'Oval: qualquer estilo. Quadrado: barba arredondada suaviza o ângulo. Alongado: barba larga encurta. Redondo: barba angular e delineada define.',
  },
  {
    label: 'PRODUTOS',
    titulo: 'Kit Essencial',
    texto:
      'Aparador elétrico para o corpo. Navalha para o contorno. Óleo de barba para hidratar. Balm para controle. Nessa ordem, nesse ritual.',
  },
  {
    label: 'MANUTENÇÃO',
    titulo: 'Rotina Semanal',
    texto:
      'Lavar 3x/semana com shampoo específico. Hidratar com óleo após o banho (barba úmida absorve melhor). Aparar contorno a cada 3 dias.',
  },
];

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
          {GUIDE_BARBA.map((card) => (
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
              <div className="rounded bg-gray-50 p-4">
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
                        <Square className="h-5 w-5 text-gray-300 group-hover:text-[#0C2E2D]" />
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
                <p className="text-sm font-medium text-gray-600">
                  {item.produtos || 'Nenhum produto cadastrado.'}
                </p>
              </div>
            </div>
          </Card>
          </SortableItem>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full rounded border border-dashed border-gray-200 bg-white py-20 text-center">
            <p className="font-medium text-gray-400 italic">Nenhum estilo de barba cadastrado.</p>
          </div>
        )}
      </SortableGrid>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Cuidados com a Barba"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="barba-estilo"
              className="text-xs font-bold tracking-widest text-gray-400 uppercase"
            >
              Estilo Desejado
            </label>
            <input
              id="barba-estilo"
              name="estilo"
              required
              defaultValue={editingItem?.estilo}
              className="w-full rounded border border-transparent bg-gray-50 p-4 font-medium text-[#0C2E2D] transition-all outline-none focus:border-[#0C2E2D] focus:bg-white"
              placeholder="Ex: Barba Cerrada, Viking..."
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="barba-frequencia"
              className="text-xs font-bold tracking-widest text-gray-400 uppercase"
            >
              Frequência de Manutenção
            </label>
            <input
              id="barba-frequencia"
              name="frequencia"
              required
              defaultValue={editingItem?.frequencia}
              className="w-full rounded border border-transparent bg-gray-50 p-4 font-medium text-[#0C2E2D] transition-all outline-none focus:border-[#0C2E2D] focus:bg-white"
              placeholder="Ex: Semanal, a cada 15 dias..."
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="barba-produtos"
              className="text-xs font-bold tracking-widest text-gray-400 uppercase"
            >
              Produtos Usados
            </label>
            <input
              id="barba-produtos"
              name="produtos"
              defaultValue={editingItem?.produtos}
              className="w-full rounded border border-transparent bg-gray-50 p-4 font-medium text-[#0C2E2D] transition-all outline-none focus:border-[#0C2E2D] focus:bg-white"
              placeholder="Óleo, Balm, Shampoo..."
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="barba-observacoes"
              className="text-xs font-bold tracking-widest text-gray-400 uppercase"
            >
              Observações
            </label>
            <textarea
              id="barba-observacoes"
              name="observacoes"
              defaultValue={editingItem?.observacoes}
              className="min-h-[80px] w-full rounded border border-transparent bg-gray-50 p-4 font-medium text-[#0C2E2D] transition-all outline-none focus:border-[#0C2E2D] focus:bg-white"
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
