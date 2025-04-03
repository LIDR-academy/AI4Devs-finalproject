'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { useMyReports } from '@/hooks/useMyReports';
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaPaw } from 'react-icons/fa';
import { useEmail } from '@/contexts/EmailContext';

export default function MyReportsPage() {
  const { currentUserEmail } = useEmail();
  const [searchTerm, setSearchTerm] = useState('');
  const { reports, loading, error } = useMyReports(currentUserEmail);

  const filteredReports = reports.filter(report =>
    report.mascota?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-300">Cargando reportes...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-500">Error al cargar los reportes: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">
              Mis Reportes
            </h1>
          </div>

          {/* Barra de búsqueda */}
          <div className="relative mb-8">
            <input
              type="text"
              placeholder="Buscar por nombre de mascota, ubicación o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          {/* Lista de reportes */}
          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FaPaw className="mx-auto text-4xl text-gray-600 mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                No hay reportes
              </h2>
              <p className="text-gray-400">
                Aún no has creado ningún reporte de mascota perdida
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.map((report) => (
                <Link
                  key={report.id}
                  href={`/reportes/${report.id}`}
                  className="bg-gray-900 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform duration-200"
                >
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={report.mascota?.imagenes[0]?.url || '/placeholder-pet.jpg'}
                      alt={report.mascota?.nombre || 'Sin nombre'}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {report.mascota?.nombre || 'Sin nombre'}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-400">
                        <FaMapMarkerAlt className="mr-2" />
                        <span>{report.ubicacion}</span>
                      </div>
                      <div className="flex items-center text-gray-400">
                        <FaCalendarAlt className="mr-2" />
                        <span>
                          {new Date(report.fechaReporte).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 text-gray-400 line-clamp-2">
                      {report.descripcion}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 