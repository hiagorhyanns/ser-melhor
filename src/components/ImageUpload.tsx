import { useId, useRef, useState } from 'react';
import { compressImage, dataUrlToFile } from '../lib/imageUtils';
import { SUPABASE_ENABLED, uploadImage } from '../lib/supabase';
import { Upload, X, Loader2 } from 'lucide-react';

interface Props {
  value?: string;
  onChange: (value: string | undefined) => void;
  label?: string;
}

const INPUT_CLASS =
  'flex-1 rounded border border-transparent bg-gray-50 px-4 py-3 text-sm font-medium text-[#0C2E2D] transition-all outline-none placeholder:text-gray-400 focus:border-[#0C2E2D] focus:bg-white';

/**
 * Reusable image upload component.
 * Accepts file upload (compressed via canvas) or URL paste.
 * Stores result as data URL (file) or raw URL string (paste).
 */
export function ImageUpload({ value, onChange, label = 'Foto / Referência' }: Props) {
  const fileId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await compressImage(file);
      if (SUPABASE_ENABLED) {
        // Nuvem: sobe a imagem comprimida pro Storage → URL pública global.
        const url = await uploadImage(dataUrlToFile(dataUrl));
        onChange(url);
      } else {
        // Offline: guarda data URL no localStorage (só local).
        onChange(dataUrl);
      }
    } catch (err) {
      console.error('[ImageUpload] falha ao processar imagem:', err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
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
        <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
          {label}
        </span>
        <div className="relative overflow-hidden rounded bg-gray-100">
          <img src={value} alt="Referência" className="h-48 w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="absolute top-2 right-2 rounded-full bg-[#0C2E2D]/60 p-1.5 text-white transition-colors hover:bg-[#0C2E2D]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
        {label}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex shrink-0 items-center gap-2 rounded bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? 'Enviando...' : 'Upload'}
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
