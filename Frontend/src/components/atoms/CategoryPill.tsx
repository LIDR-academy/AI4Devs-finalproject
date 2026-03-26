import type { ReactNode } from 'react';

interface CategoryPillProps {
  icon: ReactNode;
  name: string;
  isSelected: boolean;
  onClick: () => void;
}

/**
 * CategoryPill atom component
 * Individual pill for category selection
 * Follows Design System Guide: rounded-xl, selected state with primary color
 */
export const CategoryPill = ({ icon, name, isSelected, onClick }: CategoryPillProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 px-3 py-3 rounded-xl transition-all min-w-[90px] max-w-[90px] flex-shrink-0 snap-start ${
        isSelected
          ? 'bg-violet-600 text-white hover:bg-violet-700 active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2'
      }`}
      aria-pressed={isSelected}
    >
      <span className="text-2xl flex-shrink-0">{icon}</span>
      <span className="text-xs font-medium text-center leading-tight break-words">{name}</span>
    </button>
  );
};
