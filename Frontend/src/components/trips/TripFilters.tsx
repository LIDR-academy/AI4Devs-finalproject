import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Select } from '../ui';

export interface TripFilters {
  status: string;
  destination: string;
  dateFrom: string;
  dateTo: string;
}

interface TripFiltersProps {
  filters: TripFilters;
  onFiltersChange: (filters: TripFilters) => void;
  onClearFilters: () => void;
}

export const TripFilters: React.FC<TripFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  const { t } = useTranslation(['trips', 'common']);

  const statusOptions = [
    { value: '', label: t('trips:filters.allStatuses') },
    { value: 'ACTIVE', label: t('trips:status.active') },
    { value: 'COMPLETED', label: t('trips:status.completed') },
    { value: 'CANCELLED', label: t('trips:status.cancelled') },
  ];

  const destinationOptions = [
    { value: '', label: t('trips:filters.allDestinations') },
    { value: 'SEDE-1', label: t('trips:sedes.SEDE-1') },
    { value: 'SEDE-2', label: t('trips:sedes.SEDE-2') },
    { value: 'SEDE-3', label: t('trips:sedes.SEDE-3') },
  ];

  const handleFilterChange = (field: keyof TripFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-4" data-testid="trip-filters">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">{t('trips:filters.title')}</h3>
        {hasActiveFilters && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onClearFilters}
          >
            {t('trips:filters.clearAll')}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status filter */}
        <Select
          label={t('trips:filters.status')}
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          options={statusOptions}
        />

        {/* Destination filter */}
        <Select
          label={t('trips:filters.destination')}
          value={filters.destination}
          onChange={(e) => handleFilterChange('destination', e.target.value)}
          options={destinationOptions}
        />

        {/* Date from */}
        <Input
          label={t('trips:filters.dateFrom')}
          type="date"
          value={filters.dateFrom}
          onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
        />

        {/* Date to */}
        <Input
          label={t('trips:filters.dateTo')}
          type="date"
          value={filters.dateTo}
          onChange={(e) => handleFilterChange('dateTo', e.target.value)}
        />
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.status && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {t('trips:status.' + filters.status.toLowerCase())}
              <button
                onClick={() => handleFilterChange('status', '')}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.destination && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {t('trips:sedes.' + filters.destination)}
              <button
                onClick={() => handleFilterChange('destination', '')}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.dateFrom && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {t('trips:filters.from')}: {filters.dateFrom}
              <button
                onClick={() => handleFilterChange('dateFrom', '')}
                className="ml-1 text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.dateTo && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {t('trips:filters.to')}: {filters.dateTo}
              <button
                onClick={() => handleFilterChange('dateTo', '')}
                className="ml-1 text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
