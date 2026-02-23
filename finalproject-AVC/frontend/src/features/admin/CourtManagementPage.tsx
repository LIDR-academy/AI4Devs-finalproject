import React, { useState, useEffect } from 'react';
import { courtsApi } from '../../api/courtsApi';
import { Court } from '../../shared/types';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';

export const CourtManagementPage: React.FC = () => {
    const [courts, setCourts] = useState<Court[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [courtName, setCourtName] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingCourts, setLoadingCourts] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Load courts on component mount
    useEffect(() => {
        loadCourts();
    }, []);

    const loadCourts = async () => {
        try {
            setLoadingCourts(true);
            const data = await courtsApi.getCourts();
            setCourts(data);
        } catch (err: any) {
            setError('Error al cargar canchas');
        } finally {
            setLoadingCourts(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await courtsApi.createCourt(courtName);
            setSuccess(`Cancha "${courtName}" creada exitosamente`);
            setShowModal(false);
            setCourtName('');
            // Reload courts list
            await loadCourts();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al crear cancha');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Canchas</h1>
                <button onClick={() => setShowModal(true)} className="btn-primary">
                    + Crear Cancha
                </button>
            </div>

            {success && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                    {success}
                </div>
            )}

            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">{error}</div>
            )}

            {loadingCourts ? (
                <div className="flex justify-center items-center py-12">
                    <LoadingSpinner />
                </div>
            ) : courts.length === 0 ? (
                <div className="card text-center py-12">
                    <p className="text-gray-600 text-lg mb-2">No hay canchas creadas</p>
                    <p className="text-gray-500">Utiliza el botón "Crear Cancha" para agregar la primera cancha.</p>
                </div>
            ) : (
                <div className="card">
                    <h2 className="text-xl font-semibold mb-4">Canchas Disponibles</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nombre
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha de Creación
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {courts.map((court) => (
                                    <tr key={court.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{court.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    court.active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {court.active ? 'Activa' : 'Inactiva'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(court.createdAt).toLocaleDateString('es-AR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create Court Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h2 className="text-2xl font-semibold mb-4">Crear Nueva Cancha</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="courtName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre de la Cancha
                                </label>
                                <input
                                    id="courtName"
                                    type="text"
                                    value={courtName}
                                    onChange={(e) => setCourtName(e.target.value)}
                                    className="input-field"
                                    placeholder="Ej: Cancha 1, Cancha Central"
                                    required
                                    minLength={1}
                                    disabled={loading}
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    La cancha se creará como activa por defecto.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="submit" className="btn-primary flex-1" disabled={loading}>
                                    {loading ? 'Creando...' : 'Crear Cancha'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setError('');
                                    }}
                                    className="btn-secondary flex-1"
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
