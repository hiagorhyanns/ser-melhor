import React, { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { PageHeader, Modal } from '../components/PageHeader';
import { Card } from '../components/Card';
import { FilterSelect } from '../components/FilterSelect';
import { ImageUpload } from '../components/ImageUpload';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import {
  Store,
  MapPin,
  Phone,
  MessageCircle,
  Instagram,
  Globe,
  ShoppingBag,
  Plus,
  Settings,
  X,
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
const normName = (n?: string) => (n || '').trim().toLowerCase();
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
      className="flex items-center gap-2.5 text-sm text-gray-600 transition-colors hover:text-[#0C2E2D]"
    >
      <Icon className="h-4 w-4 shrink-0 text-gray-400" />
      <span className="truncate">{children}</span>
    </a>
  );
}

const inputCls =
  'w-full rounded border border-transparent bg-gray-50 p-3 font-medium text-[#0C2E2D] transition-all outline-none focus:border-[#0C2E2D] focus:bg-white';
const labelCls = 'text-xs font-bold tracking-widest text-gray-400 uppercase';

export function Lojas() {
  const { data, addItem, updateItem, deleteItem, toggleComplete, reorderItems, patchRoot } =
    useAppData();
  const [search, setSearch] = useState('');
  const [completedFilter, setCompletedFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cidadeFilter, setCidadeFilter] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Loja | null>(null);
  const [logo, setLogo] = useState<string | undefined>(undefined);

  const customCats = data.lojaCategorias ?? [];
  const [activeTab, setActiveTab] = useState('lojas');
  const [addCatOpen, setAddCatOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [newCat, setNewCat] = useState('');
  const [presetCategoria, setPresetCategoria] = useState('');

  const isBoard = activeTab === 'lojas' || customCats.includes(activeTab);

  // Logo a exibir: própria → biblioteca por nome → favicon do site
  const resolveLogo = (item: Loja) =>
    item.logo || data.lojaLogos?.[normName(item.nome)] || logoUrl(item.site);

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

  // Itens do mural ativo: "lojas" = todas; categoria custom = filtra por categoria
  const boardLojas =
    activeTab === 'lojas' ? filteredItems : filteredItems.filter((l) => l.categoria === activeTab);

  const createCategory = () => {
    const name = newCat.trim();
    if (!name) return;
    if (!customCats.includes(name)) patchRoot({ lojaCategorias: [...customCats, name] });
    setActiveTab(name);
    setNewCat('');
    setAddCatOpen(false);
  };

  const removeCategory = (cat: string) => {
    patchRoot({ lojaCategorias: customCats.filter((c) => c !== cat) });
    if (activeTab === cat) setActiveTab('lojas');
  };

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
      logo,
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

    // Guarda a logo na biblioteca por nome → reutiliza em outras lojas iguais
    if (logo && itemData.nome) {
      patchRoot({ lojaLogos: { ...(data.lojaLogos ?? {}), [normName(itemData.nome)]: logo } });
    }

    setIsModalOpen(false);
    setEditingItem(null);
    setLogo(undefined);
  };

  const openNew = () => {
    setEditingItem(null);
    setLogo(undefined);
    setPresetCategoria(customCats.includes(activeTab) ? activeTab : '');
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

      {/* Abas + ações (Lojas / Dicas / categorias) */}
      <div className="mb-6 flex items-center justify-between border-b border-zinc-200">
        <div className="flex gap-0 overflow-x-auto">
          {[
            { id: 'lojas', label: 'Lojas' },
            { id: 'dicas', label: 'Dicas' },
            ...customCats.map((c) => ({ id: c, label: c })),
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'border-[#0C2E2D] text-[#0C2E2D]'
                  : 'border-transparent text-zinc-400 hover:text-zinc-700',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-1 pl-2">
          <button
            type="button"
            onClick={() => setAddCatOpen(true)}
            aria-label="Criar categoria"
            title="Criar nova categoria"
            className="flex h-8 w-8 items-center justify-center rounded border border-zinc-200 text-zinc-500 transition-colors hover:border-[#0C2E2D] hover:text-[#0C2E2D]"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setConfigOpen(true)}
            aria-label="Configurar categorias"
            title="Configurar abas"
            className="flex h-8 w-8 items-center justify-center rounded text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Aba DICAS ── */}
      {activeTab === 'dicas' && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {GUIDE_LOJAS.map((card) => (
            <div key={card.titulo} className="rounded bg-white p-4 transition-shadow hover:shadow-md">
              <p className="mb-1 text-[9px] font-bold tracking-widest text-zinc-400 uppercase">{card.label}</p>
              <p className="mb-1.5 text-sm font-bold text-[#0C2E2D]">{card.titulo}</p>
              <p className="text-xs leading-relaxed text-zinc-500">{card.texto}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Aba LOJAS / categoria personalizada ── */}
      {isBoard && (
      <SortableGrid
        ids={boardLojas.map((i) => i.id)}
        onReorder={(from, to) => reorderItems('lojas', from, to)}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        disabled={hasActiveFilters || !!debouncedSearch || activeTab !== 'lojas'}
      >
        {boardLojas.map((item) => (
          <SortableItem id={item.id} key={item.id}>
            <Card
              title={item.nome}
              subtitle={[item.local, item.bairro].filter(Boolean).join(' • ') || item.categoria}
              completed={item.completed}
              onToggle={() => toggleComplete('lojas', item.id)}
              onDelete={() => deleteItem('lojas', item.id)}
              onEdit={() => {
                setEditingItem(item);
                setLogo(item.logo);
                setIsModalOpen(true);
              }}
              icon={<Store />}
              iconImage={resolveLogo(item)}
              topBar={
                <>
                  {item.cidade && (
                    <span className="truncate text-xs font-bold tracking-wider text-gray-400 uppercase">
                      {item.cidade}
                    </span>
                  )}
                  <span
                    className={cn(
                      'shrink-0 rounded-md px-2 py-1 text-[10px] font-bold tracking-wider uppercase',
                      STATUS_BADGE[item.status],
                    )}
                  >
                    {item.status}
                  </span>
                </>
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
            </Card>
          </SortableItem>
        ))}

        {boardLojas.length === 0 && (
          <div className="col-span-full rounded border border-dashed border-gray-200 bg-white py-20 text-center">
            <p className="font-medium text-gray-400 italic">Nenhuma loja encontrada.</p>
          </div>
        )}
      </SortableGrid>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Editar Loja' : 'Nova Loja'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <ImageUpload value={logo} onChange={setLogo} label="Logo da loja" />
          <p className="-mt-2 text-xs text-gray-400">
            A logo fica salva e é reutilizada em outras lojas com o mesmo nome.
          </p>

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
                defaultValue={editingItem?.categoria || presetCategoria || 'Ternos'}
                className={inputCls}
                list="loja-categorias"
              />
              <datalist id="loja-categorias">
                {customCats.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
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

          <button className="w-full rounded bg-[#0C2E2D] py-4 font-black tracking-widest text-white uppercase shadow-xl shadow-gray-200">
            Salvar
          </button>
        </form>
      </Modal>

      {/* ── MODAL: nova categoria ── */}
      <Modal isOpen={addCatOpen} onClose={() => setAddCatOpen(false)} title="Nova Categoria">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Cria uma nova aba. As lojas com essa categoria aparecem nela.
          </p>
          <input
            autoFocus
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createCategory()}
            className={inputCls}
            placeholder="Ex: Sapatos, Perfumes, Online..."
          />
          <button
            type="button"
            onClick={createCategory}
            className="w-full rounded bg-[#0C2E2D] py-3 font-black tracking-widest text-white uppercase"
          >
            Criar
          </button>
        </div>
      </Modal>

      {/* ── MODAL: configurar categorias ── */}
      <Modal isOpen={configOpen} onClose={() => setConfigOpen(false)} title="Configurar Categorias">
        <div className="space-y-3">
          {customCats.length === 0 ? (
            <p className="text-sm text-gray-400 italic">
              Nenhuma categoria personalizada. Use o + para criar.
            </p>
          ) : (
            customCats.map((cat) => (
              <div
                key={cat}
                className="flex items-center justify-between rounded border border-gray-100 bg-gray-50 px-4 py-3"
              >
                <span className="font-medium text-[#103E3C]">{cat}</span>
                <button
                  type="button"
                  onClick={() => removeCategory(cat)}
                  aria-label={`Excluir ${cat}`}
                  className="flex items-center gap-1 rounded px-2 py-1 text-xs font-bold text-red-500 transition-colors hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                  Excluir
                </button>
              </div>
            ))
          )}
          <p className="pt-1 text-xs text-gray-400">Excluir a aba não apaga as lojas.</p>
        </div>
      </Modal>
    </div>
  );
}
