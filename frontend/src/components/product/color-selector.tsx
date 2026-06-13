interface ColorSelectorProps {
  colors: string[];
  selectedColor: string | null;
  onSelect: (color: string) => void;
}

export function ColorSelector({ colors, selectedColor, onSelect }: ColorSelectorProps) {
  if (colors.length === 0) return null;

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">Color</p>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => {
          const isSelected = color === selectedColor;
          return (
            <button
              key={color}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(color)}
              className={`px-3 py-1.5 text-sm rounded border transition ${
                isSelected
                  ? 'ring-2 ring-blue-600 bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 text-gray-700 hover:border-blue-600'
              }`}
            >
              {color}
            </button>
          );
        })}
      </div>
    </div>
  );
}
