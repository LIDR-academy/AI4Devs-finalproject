import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TripsService } from '../api/trips';
import { BookingsService } from '../api/bookings';
import type { TripDto, BookingDto } from '../types/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SelectWithChildren } from '../components/ui/Select';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

type HistoryItem = {
  id: string;
  type: 'trip' | 'booking';
  date: string;
  status: string;
  details: TripDto | BookingDto;
};

type FilterRole = 'all' | 'driver' | 'passenger';
type FilterStatus = 'all' | 'COMPLETED' | 'ACTIVE' | 'CANCELLED' | 'PENDING' | 'CONFIRMED';

export function History() {
  const { t } = useTranslation('history');
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [roleFilter, setRoleFilter] = useState<FilterRole>('all');

  // Stats
  const [stats, setStats] = useState({
    totalTrips: 0,
    co2Saved: 0,
    kmShared: 0,
  });

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [items, fromDate, toDate, statusFilter, roleFilter]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load trips and bookings in parallel
      const [trips, bookings] = await Promise.all([
        TripsService.getAllTrips(),
        BookingsService.getMyBookings(),
      ]);

      // Convert to history items
      const tripItems: HistoryItem[] = trips.map((trip) => ({
        id: trip.id,
        type: 'trip' as const,
        date: trip.dateTime,
        status: new Date(trip.dateTime) < new Date() ? 'COMPLETED' : 'ACTIVE',
        details: trip,
      }));

      const bookingItems: HistoryItem[] = bookings.map((booking) => ({
        id: booking.id,
        type: 'booking' as const,
        date: booking.id, // We'll use createdAt if available, otherwise id
        status: booking.status,
        details: booking,
      }));

      const allItems = [...tripItems, ...bookingItems];
      
      // Sort by date descending (most recent first)
      allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setItems(allItems);
      calculateStats(tripItems, bookingItems);
    } catch (err) {
      console.error('Error loading history:', err);
      setError(t('list.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...items];

    // Filter by date range
    if (fromDate) {
      filtered = filtered.filter((item) => new Date(item.date) >= new Date(fromDate));
    }
    if (toDate) {
      filtered = filtered.filter((item) => new Date(item.date) <= new Date(toDate));
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter((item) => {
        if (roleFilter === 'driver') return item.type === 'trip';
        if (roleFilter === 'passenger') return item.type === 'booking';
        return true;
      });
    }

    setFilteredItems(filtered);
  };

  const calculateStats = (trips: HistoryItem[], bookings: HistoryItem[]) => {
    const totalTrips = trips.length + bookings.length;
    const co2Saved = totalTrips * 2.3; // 2.3 kg CO2 per trip (average)
    const kmShared = totalTrips * 15; // 15 km per trip (average sede-sede)

    setStats({
      totalTrips,
      co2Saved: Math.round(co2Saved * 10) / 10,
      kmShared,
    });
  };

  const clearFilters = () => {
    setFromDate('');
    setToDate('');
    setStatusFilter('all');
    setRoleFilter('all');
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('title')}</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">{t('stats.totalTrips')}</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalTrips}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">{t('stats.co2Saved')}</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.co2Saved} {t('stats.co2Unit')}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">{t('stats.kmShared')}</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">{stats.kmShared} {t('stats.kmUnit')}</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('filters.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            label={t('filters.from')}
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <Input
            label={t('filters.to')}
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
          <SelectWithChildren
            label={t('filters.status')}
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value as FilterStatus)}
          >
            <option value="all">{t('status.all')}</option>
            <option value="COMPLETED">{t('status.COMPLETED')}</option>
            <option value="ACTIVE">{t('status.ACTIVE')}</option>
            <option value="CONFIRMED">{t('status.CONFIRMED')}</option>
            <option value="PENDING">{t('status.PENDING')}</option>
            <option value="CANCELLED">{t('status.CANCELLED')}</option>
          </SelectWithChildren>
          <SelectWithChildren
            label={t('filters.role')}
            value={roleFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRoleFilter(e.target.value as FilterRole)}
          >
            <option value="all">{t('role.all')}</option>
            <option value="driver">{t('role.driver')}</option>
            <option value="passenger">{t('role.passenger')}</option>
          </SelectWithChildren>
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="secondary" onClick={clearFilters}>
            {t('filters.clear')}
          </Button>
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* History List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <Card>
            <p className="text-center text-gray-500 py-8">
              {t('list.empty')}
            </p>
          </Card>
        ) : (
          filteredItems.map((item) => (
            <Card key={`${item.type}-${item.id}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {item.type === 'trip' ? t('role.driver') : t('role.passenger')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{formatDate(item.date)}</p>
                  {item.type === 'trip' && (
                    <div className="text-sm text-gray-900">
                      <p>
                        <span className="font-medium">{t('trip.destination')}:</span>{' '}
                        {(item.details as TripDto).destinationSedeId}
                      </p>
                      <p>
                        <span className="font-medium">{t('trip.seats')}:</span>{' '}
                        {(item.details as TripDto).seatsFree} /{' '}
                        {(item.details as TripDto).seatsTotal}
                      </p>
                    </div>
                  )}
                  {item.type === 'booking' && (
                    <div className="text-sm text-gray-900">
                      <p>
                        <span className="font-medium">{t('booking.tripId')}:</span>{' '}
                        {(item.details as BookingDto).tripId}
                      </p>
                      <p>
                        <span className="font-medium">{t('booking.seatsRequested')}:</span>{' '}
                        {(item.details as BookingDto).seatsRequested}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

