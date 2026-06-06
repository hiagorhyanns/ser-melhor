import React, { useState } from 'react';
import { Search, Plus, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface PageHeaderProps {
  title?: string;
  description?: string;
  onAdd: () => void;
  searchValue: string;
  onSearchChange: (val: string) => void;
  placeholder?: string;
  /**
   * Painel de filtros que aparece quando o usuario clica no botao "filter".
   * Cada view monta seu proprio painel com selects/checkboxes relevantes.
   * Se nao for passado, o botao filter fica oculto.
   */
  filterPanel?: React.ReactNode;
  /**
   * Indica se ha filtros ativos (mostra um ponto colorido sobre o botao filter).
   */
  hasActiveFilters?: boolean;
}

export function PageHeader({
  title,
  description,
  onAdd,
  searchValue,
  onSearchChange,
  placeholder = 'Pesquisar...',
  filterPanel,
  hasActiveFilters,
}: PageHeaderProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const hasHeader = !!(title || description);

  const addButton = (full: boolean) => (
    <button
      type="button"
      onClick={onAdd}
      className={cn(
        'flex shrink-0 items-center justify-center gap-2 rounded bg-[#0C2E2D] font-bold whitespace-nowrap text-white shadow-lg shadow-gray-200 transition-all hover:-translate-y-0.5 hover:bg-[#103E3C] active:translate-y-0',
        full ? 'w-full px-6 py-3 md:w-auto' : 'px-5 py-4',
      )}
    >
      <Plus className="h-5 w-5" />
      <span className={full ? '' : 'hidden sm:inline'}>ADICIONAR ITEM</span>
    </button>
  );

  return (
    <div className="mb-10 flex flex-col gap-8">
      {hasHeader && (
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            {title && (
              <h1 className="mb-2 text-4xl font-black tracking-tight text-[#0C2E2D] uppercase">
                {title}
              </h1>
            )}
            {description && <p className="max-w-xl font-medium text-gray-500">{description}</p>}
          </div>
          {addButton(true)}
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="group relative flex-1">
          <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#0C2E2D]" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded border border-gray-100 bg-white py-4 pr-4 pl-12 text-sm font-medium text-[#0C2E2D] shadow-sm transition-all placeholder:text-gray-400 focus:border-gray-300 focus:ring-2 focus:ring-[#0C2E2D]/5 focus:outline-none"
          />
        </div>
        {filterPanel && (
          <button
            type="button"
            onClick={() => setIsFilterOpen((v) => !v)}
            aria-label={isFilterOpen ? 'Fechar filtros' : 'Abrir filtros'}
            aria-expanded={isFilterOpen}
            className={cn(
              'relative rounded border bg-white p-4 shadow-sm transition-all',
              isFilterOpen
                ? 'border-gray-300 text-[#0C2E2D]'
                : 'border-gray-100 text-gray-400 hover:border-gray-300 hover:text-[#0C2E2D]',
            )}
          >
            <Filter className="h-6 w-6" />
            {hasActiveFilters && (
              <span
                aria-hidden="true"
                className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white"
              />
            )}
          </button>
        )}
        {!hasHeader && addButton(false)}
      </div>

      <AnimatePresence initial={false}>
        {filterPanel && isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="rounded border border-gray-100 bg-white p-5 shadow-sm">
              {filterPanel}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Classe de largura máxima (ex: "max-w-3xl"). Padrão "max-w-lg". */
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-[#0C2E2D]/40 backdrop-blur-sm"
          />
          <div className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={cn(
                'pointer-events-auto max-h-[90vh] w-full overflow-y-auto rounded bg-white p-8 text-[#0C2E2D] shadow-2xl',
                maxWidth,
              )}
            >
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-black tracking-tight uppercase italic">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fechar"
                  className="rounded-full p-2 transition-colors hover:bg-gray-50"
                >
                  <X />
                </button>
              </div>
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
