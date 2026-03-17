import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MatchesService, BookingsService } from '../api';
import type { MatchDto } from '../types/api';
import { Button, Card, CardContent, Input, Select, LoadingSpinner } from '../components/ui';
import DirectionFilter from '../components/filters/DirectionFilter';
import MatchCard from '../components/matches/MatchCard';
import MatchFilters, { FilterOptions } from '../components/matches/MatchFilters';
import { TrustProfile } from '../components/trust/TrustProfile';
import { RatingForm } from '../components/trust/RatingForm';
import { SeatSelectionModalSimple as SeatSelectionModal } from '../components/booking/SeatSelectionModal.simple';

export default function Matches() {
  const { t } = useTranslation('matches');
  const [matches, setMatches] = useState<MatchDto[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<MatchDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [bookedTrips, setBookedTrips] = useState<Set<string>>(new Set());
  const [loadingBookings, setLoadingBookings] = useState(true);
  
  // Trust system state
  const [showTrustProfile, setShowTrustProfile] = useState<string | null>(null);
  const [showRatingForm, setShowRatingForm] = useState<string | null>(null);
  
  // Seat selection modal state
  const [seatSelectionModal, setSeatSelectionModal] = useState<{
    isOpen: boolean;
    match: MatchDto | null;
  }>({ isOpen: false, match: null });

  // Search form state
  const [searchParams, setSearchParams] = useState({
    direction: 'TO_SEDE' as 'TO_SEDE' | 'FROM_SEDE',
    destinationSedeId: '',
    originSedeId: '',
    time: '',
    origin: '',
  });

  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    minScore: 0,
    minSeats: 1,
    dateFrom: '',
    dateTo: '',
    sortBy: 'score',
    sortOrder: 'desc'
  });

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  // Cargar reservas existentes y parámetros de búsqueda al montar el componente
  useEffect(() => {
    loadExistingBookings();
    loadLastSearchParams();
  }, []);

  const loadLastSearchParams = () => {
    const savedParams = localStorage.getItem('lastSearchParams');
    if (savedParams) {
      try {
        const params = JSON.parse(savedParams);
        setSearchParams(params);
      } catch (error) {
        console.error('Error loading saved search params:', error);
      }
    }
  };

  const loadExistingBookings = async () => {
    try {
      setLoadingBookings(true);
      const bookings = await BookingsService.getMyBookings();
      // Extraer los tripIds de las reservas activas (no canceladas)
      const tripIds = bookings
        .filter(booking => booking.status !== 'CANCELLED')
        .map(booking => booking.tripId);
      setBookedTrips(new Set(tripIds));
    } catch (error) {
      console.error('Error loading bookings:', error);
      // No mostrar error al usuario, simplemente no marcar viajes
    } finally {
      setLoadingBookings(false);
    }
  };

  const sedeOptions = [
    { value: '', label: t('search.destinationPlaceholder') },
    { value: 'SEDE-1', label: t('sede.SEDE-1') },
    { value: 'SEDE-2', label: t('sede.SEDE-2') },
    { value: 'SEDE-3', label: t('sede.SEDE-3') },
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchParams.direction === 'TO_SEDE') {
      if (!searchParams.destinationSedeId) {
        alert(t('search.selectDestination'));
        return;
      }
    } else {
      if (!searchParams.originSedeId) {
        alert(t('search.selectOriginSede'));
        return;
      }
    }

    try {
      setSearching(true);
      const data = await MatchesService.findMatches(searchParams as any);
      setMatches(data);
      setFilteredMatches(data);
      
      // Save search params to localStorage
      localStorage.setItem('lastSearchParams', JSON.stringify(searchParams));
    } catch (error) {
      console.error('Error searching matches:', error);
      alert(t('match.searchError'));
    } finally {
      setSearching(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBooking = async (match: MatchDto) => {
    setSeatSelectionModal({ isOpen: true, match });
  };

  const handleViewProfile = (driverId: string) => {
    setShowTrustProfile(driverId);
  };

  const handleRate = (driverId: string) => {
    setShowRatingForm(driverId);
  };

  const handleFilteredMatches = (filtered: MatchDto[]) => {
    setFilteredMatches(filtered);
  };

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleSeatSelection = async (seats: number) => {
    const match = seatSelectionModal.match;
    if (!match) return;

    try {
      setBookingInProgress(match.tripId);
      await BookingsService.createBooking({
        tripId: match.tripId,
        seatsRequested: seats
      });
      
      // Marcar el viaje como reservado
      setBookedTrips(prev => new Set(prev).add(match.tripId));
      
      showMessage('success', t('match.bookingSuccess', { seats }));
      
      // Cerrar modal y recargar búsqueda para actualizar asientos disponibles
      setSeatSelectionModal({ isOpen: false, match: null });
      await handleSearch({ preventDefault: () => {} } as React.FormEvent);
    } catch (error: any) {
      console.error('Error creating booking:', error);
      const errorMsg = error?.response?.data?.message || error?.message || t('match.bookingError');
      showMessage('error', errorMsg);
    } finally {
      setBookingInProgress(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    if (score >= 0.4) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return t('match.score.excellent');
    if (score >= 0.6) return t('match.score.good');
    if (score >= 0.4) return t('match.score.regular');
    return t('match.score.low');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      {/* Search Form */}
      <Card>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <DirectionFilter
                label={t('search.direction')}
                value={searchParams.direction}
                onChange={(value) => handleInputChange('direction', value)}
              />

              {searchParams.direction === 'TO_SEDE' ? (
                <Select
                  label={t('search.destination')}
                  value={searchParams.destinationSedeId}
                  onChange={(e) => handleInputChange('destinationSedeId', e.target.value)}
                  options={sedeOptions}
                />
              ) : (
                <Select
                  label={t('search.originSede')}
                  value={searchParams.originSedeId}
                  onChange={(e) => handleInputChange('originSedeId', e.target.value)}
                  options={sedeOptions.map(o => ({ ...o, label: t('sede.' + (o.value || 'placeholder')) }))}
                />
              )}

              <Input
                label={t('search.time')}
                type="time"
                value={searchParams.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                placeholder={t('search.timePlaceholder')}
              />

              <Input
                label={t('search.origin')}
                type="text"
                value={searchParams.origin}
                onChange={(e) => handleInputChange('origin', e.target.value)}
                placeholder={t('search.originPlaceholder')}
                helperText={t('search.originHelper')}
              />
            </div>

            <div className="flex justify-center">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={searching}
                disabled={
                  searching ||
                  (searchParams.direction === 'TO_SEDE'
                    ? !searchParams.destinationSedeId
                    : !searchParams.originSedeId)
                }
              >
                {searching ? t('search.searching') : t('search.search')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-32">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Filters */}
      {matches.length > 0 && (
        <MatchFilters
          matches={matches}
          onFilteredMatches={handleFilteredMatches}
          onFiltersChange={handleFiltersChange}
        />
      )}

      {/* Results */}
      {filteredMatches.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('results.title', { count: filteredMatches.length })}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                isBooked={bookedTrips.has(match.tripId)}
                isBookingInProgress={bookingInProgress === match.tripId}
                onBook={handleBooking}
                onViewProfile={handleViewProfile}
                onRate={handleRate}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && matches.length === 0 && searchParams.destinationSedeId && (
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('results.empty')}</h3>
              <p className="text-gray-500 mb-4">
                {t('results.tryDifferent')}
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchParams({ direction: 'TO_SEDE', destinationSedeId: '', originSedeId: '', time: '', origin: '' });
                  setMatches([]);
                  setFilteredMatches([]);
                }}
              >
                {t('results.clearSearch')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Filtered Results */}
      {!loading && matches.length > 0 && filteredMatches.length === 0 && (
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('results.noFilteredResults')}</h3>
              <p className="text-gray-500 mb-4">
                {t('results.tryDifferentFilters')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Initial State */}
      {!loading && matches.length === 0 && !searchParams.destinationSedeId && (
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('results.initialTitle')}</h3>
              <p className="text-gray-500">
                {t('results.initialDescription')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trust Profile Modal */}
      {showTrustProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999] modal-overlay">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{t('modals.trustProfile.title')}</h2>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowTrustProfile(null)}
                >
                  {t('modals.trustProfile.close')}
                </Button>
              </div>
              <TrustProfile userId={showTrustProfile} />
            </div>
          </div>
        </div>
      )}

      {/* Rating Form Modal */}
      {showRatingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999] modal-overlay">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{t('modals.rating.title')}</h2>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowRatingForm(null)}
                >
                  {t('modals.rating.close')}
                </Button>
              </div>
              <RatingForm
                ratedUserId={showRatingForm}
                onSuccess={() => {
                  setShowRatingForm(null);
                  showMessage('success', t('modals.rating.success'));
                }}
                onCancel={() => setShowRatingForm(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Seat Selection Modal */}
      <SeatSelectionModal
        isOpen={seatSelectionModal.isOpen}
        onClose={() => setSeatSelectionModal({ isOpen: false, match: null })}
        onConfirm={handleSeatSelection}
        maxSeats={seatSelectionModal.match?.seatsFree || 0}
        loading={bookingInProgress === seatSelectionModal.match?.tripId}
      />
    </div>
  );
}

