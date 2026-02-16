import React, { useState } from 'react';
import { usersApi } from '../../api/usersApi';

export const UserManagementPage: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'PLAYER' | 'ADMIN'>('PLAYER');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await usersApi.createUser({ email, password, role });
            setSuccess(`Usuario ${email} creado exitosamente`);
            setShowModal(false);
            setEmail('');
            setPassword('');
            setRole('PLAYER');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al crear usuario');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
                <button onClick={() => setShowModal(true)} className="btn-primary">
                    + Crear Usuario
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

            <div className="card">
                <p className="text-gray-600">
                    Utiliza el botón "Crear Usuario" para agregar nuevos jugadores o administradores al sistema.
                </p>
            </div>

            {/* Create User Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h2 className="text-2xl font-semibold mb-4">Crear Nuevo Usuario</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Correo Electrónico
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field"
                                    placeholder="usuario@email.com"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Contraseña
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                    Rol
                                </label>
                                <select
                                    id="role"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as 'PLAYER' | 'ADMIN')}
                                    className="input-field"
                                    disabled={loading}
                                >
                                    <option value="PLAYER">Jugador</option>
                                    <option value="ADMIN">Administrador</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="submit" className="btn-primary flex-1" disabled={loading}>
                                    {loading ? 'Creando...' : 'Crear Usuario'}
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
