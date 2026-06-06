import React, { useState } from 'react';
import { useAppData } from '../hooks/useAppData';
import { Modal } from '../components/PageHeader';
import { ImageUpload } from '../components/ImageUpload';
import { Plus, Image as ImageIcon, Pencil, Trash2, Settings, X, ZoomIn } from 'lucide-react';
import { cn } from '../lib/utils';
import { Roupa } from '../types';

// Categorias padrão (criadas para instalações novas; editáveis/excluíveis).
const DEFAULT_CATS = ['Básicos', 'Paleta', 'Formalidade', 'Ajustar'];

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
  'w-full rounded border border-transparent bg-gray-50 p-3 font-medium text-[#0C2E2D] transition-all outline-none focus:border-[#0C2E2D] focus:bg-white';
const labelCls = 'text-xs font-bold tracking-widest text-gray-400 uppercase';

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className={labelCls}>{label}</p>
      <p className="mt-0.5 text-sm font-medium text-[#103E3C]">{value}</p>
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
  const [zoomImg, setZoomImg] = useState<string | null>(null);

  const [addCatOpen, setAddCatOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [newCat, setNewCat] = useState('');
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Todas as abas são murais de imagem. Referências = tudo; demais filtram por categoria.
  const boardItems =
    activeTab === 'referencias'
      ? data.roupas
      : data.roupas.filter((r) => r.categoria === activeTab);

  const openNew = () => {
    setEditingItem(null);
    setFoto(undefined);
    setPresetCategoria(activeTab !== 'referencias' ? activeTab : '');
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
    if (!customCats.includes(name)) {
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

  const saveRename = () => {
    const novo = editName.trim();
    if (!editingCat || !novo || novo === editingCat) {
      setEditingCat(null);
      return;
    }
    // Renomeia a categoria e reatribui as roupas que a usam
    patchRoot({
      roupaCategorias: customCats.map((c) => (c === editingCat ? novo : c)),
    });
    data.roupas
      .filter((r) => r.categoria === editingCat)
      .forEach((r) => updateItem('roupas', r.id, { categoria: novo }));
    if (activeTab === editingCat) setActiveTab(novo);
    setEditingCat(null);
  };

  const tabBtn = (id: string, label: string) => (
    <button
      key={id}
      onClick={() => setActiveTab(id)}
      className={cn(
        'whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-all',
        activeTab === id
          ? 'border-[#0C2E2D] text-[#0C2E2D]'
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
          {tabBtn('referencias', 'Todos')}
          {customCats.map((c) => tabBtn(c, c))}
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

      {/* ── MURAL (toda aba é um mural de imagens) ── */}
      {(
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
              className="flex shrink-0 items-center gap-2 rounded bg-[#0C2E2D] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-gray-200 transition-all hover:-translate-y-0.5 hover:bg-[#103E3C]"
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

      {/* ── POPUP: imagem + informações (sem título; ações no topo) ── */}
      <Modal isOpen={!!viewItem} onClose={() => setViewItem(null)} maxWidth="max-w-4xl" hideHeader>
        {viewItem && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="relative overflow-hidden rounded bg-gray-100">
              {viewItem.foto ? (
                <>
                  <img
                    src={viewItem.foto}
                    alt={viewItem.nome || 'Referência'}
                    className="w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setZoomImg(viewItem.foto!)}
                    aria-label="Ampliar imagem"
                    title="Ampliar"
                    className="absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-[#0C2E2D] shadow backdrop-blur transition-colors hover:bg-white"
                  >
                    <ZoomIn className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <div className="flex aspect-[3/4] items-center justify-center text-gray-300">
                  <ImageIcon className="h-12 w-12" />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              {/* Ações no topo, ao lado da imagem */}
              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() => openEdit(viewItem)}
                  aria-label="Editar"
                  title="Editar"
                  className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-[#0C2E2D]"
                >
                  <Pencil className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(viewItem.id)}
                  aria-label="Excluir"
                  title="Excluir"
                  className="rounded-full p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewItem(null)}
                  aria-label="Fechar"
                  title="Fechar"
                  className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-[#0C2E2D]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

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
            </div>
          </div>
        )}
      </Modal>

      {/* ── ZOOM: imagem ampliada (95vh) ── */}
      {zoomImg && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-[#0C2E2D]/80 p-2"
          onClick={() => setZoomImg(null)}
        >
          <img
            src={zoomImg}
            alt="Imagem ampliada"
            className="max-h-[95vh] max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setZoomImg(null)}
            aria-label="Fechar"
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#0C2E2D] shadow transition-colors hover:bg-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

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
                {[...customCats, ...CATEGORIA_BASE]
                  .filter((c, i, a) => a.indexOf(c) === i)
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

          <button className="w-full rounded bg-[#0C2E2D] py-4 font-black tracking-widest text-white uppercase">
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
            className="w-full rounded bg-[#0C2E2D] py-3 font-black tracking-widest text-white uppercase"
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
                className="flex items-center justify-between gap-2 rounded border border-gray-100 bg-gray-50 px-4 py-3"
              >
                {editingCat === cat ? (
                  <>
                    <input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveRename()}
                      className="flex-1 rounded border border-gray-200 bg-white px-2 py-1 text-sm font-medium text-[#0C2E2D] outline-none"
                    />
                    <button
                      type="button"
                      onClick={saveRename}
                      className="rounded bg-[#0C2E2D] px-3 py-1 text-xs font-bold text-white"
                    >
                      Salvar
                    </button>
                  </>
                ) : (
                  <>
                    <span className="font-medium text-[#103E3C]">{cat}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCat(cat);
                          setEditName(cat);
                        }}
                        aria-label={`Editar ${cat}`}
                        className="flex items-center gap-1 rounded px-2 py-1 text-xs font-bold text-gray-500 transition-colors hover:bg-gray-100"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Editar
                      </button>
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
                  </>
                )}
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
