import { useRef, useState, useEffect } from 'react';
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return undefined;
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [categories]);

  const getIcon = (category: ExpenseCategory) => {
    const iconName = category.icon?.toLowerCase() || category.name.toLowerCase();
    return categoryIconMap[iconName] || <ShoppingBag size={24} />;
  };

  return (
    <div className="w-full">
      <div className="-mx-6 relative">
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-2 w-8 bg-linear-to-r from-white to-transparent z-10 pointer-events-none" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-2 w-8 bg-linear-to-l from-white to-transparent z-10 pointer-events-none" />
        )}
        <div
          ref={scrollRef}
          className="overflow-x-auto overflow-y-hidden scrollbar-hide w-full category-scroll"
        >
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
            <div className="flex-shrink-0 w-8" aria-hidden="true" />
          </div>
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-500 px-6">{error}</p>}
    </div>
  );
};
