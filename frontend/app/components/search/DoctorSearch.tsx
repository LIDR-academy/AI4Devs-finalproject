'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { GoogleMap, Marker, InfoWindow, useLoadScript } from '@react-google-maps/api';
import { useQuery } from '@tanstack/react-query';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useAuthStore } from '@/store/authStore';
import {
  searchDoctors,
  getSpecialties,
  getLatestDoctors,
  type SearchFilters,
  type DoctorSearchResult,
  type SearchResult,
} from '@/lib/api/doctors';
import PageHeader from '@/app/components/ui/PageHeader';
import StateMessage from '@/app/components/ui/StateMessage';

const libraries: ('places' | 'drawing' | 'geometry' | 'visualization')[] = ['places'];

interface SearchFormData {
  specialty: string;
  postalCode: string;
  radius: number;
}

export default function DoctorSearch() {
  const t = useTranslations('search');
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || 'es';
  const { accessToken, user } = useAuthStore();
  const { location: userLocation, requestLocation, loading: locationLoading, error: locationError } = useGeolocation();
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  const initialSpecialty = searchParams.get('specialty')?.trim() || '';
  const initialPostalCode = searchParams.get('postalCode')?.trim() || '';
  const initialRadiusRaw = Number(searchParams.get('radius') || 5);
  const initialRadius = Number.isFinite(initialRadiusRaw)
    ? Math.min(Math.max(initialRadiusRaw, 1), 50)
    : 5;
  const parseOptionalNumber = (value: string | null) => {
    if (!value) {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };
  const initialLat = parseOptionalNumber(searchParams.get('lat'));
  const initialLng = parseOptionalNumber(searchParams.get('lng'));

  const { register, handleSubmit, watch, setValue } = useForm<SearchFormData>({
    defaultValues: {
      specialty: initialSpecialty,
      postalCode: initialPostalCode,
      radius: initialRadius,
    },
  });

  const specialty = watch('specialty');
  const postalCode = watch('postalCode');
  const radius = watch('radius');

  // Cargar Google Maps
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  // Obtener especialidades
  const { data: specialtiesData } = useQuery({
    queryKey: ['specialties'],
    queryFn: getSpecialties,
  });

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    const hasInitialLocation = initialLat !== undefined && initialLng !== undefined;
    const hasValidInitialSearch = !!initialSpecialty && (hasInitialLocation || !!initialPostalCode);

    setValue('specialty', initialSpecialty);
    setValue('postalCode', initialPostalCode);
    setValue('radius', initialRadius);
    setHasSearched(hasValidInitialSearch);
    setPage(1);
  }, [initialLat, initialLng, initialPostalCode, initialRadius, initialSpecialty, setValue]);

  // Búsqueda de médicos
  const effectiveLat = userLocation?.lat ?? initialLat;
  const effectiveLng = userLocation?.lng ?? initialLng;
  const searchFilters: SearchFilters = {
    specialty: specialty || undefined,
    lat: effectiveLat,
    lng: effectiveLng,
    postalCode: postalCode || undefined,
    radius: radius || 5,
    page,
    limit: 20,
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['doctors', searchFilters],
    queryFn: () => searchDoctors(searchFilters, accessToken),
    enabled:
      hasSearched &&
      (((effectiveLat !== undefined && effectiveLng !== undefined) || !!postalCode) && !!specialty),
  });

  const {
    data: latestDoctors,
    isLoading: isLoadingLatest,
    error: latestError,
  } = useQuery({
    queryKey: ['latest-doctors'],
    queryFn: () => getLatestDoctors(5),
    enabled: !hasSearched,
  });

  const latestSearchResult: SearchResult | undefined = latestDoctors
    ? {
        doctors: latestDoctors,
        pagination: {
          page: 1,
          limit: 5,
          total: latestDoctors.length,
          totalPages: 1,
        },
      }
    : undefined;

  const displayData = hasSearched ? data : latestSearchResult;
  const displayLoading = hasSearched ? isLoading : isLoadingLatest;
  const displayError = hasSearched ? error : latestError;

  const onSubmit = () => {
    const hasLocation = effectiveLat !== undefined && effectiveLng !== undefined;
    const hasPostalCode = !!postalCode.trim();

    if (!hasLocation && !hasPostalCode) {
      return;
    }

    setPage(1);
    setHasSearched(true);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calcular centro del mapa
  const mapCenter =
    userLocation || (initialLat !== undefined && initialLng !== undefined
      ? { lat: initialLat, lng: initialLng }
      : { lat: 19.4326, lng: -99.1332 }); // CDMX por defecto
  const mapZoom = userLocation ? 12 : 10;
  const isAuthenticated = !!accessToken && !!user;

  // Calcular bounds para zoom automático
  const calculateBounds = () => {
    if (!displayData?.doctors || displayData.doctors.length === 0) return null;

    const doctors = displayData.doctors.filter((d) => d.latitude && d.longitude);
    if (doctors.length === 0) return null;

    let minLat = doctors[0].latitude!;
    let maxLat = doctors[0].latitude!;
    let minLng = doctors[0].longitude!;
    let maxLng = doctors[0].longitude!;

    doctors.forEach((doctor) => {
      if (doctor.latitude && doctor.longitude) {
        minLat = Math.min(minLat, doctor.latitude);
        maxLat = Math.max(maxLat, doctor.latitude);
        minLng = Math.min(minLng, doctor.longitude);
        maxLng = Math.max(maxLng, doctor.longitude);
      }
    });

    if (userLocation) {
      minLat = Math.min(minLat, userLocation.lat);
      maxLat = Math.max(maxLat, userLocation.lat);
      minLng = Math.min(minLng, userLocation.lng);
      maxLng = Math.max(maxLng, userLocation.lng);
    }

    return {
      north: maxLat + 0.01,
      south: minLat - 0.01,
      east: maxLng + 0.01,
      west: minLng - 0.01,
    };
  };

  const bounds = calculateBounds();

  if (loadError) {
    return (
      <div className="container mx-auto p-4">
        <StateMessage message={t('googleMapsError')} variant="error" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <PageHeader
        title={t('title')}
        subtitle={t('searchHint')}
      />

      {/* Formulario de búsqueda */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-3 rounded-xl bg-white/95 p-4 text-slate-900 sm:grid-cols-2 lg:grid-cols-4"
        data-testid="doctor-search-form"
      >
        <div className="sm:col-span-2 lg:col-span-1">
          <label htmlFor="specialty" className="mb-1 block text-xs font-medium text-slate-700">
            {t('specialty')}
          </label>
          <select
            id="specialty"
            data-testid="search-specialty"
            {...register('specialty', { required: true })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
          >
            <option value="">{t('selectSpecialty')}</option>
            {specialtiesData?.map((spec) => (
              <option key={spec.id} value={spec.id}>
                {spec.nameEs}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2 lg:col-span-1">
          <label htmlFor="postalCode" className="mb-1 block text-xs font-medium text-slate-700">
            {t('postalCode')}
          </label>
          <input
            id="postalCode"
            type="text"
            data-testid="search-postalCode"
            {...register('postalCode')}
            placeholder={t('postalCodePlaceholder')}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-1">
          <label htmlFor="radius" className="mb-1 block text-xs font-medium text-slate-700">
            {t('radius')}
          </label>
          <select
            id="radius"
            data-testid="search-radius"
            {...register('radius', { valueAsNumber: true })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
          >
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={20}>20 km</option>
            <option value={30}>30 km</option>
            <option value={50}>50 km</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            data-testid="search-submit"
            disabled={
              isLoading ||
              !specialty ||
              ((effectiveLat === undefined || effectiveLng === undefined) && !postalCode.trim())
            }
            className="w-full rounded-md border border-[#0b7f6f] bg-[#0f9a86] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#0b7f6f] focus:outline-none focus:ring-2 focus:ring-[#0b7f6f]/50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-400"
          >
            {isLoading ? t('searching') : t('search')}
          </button>
        </div>

        {locationLoading ? (
          <p className="sm:col-span-2 lg:col-span-4 text-xs text-slate-600">
            {t('gettingLocation')}
          </p>
        ) : null}

        {(effectiveLat !== undefined && effectiveLng !== undefined) ? (
          <p className="sm:col-span-2 lg:col-span-4 text-xs text-emerald-700">
            {t('yourLocation')}
          </p>
        ) : null}

        {locationError ? (
          <p className="sm:col-span-2 lg:col-span-4 text-xs text-amber-700">{locationError}</p>
        ) : null}
      </form>

      {/* Mensajes de error */}
      {displayError && (
        <div className="mb-6">
          <StateMessage
            message={displayError instanceof Error ? displayError.message : t('searchError')}
            variant="error"
          />
        </div>
      )}

      {displayLoading ? (
        <div className="mb-6 mt-4">
          <StateMessage message={t('searching')} variant="info" />
        </div>
      ) : null}

      {/* Resultados */}
      {displayData && (
        <>
          <div className="mb-4 mt-6" data-testid="search-results-summary">
            <p className="text-sm text-slate-600">
              {hasSearched
                ? t('resultsFound', { count: displayData.pagination.total })
                : t('latestDoctorsFound', { count: displayData.pagination.total })}
            </p>
          </div>

          {displayData.doctors.length === 0 ? (
            <StateMessage message={hasSearched ? t('noResults') : t('noLatestDoctors')} variant="warning" />
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,420px)]">
              <div>
                {/* Lista de resultados */}
                <div className="mb-6 space-y-4" data-testid="search-results-list">
                  {displayData.doctors.map((doctor: DoctorSearchResult) => (
                    <div
                      key={doctor.id}
                      data-testid={`doctor-card-${doctor.id}`}
                      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                        <div className="flex-1">
                          <h3 className="mb-2 text-xl font-semibold text-slate-900">
                            {doctor.firstName} {doctor.lastName}
                          </h3>
                          <p className="mb-2 text-slate-600">{doctor.address}</p>
                          <div className="mb-2 flex flex-wrap gap-2">
                            {doctor.specialties.map((spec) => (
                              <span
                                key={spec.id}
                                className="rounded-full bg-emerald-50 px-2 py-1 text-sm text-emerald-700"
                              >
                                {spec.nameEs}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            {doctor.distanceKm !== undefined && (
                              <span>📍 {doctor.distanceKm.toFixed(2)} km</span>
                            )}
                            {doctor.ratingAverage !== undefined && (
                              <span>
                                ⭐ {doctor.ratingAverage.toFixed(1)} ({doctor.totalReviews}{' '}
                                {t('reviews')})
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2 md:mt-0">
                          <button
                            data-testid={`doctor-view-profile-${doctor.id}`}
                            onClick={() => router.push(`/${locale}/doctors/${doctor.id}`)}
                            className="rounded-md bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-200"
                          >
                            {t('viewProfile')}
                          </button>
                          <button
                            data-testid={`doctor-view-availability-${doctor.id}`}
                            onClick={() => {
                              if (!isAuthenticated) {
                                const next = `/${locale}/doctors/${doctor.id}/availability`;
                                router.push(`/${locale}/login?next=${encodeURIComponent(next)}`);
                                return;
                              }
                              router.push(`/${locale}/doctors/${doctor.id}/availability`);
                            }}
                            className="rounded-md bg-brand-600 px-4 py-2 text-white hover:bg-brand-700"
                          >
                            {t('viewAvailability')}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paginación */}
                {displayData.pagination.totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="rounded-md bg-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-300 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      {t('previous')}
                    </button>
                    <span className="text-slate-600">
                      {t('pageInfo', {
                        current: page,
                        total: displayData.pagination.totalPages,
                        count: displayData.pagination.total,
                      })}
                    </span>
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === displayData.pagination.totalPages}
                      className="rounded-md bg-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-300 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      {t('next')}
                    </button>
                  </div>
                )}
              </div>

              {isLoaded && (
                <div
                  className="h-[540px] w-full overflow-hidden rounded-xl border border-slate-200 shadow-sm lg:sticky lg:top-6"
                  data-testid="search-map"
                >
                  <GoogleMap
                    zoom={bounds ? undefined : mapZoom}
                    center={bounds ? undefined : mapCenter}
                    mapContainerClassName="h-full w-full"
                    options={{
                      disableDefaultUI: false,
                      zoomControl: true,
                      streetViewControl: false,
                    }}
                    onLoad={(map) => {
                      if (bounds) {
                        map.fitBounds(bounds);
                      }
                    }}
                  >
                    {/* Marcador del usuario */}
                    {userLocation && (
                      <Marker
                        position={userLocation}
                        label={{
                          text: 'U',
                          color: '#FFFFFF',
                          fontWeight: 'bold',
                        }}
                        title={t('yourLocation')}
                      />
                    )}

                    {/* Marcadores de médicos encontrados */}
                    {displayData.doctors
                      .filter((doctor) => doctor.latitude && doctor.longitude)
                      .map((doctor) => (
                        <Marker
                          key={doctor.id}
                          position={{ lat: doctor.latitude!, lng: doctor.longitude! }}
                          onClick={() => setSelectedDoctor(doctor.id)}
                          title={`${doctor.firstName} ${doctor.lastName}`}
                        >
                          {selectedDoctor === doctor.id && (
                            <InfoWindow onCloseClick={() => setSelectedDoctor(null)}>
                              <div className="p-2">
                                <h3 className="text-lg font-semibold">
                                  {doctor.firstName} {doctor.lastName}
                                </h3>
                                <p className="text-sm text-gray-600">{doctor.address}</p>
                                {doctor.distanceKm && (
                                  <p className="text-sm text-blue-600">
                                    {doctor.distanceKm.toFixed(2)} km
                                  </p>
                                )}
                                {doctor.ratingAverage && (
                                  <p className="text-sm">
                                    ⭐ {doctor.ratingAverage.toFixed(1)} ({doctor.totalReviews}{' '}
                                    {t('reviews')})
                                  </p>
                                )}
                              </div>
                            </InfoWindow>
                          )}
                        </Marker>
                      ))}
                  </GoogleMap>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
