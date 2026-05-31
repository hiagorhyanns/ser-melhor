import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Tag,
  Store,
  Scissors,
  User,
  Package,
  Shirt,
  Accessibility,
  Dumbbell,
  CheckCircle2,
  Clock,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAppData } from '../hooks/useAppData';
import { useGeminiSuggestions } from '../hooks/useGeminiSuggestions';
import { isGeminiAvailable } from '../lib/gemini';
import { motion } from 'motion/react';
import { Card } from '../components/Card';
import { cn } from '../lib/utils';
import type { AppData } from '../types';

type AnyItem = AppData[keyof AppData][number];

const categories: { to: string; key: keyof AppData; icon: LucideIcon; label: string; color: string }[] =
  [
    { to: '/marcas', key: 'marcas', icon: Tag, label: 'Marcas', color: 'bg-blue-500' },
    { to: '/lojas', key: 'lojas', icon: Store, label: 'Lojas', color: 'bg-indigo-500' },
    { to: '/barba', key: 'barba', icon: Scissors, label: 'Barba', color: 'bg-amber-600' },
    { to: '/cabelo', key: 'cabelo', icon: User, label: 'Cabelo', color: 'bg-slate-700' },
    { to: '/produtos', key: 'produtos', icon: Package, label: 'Produtos', color: 'bg-emerald-500' },
    { to: '/roupas', key: 'roupas', icon: Shirt, label: 'Roupas', color: 'bg-rose-500' },
    { to: '/postura', key: 'postura', icon: Accessibility, label: 'Postura', color: 'bg-cyan-500' },
    { to: '/musculos', key: 'musculos', icon: Dumbbell, label: 'Músculos', color: 'bg-orange-500' },
  ];

