import { useMemo, useState } from 'react';
import { Search, Plus, Copy, Check, Pencil, Trash2, AtSign } from 'lucide-react';
import { Modal } from '../components/PageHeader';
import { ImageUpload } from '../components/ImageUpload';
import { useAppData } from '../contexts/AppDataContext';
import { RedeSocial as RedeSocialItem } from '../types';

const inputCls =
  'w-full rounded border border-transparent bg-gray-50 p-3 font-medium text-[#0C2E2D] transition-all outline-none focus:border-[#0C2E2D] focus:bg-white';
const labelCls = 'text-xs font-bold tracking-widest text-gray-400 uppercase';

export function RedeSocial() {
  const { data, addItem, updateItem, deleteItem } = useAppData();
  const perfis = useMemo(() => data.redesSociais ?? [], [data.redesSociais]);

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<RedeSocialItem | null>(null);
  const [foto, setFoto] = useState<string | undefined>(undefined);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return perfis;
    return perfis.filter(
      (p) => p.nome.toLowerCase().includes(q) || p.link.toLowerCase().includes(q),
    );
  }, [perfis, search]);

  const openCreate = () => {
    setEditing(null);
    setFoto(undefined);
    setIsModalOpen(true);
  };

  const openEdit = (item: RedeSocialItem) => {
    setEditing(item);
    setFoto(item.foto);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const nome = (f.get('nome') as string).trim();
    const link = (f.get('link') as string).trim();
    if (!nome || !link) return;

    if (editing) {
      updateItem('redesSociais', editing.id, { nome, link, foto });
    } else {
      addItem('redesSociais', {
        id: crypto.randomUUID(),
        nome,
        link,
        foto,
        completed: false,
        createdAt: Date.now(),
      });
    }
    setIsModalOpen(false);
  };

  const copyLink = async (item: RedeSocialItem) => {
    try {
      await navigator.clipboard.writeText(item.link);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId((id) => (id === item.id ? null : id)), 1500);
    } catch (err) {
      console.error('[RedeSocial] falha ao copiar link:', err);
    }
  };

  return (
    <div>
      {/* Busca à esquerda + Cadastrar à direita */}
      <div className="mb-10 flex items-center gap-4">
        <div className="group relative flex-1">
          <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#0C2E2D]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar rede social..."
            className="w-full rounded bg-white py-4 pr-4 pl-12 text-sm font-medium text-[#0C2E2D] transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-[#0C2E2D]/5 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex shrink-0 items-center justify-center gap-2 rounded bg-[#0C2E2D] px-5 py-4 font-bold whitespace-nowrap text-white transition-all hover:-translate-y-0.5 hover:bg-[#103E3C] active:translate-y-0"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">CADASTRAR</span>
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded bg-white py-20 text-center">
          <p className="font-medium text-gray-400 italic">
            {perfis.length === 0
              ? 'Nenhum perfil cadastrado. Clique em Cadastrar para começar.'
              : 'Nenhum perfil encontrado.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group flex items-center gap-4 rounded bg-white p-4 transition-all hover:shadow-md"
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded bg-gray-100">
                {item.foto ? (
                  <img src={item.foto} alt={item.nome} className="h-full w-full object-cover" />
                ) : (
                  <AtSign className="h-6 w-6 text-gray-300" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate font-bold text-[#0C2E2D] hover:underline"
                >
                  {item.nome}
                </a>
                <p className="truncate text-sm text-gray-500">{item.link}</p>
              </div>
              <div className="flex shrink-0 items-center">
                <button
                  type="button"
                  onClick={() => copyLink(item)}
                  title="Copiar link"
                  className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-[#0C2E2D]"
                >
                  {copiedId === item.id ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  title="Editar"
                  className="rounded-full p-2 text-gray-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-gray-50 hover:text-[#0C2E2D]"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteItem('redesSociais', item.id)}
                  title="Excluir"
                  className="rounded-full p-2 text-gray-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editing ? 'Editar perfil' : 'Cadastrar perfil'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <ImageUpload value={foto} onChange={setFoto} label="Foto de perfil" />
          <div className="space-y-2">
            <label htmlFor="rs-nome" className={labelCls}>
              Nome do perfil
            </label>
            <input
              id="rs-nome"
              name="nome"
              defaultValue={editing?.nome ?? ''}
              required
              placeholder="@meuperfil"
              className={inputCls}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="rs-link" className={labelCls}>
              Link
            </label>
            <input
              id="rs-link"
              name="link"
              type="url"
              defaultValue={editing?.link ?? ''}
              required
              placeholder="https://instagram.com/meuperfil"
              className={inputCls}
            />
          </div>
          <button className="w-full rounded bg-[#0C2E2D] py-4 font-black tracking-widest text-white uppercase transition-all hover:bg-[#103E3C]">
            {editing ? 'Salvar' : 'Cadastrar'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
