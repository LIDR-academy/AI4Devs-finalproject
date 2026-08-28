import React from 'react';

export interface SectionTabOption<T extends string> {
  value: T;
  label: string;
  id: string;
}

interface SectionTabsProps<T extends string> {
  section: T;
  options: SectionTabOption<T>[];
  onChange: (section: T) => void;
}

/**
 * Selector de 2+ pestañas compartido — antes duplicado casi idéntico entre
 * UserManagementPanel y CatalogManagementPanel (mismo patrón de botones
 * btn-primary/btn-secondary alternados, ver regla de reuso de SK-17).
 */
export function SectionTabs<T extends string>({ section, options, onChange }: SectionTabsProps<T>): React.ReactElement {
  return (
    <div className="section-tabs-container">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`btn-touch flex-1 ${section === option.value ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => onChange(option.value)}
          id={option.id}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
