import React from 'react';

const Header = () => {
  return (
    <div className="relative h-[300px] w-full">
      {/* Imagen de Fondo */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/hero-bg.jpg')",
          filter: "brightness(0.8)"
        }}
      />
      
      {/* Contenido */}
      <div className="relative h-full flex flex-col items-center justify-center px-4 space-y-6">
        <h1 className="text-4xl font-bold text-white text-center">
          Encuentra a tu amigo peludo: Perdido o en adopción
        </h1>
        
        {/* Barra de Búsqueda */}
        <div className="w-full max-w-2xl">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar animales perdidos o en adopción"
              className="w-full px-6 py-4 bg-black/70 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            />
            <button className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-transparent">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header; 