import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TripsService } from '../api';
import type { TripDto, TripCreateDto } from '../types/api';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select, LoadingSpinner } from '../components/ui';
import { EditTripModal } from '../components/trips/EditTripModal';
import { TripCard } from '../components/trips/TripCard';
import { TripFilters, type TripFilters as TripFiltersType } from '../components/trips/TripFilters';
import { useValidation } from '../utils/validation';
import { env } from '../env';

interface FormErrors {
  lat?: string;
  lng?: string;
  direction?: string;
  destinationSedeId?: string;
  dateTime?: string;
  seatsTotal?: string;
}

export default function Trips() {
  const { t } = useTranslation(['trips', 'common']);
  const validation = useValidation();
  const [trips, setTrips] = useState<TripDto[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<TripDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // New states for enhanced UI
  const [editingTrip, setEditingTrip] = useState<TripDto | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filters, setFilters] = useState<TripFiltersType>({
    status: '',
    direction: '',
    destination: '',
    dateFrom: '',
    dateTo: ''
  });

  // Form state
  const [formData, setFormData] = useState<TripCreateDto>({
    origin: { lat: 0, lng: 0 },
    destinationSedeId: '',
    dateTime: '',
    seatsTotal: 1,
    direction: 'TO_SEDE',
  });

  useEffect(() => {
    loadTrips();
  }, []);

  // Apply filters when trips or filters change
  useEffect(() => {
    applyFilters();
  }, [trips, filters]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

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

    // Validar dirección
    if (!formData.direction) {
      errors.direction = validation.direction.required();
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

  const loadTrips = async () => {
    try {
      setLoading(true);
      const data = await TripsService.getAllTrips();
      setTrips(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading trips:', error);
      showMessage('error', t('messages.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Marcar todos los campos como "touched" para mostrar errores
    setTouched({
      lat: true,
      lng: true,
      direction: true,
      destinationSedeId: true,
      dateTime: true,
      seatsTotal: true,
    });

    // Validar formulario
    const errors = validateForm();
    setFormErrors(errors);

    // Si hay errores, no enviar
    if (Object.keys(errors).length > 0) {
      showMessage('error', t('messages.formErrors'));
      return;
    }

    try {
      setCreating(true);
      const payload: TripCreateDto = {
        ...formData,
        dateTime: new Date(formData.dateTime).toISOString(),
      };
      await TripsService.createTrip(payload);
      setShowCreateForm(false);
      setFormData({
        origin: { lat: 0, lng: 0 },
        destinationSedeId: '',
        dateTime: '',
        seatsTotal: 1,
        direction: 'TO_SEDE',
      });
      setFormErrors({});
      setTouched({});
      await loadTrips();
      showMessage('success', t('messages.createSuccess'));
    } catch (error) {
      console.error('Error creating trip:', error);
      showMessage('error', t('messages.createError'));
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (tripId: string) => {
    if (!window.confirm(t('messages.confirmDelete'))) {
      return;
    }
    try {
      setActionInProgress(tripId);
      await TripsService.deleteTrip(tripId);
      await loadTrips();
      showMessage('success', t('messages.deleteSuccess'));
    } catch (error) {
      console.error('Error deleting trip:', error);
      showMessage('error', t('messages.deleteError'));
    } finally {
      setActionInProgress(null);
    }
  };

  const handleIncreaseSeats = async (trip: TripDto) => {
    try {
      setActionInProgress(trip.id);
      await TripsService.updateTrip(trip.id, { seatsTotal: trip.seatsTotal + 1 });
      await loadTrips();
      showMessage('success', t('messages.seatsUpdated', { total: trip.seatsTotal + 1, free: trip.seatsFree + 1 }));
    } catch (error) {
      console.error('Error updating trip:', error);
      showMessage('error', t('messages.updateError'));
    } finally {
      setActionInProgress(null);
    }
  };

  // New functions for enhanced UI
  const applyFilters = () => {
    let filtered = [...trips];

    // Filter by status
    if (filters.status) {
      const now = new Date();
      filtered = filtered.filter(trip => {
        const tripDate = trip.dateTime ? new Date(trip.dateTime) : new Date(0);
        if (filters.status === 'ACTIVE') {
          return tripDate >= now;
        } else if (filters.status === 'COMPLETED') {
          return tripDate < now;
        }
        return true;
      });
    }

    // Filter by direction
    if (filters.direction) {
      filtered = filtered.filter(trip => trip.direction === filters.direction);
    }

    // Filter by destination
    if (filters.destination) {
      filtered = filtered.filter(trip => trip.destinationSedeId === filters.destination);
    }

    // Filter by date range
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(trip => {
        const tripDate = trip.dateTime ? new Date(trip.dateTime) : new Date(0);
        return tripDate >= fromDate;
      });
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(trip => {
        const tripDate = trip.dateTime ? new Date(trip.dateTime) : new Date(0);
        return tripDate <= toDate;
      });
    }

    setFilteredTrips(filtered);
  };

  const handleEditTrip = (trip: TripDto) => {
    setEditingTrip(trip);
    setShowEditModal(true);
  };

  const handleSaveTrip = async (tripId: string, data: TripCreateDto) => {
    setCreating(true);
    try {
      await TripsService.updateTrip(tripId, data);
      await loadTrips();
      showMessage('success', t('messages.tripUpdated'));
      setShowEditModal(false);
      setEditingTrip(null);
    } catch (error) {
      console.error('Error updating trip:', error);
      showMessage('error', t('messages.updateError'));
    } finally {
      setCreating(false);
    }
  };

  const handleFiltersChange = (newFilters: TripFiltersType) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      direction: '',
      destination: '',
      dateFrom: '',
      dateTo: ''
    });
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

  const sedeOptions = [
    { value: '', label: t('sedes.select') },
    { value: 'SEDE-1', label: t('sedes.SEDE-1') },
    { value: 'SEDE-2', label: t('sedes.SEDE-2') },
    { value: 'SEDE-3', label: t('sedes.SEDE-3') },
  ];

  const directionOptions = [
    { value: 'TO_SEDE', label: t('create.direction.toSede') },
    { value: 'FROM_SEDE', label: t('create.direction.fromSede') },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="trips-page">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t('list.title')}</h1>
        <Button
          variant="primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
          data-testid="create-trip-button"
        >
          {showCreateForm ? t('create.cancel') : t('create.title')}
        </Button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>{t('create.newTrip')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={`${t('create.latitude')} *`}
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
                  label={`${t('create.longitude')} *`}
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
                label={`${t('create.direction.label')} *`}
                value={formData.direction}
                onChange={(e) => handleInputChange('direction', e.target.value)}
                onBlur={() => handleFieldBlur('direction')}
                options={directionOptions}
                error={touched.direction ? formErrors.direction : undefined}
                required
                data-testid="direction-select"
              />

              <Select
                label={`${t('create.destination')} *`}
                value={formData.destinationSedeId}
                onChange={(e) => handleInputChange('destinationSedeId', e.target.value)}
                onBlur={() => handleFieldBlur('destinationSedeId')}
                options={sedeOptions}
                error={touched.destinationSedeId ? formErrors.destinationSedeId : undefined}
                required
                data-testid="destination-select"
              />

              <Input
                label={`${t('create.date')} *`}
                type="datetime-local"
                value={formData.dateTime}
                onChange={(e) => handleInputChange('dateTime', e.target.value)}
                onBlur={() => handleFieldBlur('dateTime')}
                error={touched.dateTime ? formErrors.dateTime : undefined}
                required
              />

              <Input
                label={`${t('create.seatsTotal')} *`}
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
                helperText={t('create.maxSeats')}
                required
              />

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  variant="primary"
                  loading={creating}
                  disabled={creating}
                >
                  {creating ? t('create.creating') : t('create.submit')}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCreateForm(false)}
                >
                  {t('create.cancel')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <TripFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />

      {/* Trips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(filteredTrips ?? []).map((trip) => (
          <TripCard
            key={trip.id}
            trip={trip}
            onEdit={handleEditTrip}
            onDelete={handleDelete}
            onIncreaseSeats={handleIncreaseSeats}
            actionInProgress={actionInProgress}
            loading={loading}
          />
        ))}
      </div>

      {filteredTrips.length === 0 && trips.length > 0 && (
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">{t('filters.noResults')}</p>
              <Button
                variant="secondary"
                className="mt-4"
                onClick={handleClearFilters}
              >
                {t('filters.clearAll')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {trips.length === 0 && (
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🚗</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('list.empty')}</h3>
              <p className="text-gray-500 mb-4">
                {t('list.emptyDescription')}
              </p>
              <Button variant="primary" onClick={() => setShowCreateForm(true)}>
                {t('list.createFirst')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Trip Modal */}
      <EditTripModal
        trip={editingTrip}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingTrip(null);
        }}
        onSave={handleSaveTrip}
        loading={creating}
      />
    </div>
  );
}

