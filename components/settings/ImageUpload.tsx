import { useRef, useState, useEffect } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { supabase } from '@/supabase/client';
import { FormField } from '@/components/forms/FormField';
import { useIsDark } from '@/hooks/useIsDark';

interface ImageUploadProps {
  label: string;
  hint: string;
  currentUrl?: string | null;
  bucket: string;
  path: string;
  height?: number;
  onUploaded: (url: string) => void;
  rounded?: boolean;
}

export function ImageUpload({ label, hint, currentUrl, bucket, path, height = 120, onUploaded, rounded = false }: ImageUploadProps) {
  const isDark = useIsDark();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);

  useEffect(() => { setPreview(currentUrl || null); }, [currentUrl]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fullPath = `${path}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(fullPath, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fullPath);
      setPreview(`${publicUrl}?t=${Date.now()}`);
      onUploaded(publicUrl);
    } catch (err: any) {
      alert(err.message ?? 'Erro ao fazer upload');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <FormField label={label} hint={hint}>
      <div
        onClick={() => !uploading && fileRef.current?.click()}
        className="relative overflow-hidden cursor-pointer transition-all group"
        style={{
          height,
          borderRadius: rounded ? '50%' : 14,
          width: rounded ? height : '100%',
          border: '2px dashed var(--input-border)',
          background: isDark ? 'rgba(99,102,241,0.04)' : 'rgba(99,102,241,0.02)',
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = '#6366F1')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--input-border)')}
      >
        {preview ? (
          <>
            <img src={preview} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
              <div className="flex items-center gap-2 text-white text-xs font-semibold">
                <Upload size={14} /> Trocar imagem
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            {uploading
              ? <Loader2 size={22} className="animate-spin" style={{ color: '#6366F1' }} />
              : <>
                  <Upload size={22} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Clique para upload</span>
                </>
            }
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
            <Loader2 size={22} className="animate-spin text-white" />
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </FormField>
  );
}
