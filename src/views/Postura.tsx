import React, { useRef, useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { PageHeader, Modal } from '../components/PageHeader';
import { Card } from '../components/Card';
import { FilterSelect } from '../components/FilterSelect';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { Accessibility, Upload, Loader2, Trash2, Video } from 'lucide-react';
import { PosturaItem } from '../types';
import { SortableGrid, SortableItem } from '../components/SortableGrid';
import { SUPABASE_ENABLED, uploadFile } from '../lib/supabase';
import { cn } from '../lib/utils';

const GUIDE_POSTURA = [
  {
    label: 'OS 3 PILARES',
    titulo: 'Fundamentos',
    texto:
      'Ombros para trás e para baixo. Peito ligeiramente para frente. Olhos no horizonte — queixo nivelado. Mantenha esses 3 e a postura corrige naturalmente.',
  },
  {
    label: 'EXERCÍCIO CHAVE',
    titulo: 'Dead Hang Diário',
    texto:
      '30-60 segundos pendurado na barra por dia. Descomprime toda a coluna. Abre os ombros. Melhora a postura em semanas. Um dos exercícios mais subestimados.',
  },
  {
    label: 'VISUAL',
    titulo: 'Impacto na Aparência',
    texto:
      'Postura ereta cria ilusão de 3-5 cm a mais. Ombros abertos ampliam o tórax. A roupa cai melhor em um corpo ereto. Transmite confiança e presença instantânea.',
  },
  {
    label: 'ROTINA',
    titulo: '30 Dias Para Mudar',
    texto:
      'Manhã: 2 min de abertura de tórax. Alarme a cada 2h para checar postura. Noite: 1 min de hip flexor stretch. Consistência de 30 dias cria o hábito permanente.',
  },
];

const TABS = [
  { id: 'videos', label: 'Vídeos' },
  { id: 'dicas', label: 'Dicas' },
];

export function Postura() {
  const { data, addItem, updateItem, deleteItem, toggleComplete, reorderItems, patchRoot } =
    useAppData();
  const [activeTab, setActiveTab] = useState('videos');

  // ── Vídeos ──
  const videos = data.posturaVideos ?? [];
  const videoRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, 'mp4');
      patchRoot({
        posturaVideos: [
          { id: crypto.randomUUID(), url, titulo: file.name.replace(/\.[^.]+$/, ''), createdAt: Date.now() },
          ...videos,
        ],
      });
    } catch (err) {
      console.error('[Postura] falha ao enviar vídeo:', err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeVideo = (id: string) =>
    patchRoot({ posturaVideos: videos.filter((v) => v.id !== id) });

  // ── Dicas (conteúdo original) ──
  const [search, setSearch] = useState('');
  const [completedFilter, setCompletedFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PosturaItem | null>(null);

  const debouncedSearch = useDebouncedValue(search, 200);
  const hasActiveFilters = completedFilter !== '';

  const filteredItems = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return data.postura.filter((item) => {
      if (q) {
        const matches =
          item.titulo.toLowerCase().includes(q) || item.descricao.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (completedFilter === 'pendente' && item.completed) return false;
      if (completedFilter === 'concluido' && !item.completed) return false;
      return true;
    });
  }, [data.postura, debouncedSearch, completedFilter]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemData = {
      titulo: formData.get('titulo') as string,
      descricao: formData.get('descricao') as string,
    };

    if (editingItem) {
      updateItem('postura', editingItem.id, itemData);
    } else {
      addItem('postura', {
        id: crypto.randomUUID(),
        completed: false,
        createdAt: Date.now(),
        ...itemData,
      });
    }

    setIsModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div>
      {/* Abas */}
      <div className="mb-6 flex gap-0 overflow-x-auto border-b border-zinc-200">
        {TABS.map((tab) => (
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

      {/* ── ABA VÍDEOS ── */}
      {activeTab === 'videos' && (
        <div>
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="text-sm text-zinc-500">
              Envie vídeos de referência. Aparecem no feed abaixo.
            </p>
            <button
              type="button"
              onClick={() => videoRef.current?.click()}
              disabled={uploading || !SUPABASE_ENABLED}
              className="flex shrink-0 items-center gap-2 rounded bg-[#0C2E2D] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-gray-200 transition-all hover:-translate-y-0.5 hover:bg-[#103E3C] disabled:opacity-60"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? 'Enviando...' : 'Enviar vídeo'}
            </button>
            <input
              ref={videoRef}
              type="file"
              accept="video/*"
              className="sr-only"
              onChange={handleVideo}
            />
          </div>

          {videos.length === 0 ? (
            <div className="rounded border border-dashed border-gray-200 bg-white py-20 text-center">
              <Video className="mx-auto mb-2 h-8 w-8 text-gray-300" />
              <p className="font-medium text-gray-400 italic">
                Nenhum vídeo ainda. Envie o primeiro!
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {videos.map((v) => (
                <div
                  key={v.id}
                  className="overflow-hidden rounded border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <video src={v.url} controls className="aspect-[9/16] w-full bg-black object-contain" />
                  <div className="flex items-center justify-between gap-2 px-3 py-2">
                    <p className="truncate text-xs font-medium text-gray-700">{v.titulo}</p>
                    <button
                      type="button"
                      onClick={() => removeVideo(v.id)}
                      aria-label="Remover vídeo"
                      className="shrink-0 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ABA DICAS (tela original) ── */}
      {activeTab === 'dicas' && (
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

          {/* Guia */}
          <div className="-mx-4 mb-6 overflow-x-auto px-4 md:mx-0 md:px-0">
            <div className="flex gap-3 pb-1" style={{ width: 'max-content' }}>
              {GUIDE_POSTURA.map((card) => (
                <div
                  key={card.titulo}
                  className="w-56 shrink-0 rounded bg-white p-4 transition-shadow hover:shadow-md"
                >
                  <p className="mb-1 text-[9px] font-bold tracking-widest text-zinc-400 uppercase">
                    {card.label}
                  </p>
                  <p className="mb-1.5 text-sm font-bold text-[#0C2E2D]">{card.titulo}</p>
                  <p className="text-xs leading-relaxed text-zinc-500">{card.texto}</p>
                </div>
              ))}
            </div>
          </div>

          <SortableGrid
            ids={filteredItems.map((i) => i.id)}
            onReorder={(from, to) => reorderItems('postura', from, to)}
            className="grid gap-6 md:grid-cols-2"
            disabled={hasActiveFilters || !!debouncedSearch}
          >
            {filteredItems.map((item) => (
              <SortableItem id={item.id} key={item.id}>
                <Card
                  title={item.titulo}
                  completed={item.completed}
                  onToggle={() => toggleComplete('postura', item.id)}
                  onDelete={() => deleteItem('postura', item.id)}
                  onEdit={() => {
                    setEditingItem(item);
                    setIsModalOpen(true);
                  }}
                  icon={<Accessibility />}
                >
                  <p className="text-sm leading-relaxed text-gray-600">{item.descricao}</p>
                </Card>
              </SortableItem>
            ))}
          </SortableGrid>
        </div>
      )}

      {/* Modal de orientação (compartilhado) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova Orientação de Postura"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="postura-titulo"
              className="text-xs font-bold tracking-widest text-gray-400 uppercase"
            >
              Título
            </label>
            <input
              id="postura-titulo"
              name="titulo"
              required
              defaultValue={editingItem?.titulo}
              className="w-full rounded border border-transparent bg-gray-50 p-4 font-medium text-[#0C2E2D] transition-all outline-none focus:border-[#0C2E2D] focus:bg-white"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="postura-descricao"
              className="text-xs font-bold tracking-widest text-gray-400 uppercase"
            >
              Descrição/Dica
            </label>
            <textarea
              id="postura-descricao"
              name="descricao"
              required
              defaultValue={editingItem?.descricao}
              className="min-h-[100px] w-full rounded border border-transparent bg-gray-50 p-4 font-medium text-[#0C2E2D] transition-all outline-none focus:border-[#0C2E2D] focus:bg-white"
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
