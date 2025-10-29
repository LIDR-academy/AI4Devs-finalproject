import React from 'react';
import { useTranslation } from 'react-i18next';

interface DirectionFilterProps {
  label: string;
  value: 'TO_SEDE' | 'FROM_SEDE';
  onChange: (value: 'TO_SEDE' | 'FROM_SEDE') => void;
}

export default function DirectionFilter({ label, value, onChange }: DirectionFilterProps) {
  const { t } = useTranslation('trips');
  
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-sm text-gray-700">{label}</label>
      <select
        className="border rounded px-3 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value as 'TO_SEDE' | 'FROM_SEDE')}
      >
        <option value="TO_SEDE">{t('create.direction.toSede')}</option>
        <option value="FROM_SEDE">{t('create.direction.fromSede')}</option>
      </select>
    </div>
  );
}


