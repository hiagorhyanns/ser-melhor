import React, { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { PageHeader, Modal } from '../components/PageHeader';
import { Card } from '../components/Card';
import { FilterSelect } from '../components/FilterSelect';
import { ImageUpload } from '../components/ImageUpload';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { Heart, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { Marca } from '../types';
import { SortableGrid, SortableItem } from '../components/SortableGrid';

const GUIDE_MARCAS = [
  {
    label: 'FAST FASHION',
    titulo: 'Custo-Benefício',
    texto:
      'Zara, H&M, Renner: tendências atuais a preço acessível. Qualidade média. Ideal para peças de moda — compre, use, substitua. Não invista muito nessas peças.',
  },
  {
    label: 'PREMIUM',
    titulo: 'Quando Vale Pagar Mais',
    texto:
      'Em básicos que duram: camisetas, jeans, sapatos. Aramis, Forum, Lafer têm melhor caimento no corpo brasileiro. Invista em 3-5 peças-âncora de qualidade.',
  },
  {
    label: 'QUALIDADE',
    titulo: 'Sinais Para Identificar',
    texto:
      'Costura reta e firme. Botões bem presos (puxa e não cede). Tecido com peso — não translúcido. Acabamento interno caprichado. Etiqueta com composição do tecido.',
  },
];

export function Marcas() {
  const { data, addItem, updateItem, deleteItem, toggleComplete, reorderItems } = useAppData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [favoritaFilter, setFavoritaFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Marca | null>(null);
  const [foto, setFoto] = useState<string | undefined>(undefined);

  const debouncedSearch = useDebouncedValue(search, 200);
  const hasActiveFilters = statusFilter !== '' || favoritaFilter !== '';

  const filteredItems = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return data.marcas.filter((item) => {
      if (q) {
        const matches =
          item.nome.toLowerCase().includes(q) ||
          item.categoria.toLowerCase().includes(q) ||
          item.observacao.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (statusFilter === 'pendente' && item.completed) return false;
      if (statusFilter === 'concluido' && !item.completed) return false;
      if (favoritaFilter === 'sim' && !item.favorita) return false;
      if (favoritaFilter === 'nao' && item.favorita) return false;
      return true;
    });
  }, [data.marcas, debouncedSearch, statusFilter, favoritaFilter]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemData = {
      nome: formData.get('nome') as string,
      categoria: formData.get('categoria') as string,
      observacao: formData.get('observacao') as string,
      nivelInteresse: Number(formData.get('nivelInteresse')),
      favorita: formData.get('favorita') === 'on',
      foto,
    };

    if (editingItem) {
      updateItem('marcas', editingItem.id, itemData);
    } else {
      addItem('marcas', {
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
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'pendente', label: 'Pendente' },
                { value: 'concluido', label: 'Concluído' },
              ]}
            />
            <FilterSelect
              label="Favoritas"
              value={favoritaFilter}
              onChange={setFavoritaFilter}
              options={[
                { value: 'sim', label: 'Sim' },
                { value: 'nao', label: 'Não' },
              ]}
            />
          </div>
        }
      />

      {/* ── Guia ── */}
      <div className="-mx-4 mb-6 overflow-x-auto px-4 md:mx-0 md:px-0">
        <div className="flex gap-3 pb-1" style={{ width: 'max-content' }}>
          {GUIDE_MARCAS.map((card) => (
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
        onReorder={(from, to) => reorderItems('marcas', from, to)}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        disabled={hasActiveFilters || !!debouncedSearch}
      >
        {filteredItems.map((item) => (
          <SortableItem id={item.id} key={item.id}>
          <Card
            title={item.nome}
            subtitle={item.categoria}
            completed={item.completed}
            onToggle={() => toggleComplete('marcas', item.id)}
            onDelete={() => deleteItem('marcas', item.id)}
            onEdit={() => {
              setEditingItem(item);
              setFoto(item.foto);
              setIsModalOpen(true);
            }}
            footer={
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-3 w-3',
                      i < item.nivelInteresse ? 'fill-amber-400 text-amber-400' : 'text-gray-200',
                    )}
                  />
                ))}
              </div>
            }
            icon={item.favorita ? <Heart className="fill-white" /> : null}
          >
            {item.foto && (
              <img
                src={item.foto}
                alt={item.nome}
                className="mb-3 h-36 w-full rounded object-cover"
              />
            )}
            <p className="line-clamp-3 text-sm leading-relaxed text-gray-600">
              {item.observacao || 'Nenhuma observação adicionada.'}
            </p>
          </Card>
          </SortableItem>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full rounded border border-dashed border-gray-200 bg-white py-20 text-center">
            <p className="font-medium text-gray-400 italic">
              Nenhuma marca encontrada. Comece adicionando uma!
            </p>
          </div>
        )}
      </SortableGrid>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Editar Marca' : 'Nova Marca'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="marca-nome"
              className="text-xs font-bold tracking-widest text-gray-400 uppercase"
            >
              Nome da Marca
            </label>
            <input
              id="marca-nome"
              name="nome"
              required
              defaultValue={editingItem?.nome}
              className="w-full rounded border border-transparent bg-gray-50 p-4 font-medium text-[#0C2E2D] transition-all outline-none focus:border-[#0C2E2D] focus:bg-white"
              placeholder="Ex: Levis, Armani, Channel..."
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="marca-categoria"
              className="text-xs font-bold tracking-widest text-gray-400 uppercase"
            >
              Categoria
            </label>
            <input
              id="marca-categoria"
              name="categoria"
              required
              defaultValue={editingItem?.categoria}
              className="w-full rounded border border-transparent bg-gray-50 p-4 font-medium text-[#0C2E2D] transition-all outline-none focus:border-[#0C2E2D] focus:bg-white"
              placeholder="Ex: Roupas, Calçados, Perfumes..."
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="marca-nivelInteresse"
              className="text-xs font-bold tracking-widest text-gray-400 uppercase"
            >
              Nível de Interesse (1-5)
            </label>
            <input
              id="marca-nivelInteresse"
              name="nivelInteresse"
              type="number"
              min="1"
              max="5"
              required
              defaultValue={editingItem?.nivelInteresse || 3}
              className="w-full rounded border border-transparent bg-gray-50 p-4 font-medium text-[#0C2E2D] transition-all outline-none focus:border-[#0C2E2D] focus:bg-white"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="marca-observacao"
              className="text-xs font-bold tracking-widest text-gray-400 uppercase"
            >
              Observação
            </label>
            <textarea
              id="marca-observacao"
              name="observacao"
              defaultValue={editingItem?.observacao}
              className="min-h-[100px] w-full rounded border border-transparent bg-gray-50 p-4 font-medium text-[#0C2E2D] transition-all outline-none focus:border-[#0C2E2D] focus:bg-white"
              placeholder="Notas sobre qualidade, preço, caimento..."
            />
          </div>
          <ImageUpload value={foto} onChange={setFoto} label="Foto da Marca" />
          <label className="group flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              name="favorita"
              defaultChecked={editingItem?.favorita}
              className="h-5 w-5 cursor-pointer rounded border-2 border-gray-200 transition-all checked:bg-[#0C2E2D]"
            />
            <span className="text-sm font-bold text-gray-600 group-hover:text-[#0C2E2D]">
              Marcar como favorita
            </span>
          </label>
          <button className="w-full rounded bg-[#0C2E2D] py-4 font-black tracking-widest text-white uppercase shadow-xl shadow-gray-200 transition-all hover:bg-[#103E3C]">
            Salvar
          </button>
        </form>
      </Modal>
    </div>
  );
}
