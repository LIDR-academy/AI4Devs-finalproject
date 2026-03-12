import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { TripDto, TripCreateDto } from '../../types/api';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select, LoadingSpinner } from '../ui';
import { useValidation } from '../../utils/validation';

interface FormErrors {
  lat?: string;
  lng?: string;
  destinationSedeId?: string;
  dateTime?: string;
  seatsTotal?: string;
}

interface EditTripModalProps {
  trip: TripDto | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (tripId: string, data: TripCreateDto) => Promise<void>;
  loading?: boolean;
}

export const EditTripModal: React.FC<EditTripModalProps> = ({
  trip,
  isOpen,
  onClose,
  onSave,
  loading = false
}) => {
  const { t } = useTranslation(['trips', 'common']);
  const validation = useValidation();
  const [formData, setFormData] = useState<TripCreateDto>({
    origin: { lat: 0, lng: 0 },
    destinationSedeId: '',
    dateTime: '',
    seatsTotal: 1,
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Pre-fill form when trip changes
  useEffect(() => {
    if (trip && isOpen) {
      const tripDate = trip.dateTime ? new Date(trip.dateTime) : new Date();
      const localDateTime = new Date(tripDate.getTime() - tripDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

      setFormData({
        origin: trip.origin || { lat: 0, lng: 0 },
        destinationSedeId: trip.destinationSedeId || '',
        dateTime: localDateTime,
        seatsTotal: trip.seatsTotal || 1,
      });
      setFormErrors({});
      setTouched({});
    }
  }, [trip, isOpen]);

  const validateForm = (): FormErrors => {
    const errors: FormErrors = {};

    // Validar latitud
    if (formData.origin.lat === 0 && !touched.lat) {
      errors.lat = validation.coordinates.latitude.required();
    } else if (formData.origin.lat < -90 || formData.origin.lat > 90) {
      errors.lat = validation.coordinates.latitude.range();
    }

    // Validar longitud
    if (formData.origin.lng === 0 && !touched.lng) {
      errors.lng = validation.coordinates.longitude.required();
    } else if (formData.origin.lng < -180 || formData.origin.lng > 180) {
      errors.lng = validation.coordinates.longitude.range();
    }

    // Validar destino
    if (!formData.destinationSedeId || formData.destinationSedeId === '') {
      errors.destinationSedeId = validation.destination.required();
    }

    // Validar fecha y hora
    if (!formData.dateTime) {
      errors.dateTime = validation.date.required();
    } else {
      const selectedDate = new Date(formData.dateTime);
      const now = new Date();
      if (selectedDate <= now) {
        errors.dateTime = validation.date.future();
      }
    }

    // Validar asientos
    if (!formData.seatsTotal || formData.seatsTotal < 1) {
      errors.seatsTotal = validation.seats.min();
    } else if (formData.seatsTotal > 8) {
      errors.seatsTotal = validation.seats.max();
    }

    return errors;
  };

  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const errors = validateForm();
    setFormErrors(errors);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Si el campo ya fue tocado, revalidar inmediatamente
    if (touched[field]) {
      setTimeout(() => {
        const errors = validateForm();
        setFormErrors(errors);
      }, 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trip) return;

    // Marcar todos los campos como "touched" para mostrar errores
    setTouched({
      lat: true,
      lng: true,
      destinationSedeId: true,
      dateTime: true,
      seatsTotal: true,
    });

    // Validar formulario
    const errors = validateForm();
    setFormErrors(errors);

    // Si hay errores, no enviar
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      const payload: TripCreateDto = {
        ...formData,
        dateTime: new Date(formData.dateTime).toISOString(),
      };
      await onSave(trip.id, payload);
      onClose();
    } catch (error) {
      console.error('Error updating trip:', error);
    }
  };

  const sedeOptions = [
    { value: '', label: t('trips:sedes.select') },
    { value: 'SEDE-1', label: t('trips:sedes.SEDE-1') },
    { value: 'SEDE-2', label: t('trips:sedes.SEDE-2') },
    { value: 'SEDE-3', label: t('trips:sedes.SEDE-3') },
  ];

  if (!isOpen || !trip) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" data-testid="edit-trip-modal">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{t('trips:create.title')}</CardTitle>
              <Button
                variant="secondary"
                size="sm"
                onClick={onClose}
                disabled={loading}
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={`${t('trips:create.latitude')} *`}
                  type="number"
                  step="any"
                  value={formData.origin.lat}
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                    handleInputChange('origin', { ...formData.origin, lat: isNaN(val) ? 0 : val });
                  }}
                  onBlur={() => handleFieldBlur('lat')}
                  placeholder="40.4168"
                  error={touched.lat ? formErrors.lat : undefined}
                  required
                />
                <Input
                  label={`${t('trips:create.longitude')} *`}
                  type="number"
                  step="any"
                  value={formData.origin.lng}
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                    handleInputChange('origin', { ...formData.origin, lng: isNaN(val) ? 0 : val });
                  }}
                  onBlur={() => handleFieldBlur('lng')}
                  placeholder="-3.7038"
                  error={touched.lng ? formErrors.lng : undefined}
                  required
                />
              </div>

              <Select
                label={`${t('trips:create.destination')} *`}
                value={formData.destinationSedeId}
                onChange={(e) => handleInputChange('destinationSedeId', e.target.value)}
                onBlur={() => handleFieldBlur('destinationSedeId')}
                options={sedeOptions}
                error={touched.destinationSedeId ? formErrors.destinationSedeId : undefined}
                required
              />

              <Input
                label={`${t('trips:create.date')} *`}
                type="datetime-local"
                value={formData.dateTime}
                onChange={(e) => handleInputChange('dateTime', e.target.value)}
                onBlur={() => handleFieldBlur('dateTime')}
                error={touched.dateTime ? formErrors.dateTime : undefined}
                required
              />

              <Input
                label={`${t('trips:create.seatsTotal')} *`}
                type="number"
                min="1"
                max="8"
                value={formData.seatsTotal}
                onChange={(e) => {
                  const val = e.target.value === '' ? 1 : parseInt(e.target.value, 10);
                  handleInputChange('seatsTotal', isNaN(val) ? 1 : val);
                }}
                onBlur={() => handleFieldBlur('seatsTotal')}
                error={touched.seatsTotal ? formErrors.seatsTotal : undefined}
                helperText={t('trips:create.maxSeats')}
                required
              />

              <div className="flex space-x-4 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? t('trips:create.creating') : t('trips:actions.edit')}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  {t('trips:create.cancel')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
