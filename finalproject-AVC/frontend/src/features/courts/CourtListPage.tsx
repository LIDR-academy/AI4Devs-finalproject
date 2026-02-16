import React, { useEffect, useState } from 'react';
import { courtsApi } from '../../api/courtsApi';
import { Court } from '../../shared/types';
import { CourtCard } from './components/CourtCard';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';
import { useToast } from '../../shared/components/ToastContext';

export const CourtListPage: React.FC = () => {
    const [courts, setCourts] = useState<Court[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        const fetchCourts = async () => {
            try {
                const data = await courtsApi.getCourts();
                setCourts(data);
            } catch (error: any) {
                showToast(
                    error.response?.data?.message || 'Error al cargar las canchas',
                    'error'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchCourts();
    }, [showToast]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Canchas Disponibles</h1>
                <p className="text-gray-600">Selecciona una cancha para ver su disponibilidad y reservar</p>
            </div>

            {courts.length === 0 ? (
                <div className="card text-center py-12">
                    <p className="text-gray-600 text-lg">No hay canchas disponibles en este momento</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courts.map((court) => (
                        <CourtCard key={court.id} court={court} />
                    ))}
                </div>
            )}
        </div>
    );
};
