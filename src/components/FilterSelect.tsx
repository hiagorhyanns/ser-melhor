import { useId } from 'react';

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  /** Texto da opcao "limpar / todos". Padrao: "Todos". */
  allLabel?: string;
}

/**
 * Select de filtro padronizado, usado nos filterPanel de cada view.
 * Valor "" significa "sem filtro" (mostra todos).
 */
export function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel = 'Todos',
}: FilterSelectProps) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className="flex min-w-[180px] flex-col gap-2 text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500"
    >
      {label}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm font-medium text-gray-900 normal-case transition-all outline-none focus:border-gray-900 focus:bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-gray-100 dark:focus:bg-gray-900"
      >
        <option value="">{allLabel}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
