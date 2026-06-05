import React, { useState } from 'react';
import { useAppData } from '../hooks/useAppData';
import { Modal } from '../components/PageHeader';
import { ImageUpload } from '../components/ImageUpload';
import { Plus, Image as ImageIcon, Pencil, Trash2, Settings, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Roupa } from '../types';

// ── Conteúdo dos guias (somente texto) ──
const GUIDE: Record<string, { titulo: string; blocos: string[] }> = {
  basicos: {
    titulo: 'Guarda-Roupa Cápsula',
    blocos: [
      'A base do estilo masculino são poucas peças neutras que combinam entre si. Comece pelo essencial: 2 calças (azul-marinho e cáqui), 1 jeans azul-escuro, 3 camisetas brancas de qualidade, 1 camisa branca e 1 camisa azul-clara.',
      'Para os pés: 1 Oxford ou Derby preto/marrom e 1 tênis branco minimalista. Uma peça de sobreposição (blazer cinza ou jaqueta) fecha o conjunto.',
      'Com 8 a 10 peças bem escolhidas você monta semanas inteiras de looks sem repetir a mesma combinação. Qualidade acima de quantidade — sempre.',
    ],
  },
  paleta: {
    titulo: 'Cores que Combinam',
    blocos: [
      'Construa sobre uma base de neutros: preto, branco, cinza, azul-marinho, cáqui e bege. Neutros combinam entre si em qualquer ordem — é impossível errar.',
      'Depois adicione no máximo 1 cor de destaque por look: bordô, verde-oliva, mostarda ou azul-royal. A regra de ouro: nunca mais de 3 cores no corpo inteiro.',
      'Tons terrosos passam sofisticação no dia a dia. Azul-marinho substitui o preto com mais elegância para o trabalho. Branco é o coringa que ilumina qualquer combinação.',
    ],
  },
  formalidade: {
    titulo: 'Escala de Vestimenta',
    blocos: [
      'Entender o nível de formalidade evita o erro de chegar over ou underdressed. A escala, do mais casual ao mais formal:',
      'Camiseta + Jeans = Casual. Camisa + Calça = Smart Casual. Camisa + Blazer = Semi-formal. Camisa + Terno = Formal. Smoking = Black Tie.',
      'O sapato sempre eleva um nível: trocar o tênis por um Derby transforma um look casual em smart casual sem mudar mais nada. Acessório certo (cinto, relógio) reforça a intenção.',
    ],
  },
  fit: {
    titulo: 'Caimento é Tudo',
    blocos: [
      'Uma roupa barata bem ajustada parece melhor que uma cara mal ajustada. O caimento é o que separa o homem bem-vestido do resto.',
      'Pontos para conferir: a costura do ombro termina exatamente na curva do ombro; o tronco acompanha o corpo sem apertar nem sobrar; a barra da calça encosta levemente no sapato (no break ou half break).',
      'Não confie no tamanho da etiqueta — experimente sempre. E reserve R$20 a R$50 para o ajuste do alfaiate: é o melhor investimento de estilo que existe.',
    ],
  },
};

// Abas fixas (referências = mural geral; demais = guias de texto)
const BUILTIN_TABS = [
  { id: 'referencias', label: 'Referências' },
  { id: 'basicos', label: 'Básicos' },
  { id: 'paleta', label: 'Paleta' },
  { id: 'formalidade', label: 'Formalidade' },
  { id: 'fit', label: 'Fit' },
];

const CATEGORIA_BASE = [
  'Look completo',
  'Camisetas',
  'Camisas',
  'Calças',
  'Bermudas',
  'Jaquetas',
  'Tênis',
  'Sapatos',
  'Acessórios',
];

