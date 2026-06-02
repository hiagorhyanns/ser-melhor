import React, { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { PageHeader, Modal } from '../components/PageHeader';
import { Card } from '../components/Card';
import { FilterSelect } from '../components/FilterSelect';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import {
  Store,
  MapPin,
  Phone,
  MessageCircle,
  Instagram,
  Globe,
  ShoppingBag,
  Link as LinkIcon,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Loja } from '../types';
import { SortableGrid, SortableItem } from '../components/SortableGrid';

// ── Helpers de contato ──────────────────────────────────────
const digits = (v?: string) => (v || '').replace(/\D/g, '');
const withBR = (v?: string) => {
  const d = digits(v);
  if (!d) return '';
  return d.startsWith('55') ? d : `55${d}`;
};
const telHref = (v?: string) => (withBR(v) ? `tel:+${withBR(v)}` : '');
const waHref = (v?: string) => (withBR(v) ? `https://wa.me/${withBR(v)}` : '');
const igHref = (v?: string) => {
  if (!v) return '';
  if (/^https?:\/\//i.test(v)) return v;
  return `https://instagram.com/${v.replace(/^@/, '').trim()}`;
};
const urlHref = (v?: string) => {
  if (!v || v === 'Não encontrado') return '';
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
};
const mapsHref = (l: Loja) => {
  const q = [l.nome, l.endereco, l.bairro, l.cidade].filter(Boolean).join(', ');
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : '';
};
const logoUrl = (site?: string) => {
  if (!site) return '';
  const domain = site.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').replace(/^www\./i, '').trim();
  return domain ? `https://www.google.com/s2/favicons?sz=128&domain=${domain}` : '';
};
const igLabel = (v?: string) => {
  if (!v) return '';
  if (/^https?:\/\//i.test(v)) {
    const m = v.replace(/\/$/, '').match(/instagram\.com\/([^/?]+)/i);
    return m ? `@${m[1]}` : v;
  }
  return `@${v.replace(/^@/, '')}`;
};

const STATUS_BADGE: Record<Loja['status'], string> = {
  visitar: 'bg-indigo-100 text-indigo-700',
  'ver depois': 'bg-gray-100 text-gray-600',
  comprar: 'bg-green-100 text-green-700',
  favorita: 'bg-amber-100 text-amber-700',
};

const GUIDE_LOJAS = [
  {
    label: 'QUANDO COMPRAR',
    titulo: 'Melhores Épocas',
    texto:
      'Janeiro: queima de estoque pós-natal (50-70% off). Julho: fim da coleção inverno. Black Friday: foco em roupas de qualidade — desconto real é acima de 30%.',
  },
  {
    label: 'NEGOCIAÇÃO',
    titulo: 'Desconto na Hora',
    texto:
      'À vista ou débito: peça 10-15% off. Compra do terno completo: negocie ajuste grátis. Vendedores têm meta — fim de mês é melhor para negociar. Seja educado.',
  },
  {
    label: 'AJUSTE',
    titulo: 'Sempre Experimente',
    texto:
      'Nunca compre sem provar. Marque ajuste na hora — bainha, manga, lateral. Custo R$20-60. Uma roupa ajustada parece o triplo do preço. Ajuste é investimento.',
  },
];

// Linha de contato clicável dentro do card
function ContactRow({
  icon: Icon,
  href,
  children,
  external = true,
}: {
  icon: React.ElementType;
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      onClick={(e) => e.stopPropagation()}
      className="flex items-center gap-2.5 text-sm text-gray-600 transition-colors hover:text-gray-900"
    >
      <Icon className="h-4 w-4 shrink-0 text-gray-400" />
      <span className="truncate">{children}</span>
    </a>
  );
}

const inputCls =
  'w-full rounded border border-transparent bg-gray-50 p-3 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white';
const labelCls = 'text-xs font-bold tracking-widest text-gray-400 uppercase';

export function Lojas() {
  const { data, addItem, updateItem, deleteItem, toggleComplete, reorderItems } = useAppData();
  const [search, setSearch] = useState('');
  const [completedFilter, setCompletedFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cidadeFilter, setCidadeFilter] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Loja | null>(null);

  const debouncedSearch = useDebouncedValue(search, 200);
  const hasActiveFilters =
    completedFilter !== '' || statusFilter !== '' || cidadeFilter !== '' || categoriaFilter !== '';

  // Opções dinâmicas a partir dos dados cadastrados
  const cidadeOptions = useMemo(() => {
    const set = new Set<string>();
    data.lojas.forEach((l) => l.cidade && set.add(l.cidade));
    return [...set].sort().map((c) => ({ value: c, label: c }));
  }, [data.lojas]);

  const categoriaOptions = useMemo(() => {
    const set = new Set<string>();
    data.lojas.forEach((l) => l.categoria && set.add(l.categoria));
    return [...set].sort().map((c) => ({ value: c, label: c }));
  }, [data.lojas]);

  const filteredItems = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return data.lojas.filter((item) => {
      if (q) {
        const haystack = [
          item.nome,
          item.categoria,
          item.observacao,
          item.faixaPreco,
          item.cidade,
          item.bairro,
          item.local,
          item.endereco,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (completedFilter === 'pendente' && item.completed) return false;
      if (completedFilter === 'concluido' && !item.completed) return false;
      if (statusFilter && item.status !== statusFilter) return false;
      if (cidadeFilter && item.cidade !== cidadeFilter) return false;
      if (categoriaFilter && item.categoria !== categoriaFilter) return false;
      return true;
    });
  }, [data.lojas, debouncedSearch, completedFilter, statusFilter, cidadeFilter, categoriaFilter]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const str = (k: string) => (f.get(k) as string)?.trim() || '';
    const itemData = {
      nome: str('nome'),
      categoria: str('categoria') || 'Ternos',
      status: f.get('status') as Loja['status'],
      faixaPreco: str('faixaPreco'),
      cidade: str('cidade'),
      bairro: str('bairro'),
      local: str('local'),
      endereco: str('endereco'),
      telefone: str('telefone'),
      whatsapp: str('whatsapp'),
      instagram: str('instagram'),
      site: str('site'),
      ecommerce: str('ecommerce'),
      fonte: str('fonte'),
      observacao: str('observacao'),
      link: str('site') || str('ecommerce'), // legado
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

  const openNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  return (
    <div>
      <PageHeader
        onAdd={openNew}
        searchValue={search}
        onSearchChange={setSearch}
        hasActiveFilters={hasActiveFilters}
        filterPanel={
          <div className="flex flex-wrap gap-4">
            <FilterSelect
              label="Cidade"
              value={cidadeFilter}
              onChange={setCidadeFilter}
              options={cidadeOptions}
              allLabel="Todas"
            />
            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'visitar', label: 'Visitar' },
                { value: 'ver depois', label: 'Ver depois' },
                { value: 'comprar', label: 'Comprar' },
                { value: 'favorita', label: 'Favorita' },
              ]}
            />
            <FilterSelect
              label="Categoria"
              value={categoriaFilter}
              onChange={setCategoriaFilter}
              options={categoriaOptions}
            />
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
          {GUIDE_LOJAS.map((card) => (
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
        onReorder={(from, to) => reorderItems('lojas', from, to)}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        disabled={hasActiveFilters || !!debouncedSearch}
      >
        {filteredItems.map((item) => (
          <SortableItem id={item.id} key={item.id}>
            <Card
              title={item.nome}
              subtitle={[item.local, item.bairro].filter(Boolean).join(' • ') || item.categoria}
              completed={item.completed}
              onToggle={() => toggleComplete('lojas', item.id)}
              onDelete={() => deleteItem('lojas', item.id)}
              onEdit={() => {
                setEditingItem(item);
                setIsModalOpen(true);
              }}
              icon={<Store />}
              iconImage={logoUrl(item.site)}
              footer={
                <div className="flex w-full items-center justify-between gap-2">
                  <span
                    className={cn(
                      'rounded-md px-2 py-1 text-[10px] font-bold tracking-wider uppercase',
                      STATUS_BADGE[item.status],
                    )}
                  >
                    {item.status}
                  </span>
                  {item.cidade && <span className="normal-case">{item.cidade}</span>}
                </div>
              }
            >
              <div className="space-y-2">
                <ContactRow icon={MapPin} href={mapsHref(item)}>
                  {item.endereco || [item.bairro, item.cidade].filter(Boolean).join(', ') || 'Ver no mapa'}
                </ContactRow>
                <ContactRow icon={Phone} href={telHref(item.telefone)} external={false}>
                  {item.telefone}
                </ContactRow>
                <ContactRow icon={MessageCircle} href={waHref(item.whatsapp)}>
                  WhatsApp{item.whatsapp ? `: ${item.whatsapp}` : ''}
                </ContactRow>
                <ContactRow icon={Instagram} href={igHref(item.instagram)}>
                  {igLabel(item.instagram)}
                </ContactRow>
                <ContactRow icon={Globe} href={urlHref(item.site)}>
                  {item.site}
                </ContactRow>
                <ContactRow icon={ShoppingBag} href={urlHref(item.ecommerce)}>
                  Loja online
                </ContactRow>
              </div>

              {item.observacao && (
                <div className="rounded bg-gray-50 p-3">
                  <p className="text-xs leading-relaxed text-gray-600">{item.observacao}</p>
                </div>
              )}

              {item.fonte && (
                <ContactRow icon={LinkIcon} href={urlHref(item.fonte)}>
                  Fonte do dado
                </ContactRow>
              )}
            </Card>
          </SortableItem>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full rounded border border-dashed border-gray-200 bg-white py-20 text-center">
            <p className="font-medium text-gray-400 italic">Nenhuma loja encontrada.</p>
          </div>
        )}
      </SortableGrid>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Editar Loja' : 'Nova Loja'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="loja-nome" className={labelCls}>
              Nome da Loja
            </label>
            <input id="loja-nome" name="nome" required defaultValue={editingItem?.nome} className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="loja-categoria" className={labelCls}>
                Categoria
              </label>
              <input
                id="loja-categoria"
                name="categoria"
                defaultValue={editingItem?.categoria || 'Ternos'}
                className={inputCls}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="loja-status" className={labelCls}>
                Status
              </label>
              <select
                id="loja-status"
                name="status"
                defaultValue={editingItem?.status || 'visitar'}
                className={inputCls}
              >
                <option value="visitar">Visitar</option>
                <option value="ver depois">Ver depois</option>
                <option value="comprar">Comprar</option>
                <option value="favorita">Favorita</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="loja-cidade" className={labelCls}>
                Cidade
              </label>
              <input id="loja-cidade" name="cidade" defaultValue={editingItem?.cidade} className={inputCls} />
            </div>
            <div className="space-y-2">
              <label htmlFor="loja-bairro" className={labelCls}>
                Bairro
              </label>
              <input id="loja-bairro" name="bairro" defaultValue={editingItem?.bairro} className={inputCls} />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="loja-local" className={labelCls}>
              Shopping / Galeria / Rua
            </label>
            <input id="loja-local" name="local" defaultValue={editingItem?.local} className={inputCls} />
          </div>

          <div className="space-y-2">
            <label htmlFor="loja-endereco" className={labelCls}>
              Endereço Completo
            </label>
            <input id="loja-endereco" name="endereco" defaultValue={editingItem?.endereco} className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="loja-telefone" className={labelCls}>
                Telefone
              </label>
              <input id="loja-telefone" name="telefone" defaultValue={editingItem?.telefone} className={inputCls} />
            </div>
            <div className="space-y-2">
              <label htmlFor="loja-whatsapp" className={labelCls}>
                WhatsApp
              </label>
              <input id="loja-whatsapp" name="whatsapp" defaultValue={editingItem?.whatsapp} className={inputCls} />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="loja-instagram" className={labelCls}>
              Instagram (@perfil ou link)
            </label>
            <input id="loja-instagram" name="instagram" defaultValue={editingItem?.instagram} className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="loja-site" className={labelCls}>
                Site
              </label>
              <input id="loja-site" name="site" defaultValue={editingItem?.site} className={inputCls} />
            </div>
            <div className="space-y-2">
              <label htmlFor="loja-ecommerce" className={labelCls}>
                E-commerce
              </label>
              <input id="loja-ecommerce" name="ecommerce" defaultValue={editingItem?.ecommerce} className={inputCls} />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="loja-fonte" className={labelCls}>
              Fonte do Dado (link)
            </label>
            <input id="loja-fonte" name="fonte" defaultValue={editingItem?.fonte} className={inputCls} />
          </div>

          <div className="space-y-2">
            <label htmlFor="loja-observacao" className={labelCls}>
              Observação
            </label>
            <textarea
              id="loja-observacao"
              name="observacao"
              defaultValue={editingItem?.observacao}
              className={cn(inputCls, 'min-h-[80px]')}
            />
          </div>

          <button className="w-full rounded bg-gray-900 py-4 font-black tracking-widest text-white uppercase shadow-xl shadow-gray-200">
            Salvar
          </button>
        </form>
      </Modal>
    </div>
  );
}
