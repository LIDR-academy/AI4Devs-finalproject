'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { GoogleMap, Marker, InfoWindow, useLoadScript } from '@react-google-maps/api';
import { useQuery } from '@tanstack/react-query';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useAuthStore } from '@/store/authStore';
import { searchDoctors, getSpecialties, type SearchFilters, type DoctorSearchResult } from '@/lib/api/doctors';

const libraries: ('places' | 'drawing' | 'geometry' | 'visualization')[] = ['places'];

interface SearchFormData {
  specialty: string;
  postalCode: string;
  radius: number;
  date?: string;
}

export default function DoctorSearch() {
  const t = useTranslations('search');
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'es';
  const { accessToken } = useAuthStore();
  const { location: userLocation, requestLocation, loading: locationLoading, error: locationError } = useGeolocation();
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { register, handleSubmit, watch, setValue } = useForm<SearchFormData>({
    defaultValues: {
      specialty: '',
      postalCode: '',
      radius: 5,
      date: '',
    },
  });

  const specialty = watch('specialty');
  const postalCode = watch('postalCode');
  const radius = watch('radius');
  const date = watch('date');

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

  // Búsqueda de médicos
  const searchFilters: SearchFilters = {
    specialty: specialty || undefined,
    lat: userLocation?.lat,
    lng: userLocation?.lng,
    postalCode: !userLocation && postalCode ? postalCode : undefined,
    radius: radius || 5,
    date: date || undefined,
    page,
    limit: 20,
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['doctors', searchFilters],
    queryFn: () => {
      if (!accessToken) {
        throw new Error('No autenticado');
      }
      return searchDoctors(searchFilters, accessToken);
    },
    enabled: (!!(userLocation?.lat && userLocation?.lng) || !!postalCode) && !!specialty && !!accessToken,
  });

  // Actualizar coordenadas cuando se obtiene la ubicación
  useEffect(() => {
    if (userLocation) {
      setValue('postalCode', '');
    }
  }, [userLocation, setValue]);

  const onSubmit = () => {
    setPage(1);
    refetch();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calcular centro del mapa
  const mapCenter = userLocation || { lat: 19.4326, lng: -99.1332 }; // CDMX por defecto
  const mapZoom = userLocation ? 12 : 10;

  // Calcular bounds para zoom automático
  const calculateBounds = () => {
    if (!data?.doctors || data.doctors.length === 0) return null;

    const doctors = data.doctors.filter((d) => d.latitude && d.longitude);
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {t('googleMapsError')}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>

      {/* Formulario de búsqueda */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Selector de especialidad */}
          <div>
            <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-2">
              {t('specialty')} *
            </label>
            <select
              id="specialty"
              {...register('specialty', { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('selectSpecialty')}</option>
              {specialtiesData?.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {spec.nameEs}
                </option>
              ))}
            </select>
          </div>

          {/* Botón de geolocalización */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={requestLocation}
              disabled={locationLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {locationLoading ? t('gettingLocation') : t('useMyLocation')}
            </button>
          </div>

          {/* Campo código postal (si no hay geolocalización) */}
          {!userLocation && (
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                {t('postalCode')} *
              </label>
              <input
                id="postalCode"
                type="text"
                {...register('postalCode', { required: !userLocation })}
                placeholder={t('postalCodePlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Selector de radio */}
          <div>
            <label htmlFor="radius" className="block text-sm font-medium text-gray-700 mb-2">
              {t('radius')}: {radius} km
            </label>
            <input
              id="radius"
              type="range"
              min="1"
              max="50"
              {...register('radius', { valueAsNumber: true })}
              className="w-full"
            />
          </div>

          {/* Filtro de fecha (opcional) */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              {t('date')} ({t('optional')})
            </label>
            <input
              id="date"
              type="date"
              {...register('date')}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {locationError && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
            {locationError}
          </div>
        )}

        <div className="mt-4">
          <button
            type="submit"
            disabled={isLoading || !specialty || (!userLocation && !postalCode)}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? t('searching') : t('search')}
          </button>
        </div>
      </form>

      {/* Mapa */}
      {isLoaded && (userLocation || (data && data.doctors.length > 0)) && (
        <div className="h-96 w-full mb-6 rounded-lg overflow-hidden shadow-md">
          <GoogleMap
            zoom={bounds ? undefined : mapZoom}
            center={bounds ? undefined : mapCenter}
            mapContainerClassName="w-full h-full"
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

            {/* Marcadores de médicos */}
            {data?.doctors
              ?.filter((doctor) => doctor.latitude && doctor.longitude)
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
                        <h3 className="font-semibold text-lg">
                          {doctor.firstName} {doctor.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{doctor.address}</p>
                        {doctor.distanceKm && (
                          <p className="text-sm text-blue-600">{doctor.distanceKm.toFixed(2)} km</p>
                        )}
                        {doctor.ratingAverage && (
                          <p className="text-sm">
                            ⭐ {doctor.ratingAverage.toFixed(1)} ({doctor.totalReviews} {t('reviews')})
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

      {/* Mensajes de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error instanceof Error ? error.message : t('searchError')}
        </div>
      )}

      {/* Resultados */}
      {data && (
        <>
          <div className="mb-4">
            <p className="text-gray-600">
              {t('resultsFound', { count: data.pagination.total })}
            </p>
          </div>

          {data.doctors.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
              {t('noResults')}
            </div>
          ) : (
            <>
              {/* Lista de resultados */}
              <div className="space-y-4 mb-6">
                {data.doctors.map((doctor: DoctorSearchResult) => (
                  <div
                    key={doctor.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {doctor.firstName} {doctor.lastName}
                        </h3>
                        <p className="text-gray-600 mb-2">{doctor.address}</p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {doctor.specialties.map((spec) => (
                            <span
                              key={spec.id}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded"
                            >
                              {spec.nameEs}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
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
                      <div className="flex gap-2 mt-4 md:mt-0">
                        <button
                          onClick={() => router.push(`/${locale}/doctors/${doctor.id}`)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          {t('viewProfile')}
                        </button>
                        <button
                          onClick={() =>
                            router.push(`/${locale}/doctors/${doctor.id}/availability`)
                          }
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          {t('viewAvailability')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginación */}
              {data.pagination.totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {t('previous')}
                  </button>
                  <span className="text-gray-600">
                    {t('pageInfo', {
                      current: page,
                      total: data.pagination.totalPages,
                      count: data.pagination.total,
                    })}
                  </span>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === data.pagination.totalPages}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {t('next')}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
