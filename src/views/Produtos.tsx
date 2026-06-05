import React, { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { PageHeader, Modal } from '../components/PageHeader';
import { ImageUpload } from '../components/ImageUpload';
import { FilterSelect } from '../components/FilterSelect';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { ImageIcon, Pencil, Trash2, Star, Plus, Settings, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Produto } from '../types';

// ── Conteúdo dos guias (somente texto) ──
const GUIDE: Record<string, { titulo: string; blocos: string[] }> = {
  skincare: {
    titulo: 'Rotina de Skincare',
    blocos: [
      'Menos é mais — 5 produtos resolvem 95% das necessidades. O segredo é a constância, não a quantidade.',
      'Manhã: sabonete facial + hidratante com FPS (protetor solar é inegociável). Noite: sabonete + hidratante simples para recuperar a pele enquanto você dorme.',
      '1x por semana: esfoliante para renovar a pele e desobstruir os poros. Pele limpa e hidratada é a base de qualquer presença visual.',
    ],
  },
  perfume: {
    titulo: 'Como Usar Perfume',
    blocos: [
      'Aplique nos pontos de calor: pulsos, pescoço e atrás das orelhas. O calor do corpo difunde a fragrância ao longo do dia.',
      'Nunca esfregue os pulsos depois de aplicar — o atrito quebra as moléculas e encurta a duração. Borrife e deixe secar naturalmente.',
      'Eau de Parfum dura de 6 a 8 horas; Eau de Toilette, menos. Aromas frescos e cítricos de dia; amadeirados e intensos à noite.',
    ],
  },
  cabelo: {
    titulo: 'Produto por Resultado',
    blocos: [
      'Escolha o produto pelo acabamento que você quer, não pela marca. Comece sempre com pouca quantidade — dá para adicionar, não dá para tirar.',
      'Brilho forte: gel ou pomada brilhosa. Brilho suave: clay ou pasta. Sem brilho (efeito natural): pomada matte.',
      'Volume: mousse aplicado no cabelo úmido. Cachos definidos: creme leave-in + fixador leve. Finalize sempre com o cabelo quase seco.',
    ],
  },
  prioridade: {
    titulo: 'O Que Vale Comprar',
    blocos: [
      'Comece pelo essencial e construa aos poucos. Não precisa de prateleira cheia para estar bem cuidado.',
      'Ordem de prioridade: 1) Protetor solar diário (obrigatório). 2) Hidratante facial. 3) Sabonete específico para o rosto. 4) Um bom perfume — alto impacto na percepção.',
      'Sérum, ácidos e tônicos são passos avançados: só entram depois que o básico já virou hábito. Invista no que você usa todo dia.',
    ],
  },
};

const TABS = [
  { id: 'referencias', label: 'Referências' },
  { id: 'skincare', label: 'Skincare' },
  { id: 'perfume', label: 'Perfume' },
  { id: 'cabelo', label: 'Cabelo' },
  { id: 'prioridade', label: 'Prioridade' },
];

const STATUS_BADGE: Record<Produto['status'], string> = {
  'uso diário': 'bg-emerald-100 text-emerald-700',
  testar: 'bg-indigo-100 text-indigo-700',
  comprar: 'bg-gray-100 text-gray-600',
};

const inputCls =
  'w-full rounded border border-transparent bg-gray-50 p-3 font-medium text-gray-900 transition-all outline-none focus:border-gray-900 focus:bg-white';
const labelCls = 'text-xs font-bold tracking-widest text-gray-400 uppercase';

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className={labelCls}>{label}</p>
      <p className="mt-0.5 text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}

export function Produtos() {
  const { data, addItem, updateItem, deleteItem, patchRoot } = useAppData();
  const customCats = data.produtoCategorias ?? [];
  const [activeTab, setActiveTab] = useState('referencias');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Produto | null>(null);
  const [foto, setFoto] = useState<string | undefined>(undefined);
  const [presetCategoria, setPresetCategoria] = useState('');

  const [viewItem, setViewItem] = useState<Produto | null>(null);

  const [addCatOpen, setAddCatOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [newCat, setNewCat] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const hasActiveFilters = statusFilter !== '' || categoriaFilter !== '';

  const categoriaOptions = useMemo(() => {
    const set = new Set<string>();
    data.produtos.forEach((p) => p.categoria && set.add(p.categoria));
    return [...set].sort().map((c) => ({ value: c, label: c }));
  }, [data.produtos]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return data.produtos.filter((p) => {
      if (q) {
        const hay = [p.nome, p.marca, p.categoria, p.frequenciaUso]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (statusFilter && p.status !== statusFilter) return false;
      if (categoriaFilter && p.categoria !== categoriaFilter) return false;
      return true;
    });
  }, [data.produtos, debouncedSearch, statusFilter, categoriaFilter]);

  const isBoard = activeTab === 'referencias' || customCats.includes(activeTab);
  const boardItems =
    activeTab === 'referencias' ? filtered : filtered.filter((p) => p.categoria === activeTab);

  const openNew = () => {
    setEditingItem(null);
    setFoto(undefined);
    setPresetCategoria(customCats.includes(activeTab) ? activeTab : '');
    setIsFormOpen(true);
  };

  const openEdit = (item: Produto) => {
    setViewItem(null);
    setEditingItem(item);
    setFoto(item.foto);
    setPresetCategoria('');
    setIsFormOpen(true);
  };

  const createCategory = () => {
    const name = newCat.trim();
    if (!name) return;
    if (!customCats.includes(name)) patchRoot({ produtoCategorias: [...customCats, name] });
    setActiveTab(name);
    setNewCat('');
    setAddCatOpen(false);
  };

  const removeCategory = (cat: string) => {
    patchRoot({ produtoCategorias: customCats.filter((c) => c !== cat) });
    if (activeTab === cat) setActiveTab('referencias');
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const str = (k: string) => ((f.get(k) as string) || '').trim();
    const notaRaw = str('nota');
    const itemData = {
      nome: str('nome'),
      categoria: str('categoria'),
      marca: str('marca'),
      frequenciaUso: str('frequenciaUso'),
      nota: notaRaw ? Number(notaRaw) : 0,
      status: (f.get('status') as Produto['status']) || 'uso diário',
      foto,
    };

    if (editingItem) {
      updateItem('produtos', editingItem.id, itemData);
    } else {
      addItem('produtos', {
        id: crypto.randomUUID(),
        completed: false,
        createdAt: Date.now(),
        ...itemData,
      });
    }

    setIsFormOpen(false);
    setEditingItem(null);
    setFoto(undefined);
  };

  const handleDelete = (id: string) => {
    deleteItem('produtos', id);
    setViewItem(null);
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
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'uso diário', label: 'Uso Diário' },
                { value: 'testar', label: 'Testar' },
                { value: 'comprar', label: 'Comprar' },
              ]}
            />
            {categoriaOptions.length > 0 && (
              <FilterSelect
                label="Categoria"
                value={categoriaFilter}
                onChange={setCategoriaFilter}
                options={categoriaOptions}
              />
            )}
          </div>
        }
      />

      {/* Tab nav + ações */}
      <div className="mb-6 flex items-center justify-between border-b border-zinc-200">
        <div className="flex gap-0 overflow-x-auto">
          {[...TABS, ...customCats.map((c) => ({ id: c, label: c }))].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'border-zinc-900 text-zinc-900'
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
            className="flex h-8 w-8 items-center justify-center rounded border border-zinc-200 text-zinc-500 transition-colors hover:border-zinc-900 hover:text-zinc-900"
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

      {/* ── MURAL (referências ou categoria personalizada) ── */}
      {isBoard && (
        <div>

          {boardItems.length === 0 ? (
            <div className="rounded border border-dashed border-gray-200 bg-white py-20 text-center">
              <p className="font-medium text-gray-400 italic">
                {data.produtos.length === 0
                  ? 'Nenhum produto ainda. Adicione o primeiro!'
                  : 'Nenhum produto encontrado aqui.'}
              </p>
            </div>
          ) : (
            <div className="columns-2 gap-4 [column-fill:_balance] sm:columns-3 lg:columns-4 [&>*]:mb-4">
              {boardItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setViewItem(item)}
                  className="group block w-full break-inside-avoid overflow-hidden rounded border border-gray-100 bg-white text-left shadow-sm transition-all hover:shadow-md"
                >
                  {item.foto ? (
                    <img
                      src={item.foto}
                      alt={item.nome || 'Produto'}
                      loading="lazy"
                      className="w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex aspect-square w-full items-center justify-center bg-gray-100 text-gray-300">
                      <ImageIcon className="h-10 w-10" />
                    </div>
                  )}
                  {(item.nome || item.marca) && (
                    <p className="truncate px-3 py-2 text-xs font-medium text-gray-700">
                      {item.nome || item.marca}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TABS DE TEXTO ── */}
      {!isBoard && GUIDE[activeTab] && (
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-4 text-2xl font-black tracking-tight text-gray-900 uppercase italic">
            {GUIDE[activeTab].titulo}
          </h2>
          <div className="space-y-4">
            {GUIDE[activeTab].blocos.map((bloco, i) => (
              <p key={i} className="text-base leading-relaxed text-gray-600">
                {bloco}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* ── POPUP: imagem + informações lado a lado ── */}
      <Modal
        isOpen={!!viewItem}
        onClose={() => setViewItem(null)}
        title={viewItem?.nome || viewItem?.marca || 'Produto'}
        maxWidth="max-w-3xl"
      >
        {viewItem && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="overflow-hidden rounded bg-gray-100">
              {viewItem.foto ? (
                <img src={viewItem.foto} alt={viewItem.nome || 'Produto'} className="w-full object-cover" />
              ) : (
                <div className="flex aspect-square items-center justify-center text-gray-300">
                  <ImageIcon className="h-12 w-12" />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                {viewItem.status && (
                  <span
                    className={cn(
                      'w-fit rounded-md px-2 py-1 text-[10px] font-bold tracking-wider uppercase',
                      STATUS_BADGE[viewItem.status],
                    )}
                  >
                    {viewItem.status}
                  </span>
                )}
                {!!viewItem.nota && (
                  <span className="flex items-center gap-1 text-sm font-bold text-gray-900">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {viewItem.nota}/10
                  </span>
                )}
              </div>
              <InfoRow label="Marca" value={viewItem.marca} />
              <InfoRow label="Categoria" value={viewItem.categoria} />
              <InfoRow label="Frequência de uso" value={viewItem.frequenciaUso} />

              {!viewItem.marca && !viewItem.categoria && !viewItem.frequenciaUso && (
                <p className="text-sm text-gray-400 italic">Sem informações adicionais.</p>
              )}

              <div className="mt-auto flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => openEdit(viewItem)}
                  className="flex flex-1 items-center justify-center gap-2 rounded bg-gray-900 py-2.5 text-sm font-bold text-white transition-colors hover:bg-gray-800"
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(viewItem.id)}
                  aria-label="Remover"
                  className="flex items-center justify-center rounded border border-gray-200 px-3 text-gray-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── FORM: adicionar / editar (só imagem necessária) ── */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingItem ? 'Editar Produto' : 'Novo Produto'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <ImageUpload value={foto} onChange={setFoto} label="Imagem do produto" />

          <p className="text-xs text-gray-400">
            Só a imagem é necessária. Os campos abaixo são opcionais — preencha se quiser.
          </p>

          <div className="space-y-2">
            <label htmlFor="produto-nome" className={labelCls}>
              Nome do Produto
            </label>
            <input
              id="produto-nome"
              name="nome"
              defaultValue={editingItem?.nome}
              className={inputCls}
              placeholder="Ex: Pomada modeladora matte"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="produto-marca" className={labelCls}>
                Marca
              </label>
              <input id="produto-marca" name="marca" defaultValue={editingItem?.marca} className={inputCls} />
            </div>
            <div className="space-y-2">
              <label htmlFor="produto-categoria" className={labelCls}>
                Categoria
              </label>
              <input
                id="produto-categoria"
                name="categoria"
                defaultValue={editingItem?.categoria || presetCategoria || ''}
                className={inputCls}
                placeholder="Perfume, Cabelo..."
                list="produto-categorias"
              />
              <datalist id="produto-categorias">
                {customCats.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="produto-frequenciaUso" className={labelCls}>
                Frequência de Uso
              </label>
              <input
                id="produto-frequenciaUso"
                name="frequenciaUso"
                defaultValue={editingItem?.frequenciaUso}
                className={inputCls}
                placeholder="Ex: Diário"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="produto-nota" className={labelCls}>
                Nota (0-10)
              </label>
              <input
                id="produto-nota"
                name="nota"
                type="number"
                min="0"
                max="10"
                defaultValue={editingItem?.nota || ''}
                className={inputCls}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="produto-status" className={labelCls}>
              Status
            </label>
            <select
              id="produto-status"
              name="status"
              defaultValue={editingItem?.status || 'uso diário'}
              className={inputCls}
            >
              <option value="uso diário">Uso Diário</option>
              <option value="testar">Testar</option>
              <option value="comprar">Comprar</option>
            </select>
          </div>

          <button className="w-full rounded bg-gray-900 py-4 font-black tracking-widest text-white uppercase">
            Salvar
          </button>
        </form>
      </Modal>

      {/* ── MODAL: nova categoria ── */}
      <Modal isOpen={addCatOpen} onClose={() => setAddCatOpen(false)} title="Nova Categoria">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Cria uma nova aba de mural. Os produtos com essa categoria aparecem aqui.
          </p>
          <input
            autoFocus
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createCategory()}
            className={inputCls}
            placeholder="Ex: Skincare, Cabelo, Perfumes..."
          />
          <button
            type="button"
            onClick={createCategory}
            className="w-full rounded bg-gray-900 py-3 font-black tracking-widest text-white uppercase"
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
                <span className="font-medium text-gray-800">{cat}</span>
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
          <p className="pt-1 text-xs text-gray-400">
            Excluir a aba não apaga os produtos.
          </p>
        </div>
      </Modal>
    </div>
  );
}
