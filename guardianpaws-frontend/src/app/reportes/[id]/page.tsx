'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PotentialMatch from '@/components/PotentialMatch';
import { getReporteDetalle } from '@/services/api';

interface Reporte {
    id: string;
    mascota: {
        nombre: string;
        descripcion: string;
        imagenes: { url: string }[];
    };
    ubicacion: string;
    fechaReporte: string;
    coincidencias: {
        reporteId: string;
        similarity: number;
        mascota: {
            imagenes: { url: string }[];
        };
        ubicacion: string;
        fechaReporte: string;
    }[];
}

export default function ReporteDetalle() {
    const params = useParams();
    const id = params.id as string;
    const [reporte, setReporte] = useState<Reporte | null>(null);

    useEffect(() => {
        const fetchReporte = async () => {
            if (id) {
                try {
                    const data = await getReporteDetalle(id);
                    setReporte(data);
                } catch (error) {
                    console.error('Error fetching reporte:', error);
                }
            }
        };

        fetchReporte();
    }, [id]);

    const handleChatClick = () => {
        // Esta funcionalidad se implementará más adelante
        console.log('Chat functionality coming soon');
    };

    if (!reporte) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-gray-600">Cargando...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">
                Detalles del Reporte
            </h1>

            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    {reporte.mascota.nombre}
                </h2>
                <p className="text-gray-600 mb-4">
                    {reporte.mascota.descripcion}
                </p>
                <div className="space-y-2 text-gray-600">
                    <p className="text-sm">
                        <span className="font-medium">Ubicación:</span> {reporte.ubicacion}
                    </p>
                    <p className="text-sm">
                        <span className="font-medium">Fecha de reporte:</span>{' '}
                        {new Date(reporte.fechaReporte).toLocaleDateString()}
                    </p>
                </div>
            </div>

            {reporte.coincidencias && reporte.coincidencias.length > 0 && (
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                        Posibles Coincidencias
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reporte.coincidencias.map((coincidencia) => (
                            <PotentialMatch
                                key={coincidencia.reporteId}
                                similarity={coincidencia.similarity}
                                petImage={coincidencia.mascota.imagenes[0]?.url || ''}
                                location={coincidencia.ubicacion}
                                reportDate={coincidencia.fechaReporte}
                                onChatClick={handleChatClick}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
} 