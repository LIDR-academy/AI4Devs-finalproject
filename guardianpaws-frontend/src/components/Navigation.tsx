'use client';

import Link from 'next/link';
import { FaArrowLeft, FaBars } from 'react-icons/fa';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const showBackButton = pathname !== '/';
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-black py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Flecha de retorno (solo mobile) */}
          {showBackButton && (
            <Link href="/" className="md:hidden text-white hover:text-gray-300 transition-colors">
              <FaArrowLeft size={24} />
            </Link>
          )}
          <Link href="/" className="text-2xl font-bold text-white hover:text-gray-300 transition-colors">
            GuardianPaws
          </Link>
        </div>

        {/* Menú hamburguesa (solo desktop) */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="hidden md:flex text-white hover:text-gray-300 transition-colors"
        >
          <FaBars size={24} />
        </button>

        {/* Menú desplegable */}
        {isMenuOpen && (
          <div className="absolute top-16 right-4 bg-black/95 rounded-lg shadow-lg py-2 px-4 min-w-[200px] hidden md:block">
            <div className="space-y-2">
              <Link 
                href="/reportar" 
                className="block text-white hover:text-gray-300 py-2 transition-colors"
              >
                Reportar Animal Perdido
              </Link>
              <Link 
                href="/mis-reportes" 
                className="block text-white hover:text-gray-300 py-2 transition-colors"
              >
                Mis Reportes
              </Link>
              <Link 
                href="/explorar" 
                className="block text-white hover:text-gray-300 py-2 transition-colors"
              >
                Explorar Reportes
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 