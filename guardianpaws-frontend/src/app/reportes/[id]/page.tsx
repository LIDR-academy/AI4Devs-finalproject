'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PotentialMatch from '@/components/PotentialMatch';
import { getReporteDetalle } from '@/services/api';

interface Reporte {
    id: string;
    mascota: {
        id: string;
        nombre: string;
        tipo: string;
        raza: string;
        color: string;
        edad: number;
        descripcion: string;
        imagenes: { url: string }[];
        createdAt: string;
        updatedAt: string;
    };
    mascotaId: string;
    usuarioId: string;
    ubicacion: string;
    fechaReporte: string;
    estado: string;
    descripcion: string;
    encontrada: boolean;
    historiales: Array<{
        id: string;
        reporteId: string;
        estado: string;
        comentario: string;
        fechaCambio: string;
        email: string;
        telefono: string;
        createdAt: string;
        updatedAt: string;
    }>;
    email: string;
    telefono: string;
    createdAt: string;
    updatedAt: string;
}

export default function ReporteDetalle() {
    const params = useParams();
    const id = params?.id as string;
    const [reporte, setReporte] = useState<Reporte | null>(null);

    useEffect(() => {
        const fetchReporte = async () => {
            if (id) {
                try {
                    console.log("Fetching reporte with ID:", id);
                    const data = await getReporteDetalle(id);
                    console.log("Received data:", data);
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

    console.log("px ",reporte);
    if (!reporte) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-gray-600">Cargando...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-white-800 mb-8">
                Detalles del Reporte
            </h1>

            <div className="bg-black rounded-lg shadow-md p-6 mb-8">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sección de imágenes */}
                    <div className="md:w-1/2">
                        <div className="grid grid-cols-2 gap-4">
                            {reporte.mascota?.imagenes && reporte.mascota.imagenes.length > 0 ? (
                                reporte.mascota.imagenes.map((imagen, index) => (
                                    <div key={index} className="relative aspect-square">
                                        <img
                                            src={imagen.url}
                                            alt={`Imagen ${index + 1} de ${reporte.mascota?.nombre || 'mascota'}`}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                                    <p className="text-gray-500">No hay imágenes disponibles</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sección de información */}
                    <div className="md:w-1/2">
                        <h2 className="text-2xl font-semibold text-white-800 mb-4">
                            {reporte.mascota?.nombre || 'Sin nombre'}
                        </h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Tipo</p>
                                    <p className="font-medium">{reporte.mascota?.tipo || 'No especificado'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Raza</p>
                                    <p className="font-medium">{reporte.mascota?.raza || 'No especificada'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Edad</p>
                                    <p className="font-medium">{reporte.mascota?.edad ? `${reporte.mascota.edad} años` : 'No especificada'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Color</p>
                                    <p className="font-medium">{reporte.mascota?.color || 'No especificado'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Estado</p>
                                    <p className="font-medium capitalize">{reporte.estado || 'No especificado'}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Descripción de la mascota</p>
                                <p className="mt-1">{reporte.mascota?.descripcion || 'Sin descripción'}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Descripción del reporte</p>
                                <p className="mt-1">{reporte.descripcion || 'Sin descripción'}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Ubicación</p>
                                <p className="mt-1">{reporte.ubicacion || 'No especificada'}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Fecha de reporte</p>
                                <p className="mt-1">
                                    {reporte.fechaReporte ? new Date(reporte.fechaReporte).toLocaleDateString() : 'No especificada'}
                                </p>
                            </div>

                            <div className="border-t pt-4 mt-4">
                                <h3 className="text-lg font-semibold mb-3">Información de contacto</h3>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="mt-1">{reporte.email || 'No especificado'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Teléfono</p>
                                        <p className="mt-1">{reporte.telefono || 'No especificado'}</p>
                                    </div>
                                </div>
                            </div>

                            {reporte.historiales && reporte.historiales.length > 0 && (
                                <div className="border-t pt-4 mt-4">
                                    <h3 className="text-lg font-semibold mb-3">Historial de cambios</h3>
                                    <div className="space-y-2">
                                        {reporte.historiales.map((historial, index) => (
                                            <div key={historial.id} className="text-sm">
                                                <p className="font-medium">
                                                    {new Date(historial.fechaCambio).toLocaleDateString()}
                                                </p>
                                                <p className="text-gray-600">{historial.comentario}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 