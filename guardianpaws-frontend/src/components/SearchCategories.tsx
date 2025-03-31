'use client';

import React from 'react';
import { FaPaw } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface CategoryProps {
  label: string;
  onClick: () => void;
  icon: string;
  description?: string;
}

const Category: React.FC<CategoryProps> = ({ label, onClick, icon, description }) => {
  return (
    <button
      onClick={onClick}
      className="category-card flex flex-col items-center justify-center gap-2"
    >
      <div className="text-text-primary">
        {icon}
      </div>
      <span className="text-sm text-text-secondary">{label}</span>
      {description && <span className="text-xs text-text-secondary">{description}</span>}
    </button>
  );
};

const SearchCategories: React.FC = () => {
  const router = useRouter();

  const categories = [
    { 
      label: 'Reporta Animal Perdido', 
      onClick: () => router.push('/reportar'),
      icon: '🔍'
    },
    { 
      label: 'Mis Reportes', 
      onClick: () => router.push('/mis-reportes'),
      icon: '📋',
      // description: 'Ver mis reportes y respuestas'
    },
    { 
      label: 'Explorar Reportes', 
      onClick: () => console.log('Explorar reportes'),
      icon: '🔎',
      // description: 'Ver reportes de animales perdidos'
    },
    { 
      label: 'Adopta', 
      onClick: () => console.log('Adoptar'),
      icon: '🏠'
    },
    { 
      label: 'Sé Voluntario', 
      onClick: () => console.log('Ser voluntario'),
      icon: '🤝'
    },
    { 
      label: 'Chat de Ayuda', 
      onClick: () => console.log('Chat de ayuda'),
      icon: '💬'
    },
    { 
      label: 'Dona', 
      onClick: () => console.log('Donar'),
      icon: '❤️'
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
            // description={category.description}
          />
        ))}
      </div>
    </section>
  );
};

export default SearchCategories; 