import React from 'react';
import { Link } from 'react-router-dom';
import { Court } from '../../../shared/types';

interface CourtCardProps {
    court: Court;
}

export const CourtCard: React.FC<CourtCardProps> = ({ court }) => {
    return (
        <div className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{court.name}</h3>
                <span className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full">Activa</span>
            </div>

            <div className="text-sm text-gray-600 mb-4">
                <p>🎾 Cancha de pádel profesional</p>
                <p>📍 SC Padel Club</p>
            </div>

            <Link to={`/courts/${court.id}/availability`} className="btn-primary w-full text-center block">
                Ver Disponibilidad
            </Link>
        </div>
    );
};
