import React from 'react';
import { TimeSlot } from '../../shared/types';

interface TimeSlotGridProps {
    timeSlots: TimeSlot[];
    onSelectSlot: (slot: TimeSlot) => void;
    selectedSlot?: TimeSlot | null;
}

export const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({ timeSlots, onSelectSlot, selectedSlot }) => {
    const formatTime = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const isSelected = (slot: TimeSlot) => {
        return selectedSlot?.startTime === slot.startTime && selectedSlot?.endTime === slot.endTime;
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {timeSlots.map((slot, index) => {
                const available = slot.available;
                const selected = isSelected(slot);

                return (
                    <button
                        key={index}
                        onClick={() => available && onSelectSlot(slot)}
                        disabled={!available}
                        className={`
                            p-4 rounded-lg border-2 transition-all
                            ${available
                                ? selected
                                    ? 'border-primary-600 bg-primary-50 text-primary-800'
                                    : 'border-gray-300 bg-white hover:border-primary-400 hover:bg-primary-50'
                                : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                            }
                        `}
                    >
                        <div className="text-sm font-semibold">
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </div>
                        <div className="text-xs mt-1">
                            {available ? (selected ? 'Seleccionado' : 'Disponible') : 'Ocupado'}
                        </div>
                    </button>
                );
            })}
        </div>
    );
};
