import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Select } from '../ui';

export interface TripFilters {
  status: string;
  direction: string;
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
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const statusOptions = [
    { value: '', label: t('filters.allStatuses') },
    { value: 'ACTIVE', label: t('status.active') },
    { value: 'COMPLETED', label: t('status.completed') },
    { value: 'CANCELLED', label: t('status.cancelled') },
  ];

  const directionOptions = [
    { value: '', label: t('filters.allDirections') },
    { value: 'TO_SEDE', label: t('create.direction.toSede') },
    { value: 'FROM_SEDE', label: t('create.direction.fromSede') },
  ];

  const destinationOptions = [
    { value: '', label: t('filters.allDestinations') },
    { value: 'SEDE-1', label: t('sedes.SEDE-1') },
    { value: 'SEDE-2', label: t('sedes.SEDE-2') },
    { value: 'SEDE-3', label: t('sedes.SEDE-3') },
  ];

  // Calculate active filters count
  useEffect(() => {
    const count = Object.values(filters).filter(value => value !== '').length;
    setActiveFiltersCount(count);
  }, [filters]);

  // Load filters from localStorage on mount
  useEffect(() => {
    const savedFilters = localStorage.getItem('tripFilters');
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);
        onFiltersChange(parsed);
      } catch (error) {
        console.warn('Failed to parse saved filters:', error);
      }
    }
  }, [onFiltersChange]);

  // Save filters to localStorage when they change
  useEffect(() => {
    if (activeFiltersCount > 0) {
      localStorage.setItem('tripFilters', JSON.stringify(filters));
    } else {
      localStorage.removeItem('tripFilters');
    }
  }, [filters, activeFiltersCount]);

  const handleFilterChange = (field: keyof TripFilters, value: string) => {
    setIsAnimating(true);
    onFiltersChange({
      ...filters,
      [field]: value
    });
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleClearFilters = () => {
    setIsAnimating(true);
    onClearFilters();
    localStorage.removeItem('tripFilters');
    setTimeout(() => setIsAnimating(false), 300);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className={`bg-gray-50 p-4 rounded-lg space-y-4 transition-all duration-300 ${isAnimating ? 'scale-105' : 'scale-100'}`} data-testid="trip-filters">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium text-gray-900">{t('filters.title')}</h3>
          {activeFiltersCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 animate-pulse">
              {activeFiltersCount} {t('filters.active')}
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClearFilters}
            className="text-red-600 hover:text-red-700 transition-colors duration-200"
          >
            {t('filters.clearAll')}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Status filter */}
        <Select
          label={t('filters.status')}
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          options={statusOptions}
        />

        {/* Direction filter */}
        <Select
          label={t('filters.direction')}
          value={filters.direction}
          onChange={(e) => handleFilterChange('direction', e.target.value)}
          options={directionOptions}
        />

        {/* Destination filter */}
        <Select
          label={t('filters.destination')}
          value={filters.destination}
          onChange={(e) => handleFilterChange('destination', e.target.value)}
          options={destinationOptions}
        />

        {/* Date from */}
        <Input
          label={t('filters.dateFrom')}
          type="date"
          value={filters.dateFrom}
          onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
        />

        {/* Date to */}
        <Input
          label={t('filters.dateTo')}
          type="date"
          value={filters.dateTo}
          onChange={(e) => handleFilterChange('dateTo', e.target.value)}
        />
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.status && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {t('status.' + filters.status.toLowerCase())}
              <button
                onClick={() => handleFilterChange('status', '')}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.direction && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              {filters.direction === 'TO_SEDE' ? t('create.direction.toSede') : t('create.direction.fromSede')}
              <button
                onClick={() => handleFilterChange('direction', '')}
                className="ml-1 text-orange-600 hover:text-orange-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.destination && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {t('sedes.' + filters.destination)}
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
              {t('filters.from')}: {filters.dateFrom}
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
              {t('filters.to')}: {filters.dateTo}
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
