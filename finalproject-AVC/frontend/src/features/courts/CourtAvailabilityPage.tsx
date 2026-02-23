import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courtsApi } from '../../api/courtsApi';
import { TimeSlot } from '../../shared/types';
import { DatePicker } from '../../shared/components/DatePicker';
import { TimeSlotGrid } from './components/TimeSlotGrid';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';
import { useToast } from '../../shared/components/ToastContext';
import { useAuth } from '../auth/AuthContext';

export const CourtAvailabilityPage: React.FC = () => {
    const { courtId } = useParams<{ courtId: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { isAuthenticated } = useAuth();

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [loading, setLoading] = useState(false);
    const [courtName, setCourtName] = useState('');

    useEffect(() => {
        const fetchAvailability = async () => {
            if (!courtId) return;

            setLoading(true);
            try {
                const data = await courtsApi.getCourtAvailability(courtId, selectedDate);
                setTimeSlots(data);

                // Get court name from courts list
                const courts = await courtsApi.getCourts();
                const court = courts.find((c) => c.id === courtId);
                if (court) {
                    setCourtName(court.name);
                }
            } catch (error: any) {
                showToast(
                    error.response?.data?.message || 'Error al cargar la disponibilidad',
                    'error'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchAvailability();
    }, [courtId, selectedDate, showToast]);

    const handleReserve = () => {
        if (!isAuthenticated) {
            showToast('Debes iniciar sesión para reservar', 'info');
            navigate('/login');
            return;
        }

        if (!selectedSlot) {
            showToast('Selecciona un horario para reservar', 'info');
            return;
        }

        // Navigate to reservation confirmation (will implement in next tickets)
        navigate('/reservations/create', {
            state: {
                courtId,
                courtName,
                startTime: selectedSlot.startTime,
                endTime: selectedSlot.endTime,
            },
        });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <button onClick={() => navigate('/courts')} className="text-primary-600 hover:text-primary-700 mb-4">
                    ← Volver a canchas
                </button>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {courtName || 'Cancha'} - Disponibilidad
                </h1>
                <p className="text-gray-600">Selecciona una fecha y horario para tu reserva</p>
            </div>

            {/* Date Picker */}
            <div className="card mb-6">
                <DatePicker
                    selectedDate={selectedDate}
                    onChange={setSelectedDate}
                    label="Selecciona una fecha"
                />
            </div>

            {/* Time Slots */}
            <div className="card">
                <h2 className="text-xl font-semibold mb-4">Horarios Disponibles</h2>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : timeSlots.length === 0 ? (
                    <div className="text-center py-12 text-gray-600">
                        No hay horarios disponibles para esta fecha
                    </div>
                ) : (
                    <>
                        <TimeSlotGrid
                            timeSlots={timeSlots}
                            onSelectSlot={setSelectedSlot}
                            selectedSlot={selectedSlot}
                        />

                        {selectedSlot && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Horario seleccionado:</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {new Date(selectedSlot.startTime).toLocaleTimeString('es-ES', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: false,
                                            })}{' '}
                                            -{' '}
                                            {new Date(selectedSlot.endTime).toLocaleTimeString('es-ES', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: false,
                                            })}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={handleReserve} 
                                        className="btn-primary"
                                        data-testid="reserve-button"
                                    >
                                        Reservar
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
