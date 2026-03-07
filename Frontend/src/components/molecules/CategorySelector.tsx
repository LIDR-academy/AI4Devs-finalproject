import { CategoryPill } from '../atoms/CategoryPill';
import type { ExpenseCategory } from '@/types/expense.types';
import { Utensils, Car, Home, Film, ShoppingBag, Coffee } from 'lucide-react';

interface CategorySelectorProps {
  categories: ExpenseCategory[];
  selectedCategoryId?: number;
  onSelect: (categoryId: number) => void;
  error?: string;
}

// Map category icons (fallback if icon string doesn't match)
const categoryIconMap: Record<string, React.ReactNode> = {
  comida: <Utensils size={24} />,
  transporte: <Car size={24} />,
  alojamiento: <Home size={24} />,
  entretenimiento: <Film size={24} />,
  compras: <ShoppingBag size={24} />,
  varios: <Coffee size={24} />,
};

/**
 * CategorySelector molecule component
 * Horizontal scrollable selector for expense categories
 * Follows Design System Guide: scroll horizontal of pills
 */
export const CategorySelector = ({
  categories,
  selectedCategoryId,
  onSelect,
  error,
}: CategorySelectorProps) => {
  const getIcon = (category: ExpenseCategory) => {
    // Try to match icon name from category
    const iconName = category.icon?.toLowerCase() || category.name.toLowerCase();
    return categoryIconMap[iconName] || <ShoppingBag size={24} />;
  };

  return (
    <div className="w-full">
      {/* Container that escapes Card padding: negative margin to use full width */}
      <div className="-mx-6">
        {/* Scroll container: must have defined width to enable overflow */}
        {/* Removed flex justify-center to allow native scroll behavior with mouse/trackpad/touch */}
        {/* touch-pan-x enables horizontal panning/scroll with touch devices */}
        <div className="overflow-x-auto overflow-y-hidden scrollbar-hide w-full category-scroll">
          {/* Content container: increased padding (px-8 = 32px) for better visual spacing from edges */}
          {/* Using inline-flex to allow natural width expansion for scroll */}
          {/* When content is smaller than container, it will be left-aligned but scrollable */}
          {/* When content is larger, it will scroll horizontally */}
          <div className="inline-flex gap-3 pb-2 px-8">
            {categories.map(category => (
              <CategoryPill
                key={category.id}
                icon={getIcon(category)}
                name={category.name}
                isSelected={selectedCategoryId === category.id}
                onClick={() => onSelect(category.id)}
              />
            ))}
            {/* Spacer to ensure last item is fully visible when scrolled to the end */}
            <div className="flex-shrink-0 w-8" aria-hidden="true" />
          </div>
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-500 px-6">{error}</p>}
    </div>
  );
};
