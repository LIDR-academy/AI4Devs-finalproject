interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string | null;
  onSelect: (size: string) => void;
}

export function SizeSelector({ sizes, selectedSize, onSelect }: SizeSelectorProps) {
  if (sizes.length === 0) return null;

  return (
    <div data-testid="size-selector">
      <p className="text-sm font-medium text-gray-700 mb-2">Talla</p>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const isSelected = size === selectedSize;
          return (
            <button
              key={size}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(size)}
              className={`px-3 py-1.5 text-sm rounded border transition ${
                isSelected
                  ? 'ring-2 ring-blue-600 bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 text-gray-700 hover:border-blue-600'
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}