export function Dashboard() {
  const { data } = useAppData();

  // Overall stats
  const allItems = Object.values(data).flat() as AnyItem[];
  const totalItems = allItems.length;
  const completedItems = allItems.filter((i) => i.completed).length;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Per-category stats
  const categoryStats = categories.map((cat) => {
    const items = data[cat.key] as AnyItem[];
    const total = items.length;
    const completed = items.filter((i) => i.completed).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { ...cat, total, completed, pct };
  });

  const pendingItems = allItems.filter((i) => !i.completed).slice(0, 4);

  // Fallback: categorias com mais itens pendentes
  const suggestions = [...categoryStats]
    .filter((c) => c.total > 0 && c.pct < 100)
    .sort((a, b) => b.total - b.completed - (a.total - a.completed))
    .slice(0, 3);

  // IA Gemini — substituí as sugestões fallback quando disponível
  const { aiSuggestions, loading: aiLoading, fromAI, refresh: refreshAI } = useGeminiSuggestions(data);
  const geminiEnabled = isGeminiAvailable();

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Seu Estilo, <span className="text-gray-400 dark:text-gray-500">Evoluindo.</span>
          </h1>
          <p className="font-medium text-gray-500 dark:text-gray-400">
            Acompanhe seu progresso e mantenha sua rotina impecável.
          </p>
        </div>
        <div className="flex items-center gap-6 rounded-3xl border border-gray-100 bg-white px-6 py-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col">
            <span className="mb-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
              Progresso Geral
            </span>
            <span className="text-2xl font-black text-gray-900 dark:text-gray-100">
              {progressPercent}%
            </span>
          </div>
          <div className="relative flex h-20 w-20 items-center justify-center">
            <svg className="h-full w-full -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="32"
                fill="none"
                strokeWidth="6"
                className="stroke-gray-100 dark:stroke-gray-800"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                fill="none"
                strokeWidth="6"
                className="stroke-gray-900 transition-all duration-1000 ease-out dark:stroke-gray-100"
                strokeDasharray={`${progressPercent * 2.01} 201`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-gray-900 dark:text-gray-100" />
            </div>
          </div>
        </div>
      </header>

      {/* Categories Grid with per-category progress */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-[11px] font-bold tracking-wider text-gray-400 uppercase dark:text-gray-500">
            Áreas de Foco
          </h2>
          <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase dark:text-gray-500">
            {completedItems}/{totalItems} concluídos
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categoryStats.map((cat, i) => (
            <Link key={cat.to} to={cat.to}>
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="group h-full cursor-pointer rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-2xl transition-transform group-hover:scale-110',
                      cat.color,
                    )}
                  >
                    <cat.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-black tabular-nums text-gray-400 dark:text-gray-500">
                    {cat.pct}%
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100">{cat.label}</h3>
                <p className="mb-3 mt-1 text-xs font-medium text-gray-400 italic dark:text-gray-500">
                  {cat.total === 0 ? 'Nenhum item' : `${cat.completed}/${cat.total} itens`}
                </p>
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <motion.div
                    className={cn('h-1.5 rounded-full', cat.color)}
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.06 }}
                  />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Pending + Suggestions */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Pending Items */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-gray-100">
              <Clock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              Itens Pendentes
            </h2>
            <p className="text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
              {totalItems - completedItems} restantes
            </p>
          </div>
          <div className="space-y-3">
            {pendingItems.length > 0 ? (
              pendingItems.map((item) => {
                // Cada categoria de item tem um nome em campo diferente — extrai o que existir.
                const displayName =
                  ('nome' in item && item.nome) ||
                  ('titulo' in item && item.titulo) ||
                  ('musculo' in item && item.musculo) ||
                  ('estilo' in item && item.estilo) ||
                  ('tipoCorte' in item && item.tipoCorte) ||
                  'Item sem nome';
                return (
                  <div
                    key={item.id}
                    className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 transition-all hover:border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-orange-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {displayName}
                      </span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-gray-900 dark:text-gray-600 dark:group-hover:text-gray-100" />
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-400 italic dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-500">
                Tudo em dia por aqui!
              </div>
            )}
          </div>
        </section>

        {/* Suggestions — AI quando disponível, fallback baseado em dados */}
        <Card
          title="Próximas melhorias"
          subtitle={
            fromAI
              ? 'Gerado pelo Gemini com base nos seus dados'
              : 'Categorias com mais itens pendentes'
          }
          footer={
            geminiEnabled ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-indigo-500" />
                  <span className="text-[10px] font-bold tracking-widest text-indigo-500 uppercase">
                    {fromAI ? 'Gemini' : 'Aguardando IA'}
                  </span>
                </div>
                <button
                  onClick={refreshAI}
                  disabled={aiLoading}
                  className="flex items-center gap-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase transition-colors hover:text-gray-700 disabled:opacity-40 dark:hover:text-gray-200"
                >
                  <RefreshCw className={cn('h-3 w-3', aiLoading && 'animate-spin')} />
                  Atualizar
                </button>
              </div>
            ) : (
              'Evolução constante'
            )
          }
        >
          <div className="space-y-1">
            {aiLoading && (
              <div className="flex items-center justify-center py-6">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-500 dark:border-gray-700" />
              </div>
            )}

            {!aiLoading && fromAI && aiSuggestions.length > 0
              ? aiSuggestions.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl p-2"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {s.titulo}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{s.descricao}</p>
                    </div>
                  </div>
                ))
              : !aiLoading &&
                (suggestions.length > 0 ? (
                  suggestions.map((cat) => (
                    <Link
                      key={cat.key}
                      to={cat.to}
                      className="group flex items-center gap-4 rounded-xl p-2 transition-all hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                          cat.color,
                        )}
                      >
                        <cat.icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                          {cat.label}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {cat.total - cat.completed}{' '}
                          {cat.total - cat.completed === 1 ? 'item pendente' : 'itens pendentes'}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-gray-900 dark:text-gray-600 dark:group-hover:text-gray-100" />
                    </Link>
                  ))
                ) : (
                  <p className="py-6 text-center text-sm text-gray-400 italic dark:text-gray-500">
                    Todas as categorias concluídas!
                  </p>
                ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
