import React from 'react';
import { CheckCircle2, Trash2, Edit2, Store } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface CardProps {
  key?: string | number;
  completed?: boolean;
  onToggle?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  /** URL de logo. Renderiza num quadro branco; cai para `icon`/Store se falhar. */
  iconImage?: string;
  footer?: React.ReactNode;
}

export function Card({
  completed,
  onToggle,
  onDelete,
  onEdit,
  title,
  subtitle,
  children,
  icon,
  iconImage,
  footer,
}: CardProps) {
  return (
    <motion.div
      layout
      className={cn(
        'rounded border border-gray-100 bg-white p-6 transition-all duration-300',
        completed
          ? 'scale-[0.98] border-transparent bg-gray-50 opacity-80'
          : 'shadow-sm hover:shadow-md',
      )}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex gap-4">
          {iconImage ? (
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded border border-gray-100 bg-white">
              <Store className="absolute h-5 w-5 text-gray-300" />
              <img
                src={iconImage}
                alt={title}
                loading="lazy"
                onError={(e) => e.currentTarget.remove()}
                className="relative h-full w-full bg-white object-contain p-1.5"
              />
            </div>
          ) : icon ? (
            <div
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded',
                completed ? 'bg-gray-200 text-gray-400' : 'bg-gray-900 text-white',
              )}
            >
              {icon}
            </div>
          ) : null}
          <div>
            <div className="flex items-center gap-2">
              <h3
                className={cn(
                  'text-lg font-bold text-gray-900',
                  completed && 'text-gray-400 line-through decoration-2',
                )}
              >
                {title}
              </h3>
              {completed && <CheckCircle2 className="h-5 w-5 text-green-500" />}
            </div>
            {subtitle && (
              <p
                className={cn(
                  'text-sm font-medium text-gray-500',
                  completed && 'text-gray-300',
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onEdit && !completed && (
            <button
              type="button"
              onClick={onEdit}
              aria-label="Editar"
              className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              aria-label="Remover"
              className="rounded-full p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          {onToggle && (
            <button
              type="button"
              onClick={onToggle}
              aria-label={completed ? 'Marcar como pendente' : 'Marcar como concluído'}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full transition-all',
                completed
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900',
              )}
            >
              <CheckCircle2 className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">{children}</div>

      {footer && (
        <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-6 text-xs font-bold tracking-wider text-gray-400 uppercase">
          {footer}
        </div>
      )}
    </motion.div>
  );
}
