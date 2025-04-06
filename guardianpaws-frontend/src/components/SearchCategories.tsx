'use client';

import React from 'react';
import { FaPaw } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface CategoryProps {
  label: string;
  onClick: () => void;
  icon: string;
  description?: string;
  disabled?: boolean;
}

interface CategoryItem extends CategoryProps {
  disabled?: boolean;
}

const Category: React.FC<CategoryProps> = ({ label, onClick, icon, description, disabled }) => {
  return (
    <div className="flex flex-col">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`category-card flex flex-col items-center justify-center gap-2 h-full ${disabled ? 'opacity-40 cursor-not-allowed bg-gray-800' : ''}`}
      >
        <div className="text-text-primary">
          {icon}
        </div>
        <span className="text-sm text-text-secondary">{label}</span>
        {description && <span className="text-xs text-text-secondary">{description}</span>}
      {disabled && (
        <span className="text-xs text-gray-400 mt-1 text-center font-medium">Próximamente</span>
      )}
      </button>
    </div>
  );
};

const SearchCategories: React.FC = () => {
  const router = useRouter();

  const categories: CategoryItem[] = [
    { 
      label: 'Reporta Peludo Perdido o Encontrado', 
      onClick: () => router.push('/reportar'),
      icon: '🔍',
      disabled: false
    },
    { 
      label: 'Mis Reportes', 
      onClick: () => router.push('/mis-reportes'),
      icon: '📋',
      disabled: false
    },
    { 
      label: 'Explorar Reportes', 
      onClick: () => {},
      icon: '🔎',
      disabled: true
    },
    { 
      label: 'Adopta', 
      onClick: () => {},
      icon: '🏠',
      disabled: true
    },
    { 
      label: 'Sé Voluntario', 
      onClick: () => {},
      icon: '🤝',
      disabled: true
    },
    { 
      label: 'Chat de Ayuda', 
      onClick: () => {},
      icon: '💬',
      disabled: true
    },
    { 
      label: 'Dona', 
      onClick: () => {},
      icon: '❤️',
      disabled: true
    }
  ];

  return (
    <section className="w-full px-4 py-8 bg-bg-dark">
      <h2 className="text-2xl font-semibold text-text-primary mb-6">¿Cómo podemos ayudarte?</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category, index) => (
          <Category
            key={index}
            label={category.label}
            onClick={category.onClick}
            icon={category.icon}
            disabled={category.disabled}
          />
        ))}
      </div>
    </section>
  );
};

export default SearchCategories; 