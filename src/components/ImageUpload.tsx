import { useId, useRef } from 'react';
import { compressImage } from '../lib/imageUtils';
import { Upload, X } from 'lucide-react';

interface Props {
  value?: string;
  onChange: (value: string | undefined) => void;
  label?: string;
}

const INPUT_CLASS =
  'flex-1 rounded-2xl border border-transparent bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 transition-all outline-none placeholder:text-gray-400 focus:border-gray-900 focus:bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-gray-100 dark:focus:bg-gray-900';

/**
 * Reusable image upload component.
 * Accepts file upload (compressed via canvas) or URL paste.
 * Stores result as data URL (file) or raw URL string (paste).
 */
export function ImageUpload({ value, onChange, label = 'Foto / Referência' }: Props) {
  const fileId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImage(file);
      onChange(dataUrl);
    } catch {
      // silently ignore compression errors
    }
    e.target.value = '';
  };

  const commitUrl = () => {
    const url = urlRef.current?.value.trim() ?? '';
    if (url) {
      onChange(url);
      if (urlRef.current) urlRef.current.value = '';
    }
  };

  if (value) {
    return (
      <div className="space-y-2">
        <span className="text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
          {label}
        </span>
        <div className="relative overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">
          <img src={value} alt="Referência" className="h-48 w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="absolute top-2 right-2 rounded-full bg-gray-900/60 p-1.5 text-white transition-colors hover:bg-gray-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <span className="text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
        {label}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex shrink-0 items-center gap-2 rounded-2xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <Upload className="h-4 w-4" />
          Upload
        </button>
        <input
          ref={urlRef}
          type="url"
          placeholder="Ou cole uma URL..."
          className={INPUT_CLASS}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commitUrl();
            }
          }}
          onBlur={commitUrl}
        />
      </div>
      <input
        ref={fileRef}
        id={fileId}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFile}
      />
    </div>
  );
}
