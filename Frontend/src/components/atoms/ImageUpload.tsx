import { useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from './Button';

interface ImageUploadProps {
  value?: string | File;
  onChange?: (file: File | null) => void;
  error?: string;
}

/**
 * ImageUpload atom component
 * Component for optional image upload with preview
 * Follows Design System Guide: ghost button with camera icon, 48x48px thumbnail preview
 */
export const ImageUpload = ({ value, onChange, error }: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(
    typeof value === 'string' ? value : value ? URL.createObjectURL(value) : null,
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      onChange?.(file);
    }
  };

  const handleRemove = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onChange?.(null);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      {preview ? (
        <div className="relative inline-block">
          <img src={preview} alt="Recibo del gasto" className="w-12 h-12 rounded-lg object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 active:scale-95 active:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 transition-all"
            aria-label="Quitar imagen"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="w-full flex justify-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Subir imagen"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={handleButtonClick}
            className="flex items-center gap-2"
          >
            <Camera size={20} />
            <span>Añadir foto (Opcional)</span>
          </Button>
        </div>
      )}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
