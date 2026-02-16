import React from 'react';

interface DatePickerProps {
    selectedDate: string;
    onChange: (date: string) => void;
    minDate?: string;
    label?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onChange, minDate, label }) => {
    const today = new Date().toISOString().split('T')[0];
    const minimum = minDate || today;

    return (
        <div className="w-full">
            {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
            <input
                type="date"
                value={selectedDate}
                onChange={(e) => onChange(e.target.value)}
                min={minimum}
                className="input-field"
            />
        </div>
    );
};
