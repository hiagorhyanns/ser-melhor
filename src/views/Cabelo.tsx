import React, { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { PageHeader, Modal } from '../components/PageHeader';
import { Card } from '../components/Card';
import { FilterSelect } from '../components/FilterSelect';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { ImageUpload } from '../components/ImageUpload';
import { User, ImageIcon } from 'lucide-react';
import { CabeloItem } from '../types';
import { SortableGrid, SortableItem } from '../components/SortableGrid';

const GUIDE_CABELO = [
  {
    label: 'CORTES POPULARES',
    titulo: 'Top 5 Masculinos',
    texto:
      'Fade: degradê nas laterais. Side Part: risco lateral clássico. Texturizado: natural e moderno. Buzz Cut: tudo curto. Undercut: topo comprido, laterais raspadas.',
  },
  {
    label: 'COMO PEDIR',
    titulo: 'Fale com o Barbeiro',
    texto:
      'Mostre uma foto de referência. Diga o número do fade (0, 1, 2, 3). Especifique o comprimento do topo em cm. Diga se quer contraste alto ou baixo.',
  },
  {
    label: 'PRODUTOS',
    titulo: 'Por Tipo de Cabelo',
    texto:
      'Fino: spray texturizador. Médio: pomada mate ou clay. Grosso: cera ou pomada brilho. Cacheado: creme leave-in + gel definidor. Menos quantidade, sempre.',
  },
  {
    label: 'FREQUÊNCIA',
    titulo: 'Quando Cortar',
    texto:
      'Fade: a cada 2-3 semanas para manter o degrade limpo. Cortes mais longos: a cada 4-6 semanas. Agende antes do cabelo crescer demais — mais barato manter.',
  },
];

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

      {/* ── Guia ── */}
      <div className="-mx-4 mb-6 overflow-x-auto px-4 md:mx-0 md:px-0">
        <div className="flex gap-3 pb-1" style={{ width: 'max-content' }}>
          {GUIDE_CABELO.map((card) => (
            <div key={card.titulo} className="w-56 shrink-0 rounded border border-zinc-100 bg-white p-4 shadow-sm">
              <p className="mb-1 text-[9px] font-bold tracking-widest text-zinc-400 uppercase">{card.label}</p>
              <p className="mb-1.5 text-sm font-bold text-zinc-900">{card.titulo}</p>
              <p className="text-xs leading-relaxed text-zinc-500">{card.texto}</p>
            </div>
          ))}
        </div>
      </div>

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
                  className="h-36 w-full rounded object-cover"
                />
              )}
              {item.referencia && (
                <div className="flex items-center gap-3 overflow-hidden rounded bg-gray-100 p-3 text-xs font-bold text-gray-500 uppercase">
                  <ImageIcon className="shrink-0" />
                  <span className="truncate">{item.referencia}</span>
                </div>
              )}
              <p className="text-sm text-gray-600 italic">
                &ldquo;{item.observacoes || 'Sem notas.'}&rdquo;
              </p>
            </div>
          </Card>
          </SortableItem>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full rounded border border-dashed border-gray-200 bg-white py-20 text-center">
            <p className="font-medium text-gray-400 italic">
              Cadastre seu estilo de corte para começar.
            </p>
          </div>
        )}
      </SortableGrid>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Estilo de Cabelo">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="cabelo-tipoCorte"
              className="text-xs font-bold tracking-widest text-gray-400 uppercase"
            >
              Tipo de Corte
            </label>
            <input
              id="cabelo-tipoCorte"
              name="tipoCorte"
              required
              defaultValue={editingItem?.tipoCorte}
              className="w-full rounded border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white"
              placeholder="Ex: Fade, Side Part, Buzz Cut..."
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="cabelo-referencia"
              className="text-xs font-bold tracking-widest text-gray-400 uppercase"
            >
              Referência (Link ou Nome)
            </label>
            <input
              id="cabelo-referencia"
              name="referencia"
              defaultValue={editingItem?.referencia}
              className="w-full rounded border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white"
              placeholder="Link do Pinterest ou nome da referência"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="cabelo-frequencia"
                className="text-xs font-bold tracking-widest text-gray-400 uppercase"
              >
                Frequência
              </label>
              <input
                id="cabelo-frequencia"
                name="frequencia"
                required
                defaultValue={editingItem?.frequencia}
                className="w-full rounded border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white"
                placeholder="Ex: Mensal"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="cabelo-barbeiro"
                className="text-xs font-bold tracking-widest text-gray-400 uppercase"
              >
                Barbeiro/Local
              </label>
              <input
                id="cabelo-barbeiro"
                name="barbeiro"
                defaultValue={editingItem?.barbeiro}
                className="w-full rounded border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white"
                placeholder="Nome ou Local"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="cabelo-observacoes"
              className="text-xs font-bold tracking-widest text-gray-400 uppercase"
            >
              Observações / Produtos
            </label>
            <textarea
              id="cabelo-observacoes"
              name="observacoes"
              defaultValue={editingItem?.observacoes}
              className="min-h-[80px] w-full rounded border border-transparent bg-gray-50 p-4 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white"
              placeholder="Shampoo específico, pomada mate..."
            />
          </div>
          <ImageUpload value={foto} onChange={setFoto} label="Foto de Referência" />
          <button className="w-full rounded bg-gray-900 py-4 font-black tracking-widest text-white uppercase">
            Salvar
          </button>
        </form>
      </Modal>
    </div>
  );
}