const STATUS_BADGE: Record<Roupa['status'], string> = {
  tenho: 'bg-emerald-100 text-emerald-700',
  comprar: 'bg-indigo-100 text-indigo-700',
  substituir: 'bg-amber-100 text-amber-700',
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

export function Roupas() {
  const { data, addItem, updateItem, deleteItem, patchRoot } = useAppData();
  const customCats = data.roupaCategorias ?? [];

  const [activeTab, setActiveTab] = useState('referencias');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Roupa | null>(null);
  const [foto, setFoto] = useState<string | undefined>(undefined);
  const [presetCategoria, setPresetCategoria] = useState('');

  const [viewItem, setViewItem] = useState<Roupa | null>(null);

  const [addCatOpen, setAddCatOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [newCat, setNewCat] = useState('');

  // É um mural de imagens? (referências ou categoria personalizada)
  const isBoard = activeTab === 'referencias' || customCats.includes(activeTab);
  const boardItems =
    activeTab === 'referencias'
      ? data.roupas
      : data.roupas.filter((r) => r.categoria === activeTab);

  const openNew = () => {
    setEditingItem(null);
    setFoto(undefined);
    setPresetCategoria(customCats.includes(activeTab) ? activeTab : '');
    setIsFormOpen(true);
  };

  const openEdit = (item: Roupa) => {
    setViewItem(null);
    setEditingItem(item);
    setFoto(item.foto);
    setPresetCategoria('');
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const str = (k: string) => ((f.get(k) as string) || '').trim();
    const itemData = {
      nome: str('nome'),
      categoria: str('categoria'),
      cor: str('cor'),
      ocasiao: str('ocasiao'),
      combinacoes: str('combinacoes'),
      status: (f.get('status') as Roupa['status']) || 'tenho',
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

    setIsFormOpen(false);
    setEditingItem(null);
    setFoto(undefined);
  };

  const handleDelete = (id: string) => {
    deleteItem('roupas', id);
    setViewItem(null);
  };

  const createCategory = () => {
    const name = newCat.trim();
    if (!name) return;
    if (!customCats.includes(name) && !BUILTIN_TABS.some((t) => t.label === name)) {
      patchRoot({ roupaCategorias: [...customCats, name] });
    }
    setActiveTab(name);
    setNewCat('');
    setAddCatOpen(false);
  };

  const removeCategory = (cat: string) => {
    patchRoot({ roupaCategorias: customCats.filter((c) => c !== cat) });
    if (activeTab === cat) setActiveTab('referencias');
  };

  const tabBtn = (id: string, label: string) => (
    <button
      key={id}
      onClick={() => setActiveTab(id)}
      className={cn(
        'whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-all',
        activeTab === id
          ? 'border-zinc-900 text-zinc-900'
          : 'border-transparent text-zinc-400 hover:text-zinc-700',
      )}
    >
      {label}
    </button>
  );

  return (
    <div>
      {/* Tab nav + ações (criar / configurar categorias) */}
      <div className="mb-6 flex items-center justify-between border-b border-zinc-200">
        <div className="flex gap-0 overflow-x-auto">
          {BUILTIN_TABS.map((t) => tabBtn(t.id, t.label))}
          {customCats.map((c) => tabBtn(c, c))}
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
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="text-sm text-zinc-500">
              {activeTab === 'referencias'
                ? 'Seu mural de referências visuais. Toque numa imagem para ver os detalhes.'
                : `Categoria "${activeTab}". Toque numa imagem para ver os detalhes.`}
            </p>
            <button
              type="button"
              onClick={openNew}
              className="flex shrink-0 items-center gap-2 rounded bg-gray-900 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-gray-200 transition-all hover:-translate-y-0.5 hover:bg-gray-800"
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </button>
          </div>

          {boardItems.length === 0 ? (
            <div className="rounded border border-dashed border-gray-200 bg-white py-20 text-center">
              <p className="font-medium text-gray-400 italic">
                Nenhuma imagem aqui ainda. Adicione a primeira!
              </p>
            </div>
          ) : (
            <div className="gap-4 [column-fill:_balance] columns-2 sm:columns-3 lg:columns-4 [&>*]:mb-4">
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
                      alt={item.nome || 'Referência'}
                      loading="lazy"
                      className="w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex aspect-[3/4] w-full items-center justify-center bg-gray-100 text-gray-300">
                      <ImageIcon className="h-10 w-10" />
                    </div>
                  )}
                  {item.nome && (
                    <p className="truncate px-3 py-2 text-xs font-medium text-gray-700">{item.nome}</p>
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

      {/* ── POPUP: imagem + informações ── */}
      <Modal
        isOpen={!!viewItem}
        onClose={() => setViewItem(null)}
        title={viewItem?.nome || 'Referência'}
        maxWidth="max-w-3xl"
      >
        {viewItem && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="overflow-hidden rounded bg-gray-100">
              {viewItem.foto ? (
                <img src={viewItem.foto} alt={viewItem.nome || 'Referência'} className="w-full object-cover" />
              ) : (
                <div className="flex aspect-[3/4] items-center justify-center text-gray-300">
                  <ImageIcon className="h-12 w-12" />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
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
              <InfoRow label="Categoria" value={viewItem.categoria} />
              <InfoRow label="Cor" value={viewItem.cor} />
              <InfoRow label="Ocasião" value={viewItem.ocasiao} />
              <InfoRow label="Combinações" value={viewItem.combinacoes} />

              {!viewItem.categoria && !viewItem.cor && !viewItem.ocasiao && !viewItem.combinacoes && (
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

      {/* ── FORM: adicionar / editar ── */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingItem ? 'Editar Referência' : 'Nova Referência'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <ImageUpload value={foto} onChange={setFoto} label="Imagem (referência)" />

          <p className="text-xs text-gray-400">
            Só a imagem é necessária. Os campos abaixo são opcionais — preencha se quiser.
          </p>

          <div className="space-y-2">
            <label htmlFor="roupa-nome" className={labelCls}>
              Nome / Descrição
            </label>
            <input
              id="roupa-nome"
              name="nome"
              defaultValue={editingItem?.nome}
              className={inputCls}
              placeholder="Ex: Look casual de verão"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="roupa-categoria" className={labelCls}>
                Categoria
              </label>
              <select
                id="roupa-categoria"
                name="categoria"
                defaultValue={editingItem?.categoria || presetCategoria || ''}
                className={inputCls}
              >
                <option value="">—</option>
                {CATEGORIA_BASE.map((c) => (
                  <option key={c}>{c}</option>
                ))}
                {customCats
                  .filter((c) => !CATEGORIA_BASE.includes(c))
                  .map((c) => (
                    <option key={c}>{c}</option>
                  ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="roupa-cor" className={labelCls}>
                Cor
              </label>
              <input id="roupa-cor" name="cor" defaultValue={editingItem?.cor} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="roupa-ocasiao" className={labelCls}>
                Ocasião
              </label>
              <input
                id="roupa-ocasiao"
                name="ocasiao"
                defaultValue={editingItem?.ocasiao}
                className={inputCls}
                placeholder="Casual, Trabalho..."
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="roupa-status" className={labelCls}>
                Status
              </label>
              <select
                id="roupa-status"
                name="status"
                defaultValue={editingItem?.status || 'tenho'}
                className={inputCls}
              >
                <option value="tenho">Tenho</option>
                <option value="comprar">Comprar</option>
                <option value="substituir">Substituir</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="roupa-combinacoes" className={labelCls}>
              Combinações
            </label>
            <textarea
              id="roupa-combinacoes"
              name="combinacoes"
              defaultValue={editingItem?.combinacoes}
              className={cn(inputCls, 'min-h-[80px]')}
            />
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
            Cria uma nova aba de mural. As roupas com essa categoria aparecem aqui.
          </p>
          <input
            autoFocus
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createCategory()}
            className={inputCls}
            placeholder="Ex: Inverno, Praia, Trabalho..."
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

      {/* ── MODAL: configurar (excluir) categorias ── */}
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
            Excluir a aba não apaga as roupas — elas só deixam de ter essa categoria como mural.
          </p>
        </div>
      </Modal>
    </div>
  );
}
