# HU3-FE-001: Búsqueda de Médicos por Especialidad y Proximidad

## Información General
- **ID**: HU3-FE-001
- **Historia de Usuario**: HU3 - Búsqueda de Médicos
- **Tipo**: Frontend
- **Prioridad**: Alta
- **Estimación**: 12 horas (2 story points)
- **Dependencias**: HU3-BE-001 (Endpoint de búsqueda), HU3-DB-001 (Tabla SPECIALTIES)

## Descripción
Implementar interfaz de búsqueda de médicos con filtros por especialidad, geolocalización del navegador, código postal, radio de búsqueda, y visualización en mapa de Google Maps con marcadores de médicos encontrados.

## Criterios de Aceptación

### CA1: Autenticación Requerida
- [ ] Verificar que el usuario esté autenticado antes de mostrar búsqueda
- [ ] Redirigir a login si no hay token válido

### CA2: Filtros de Búsqueda
- [ ] Selector de especialidad (dropdown con especialidades activas)
- [ ] Botón "Usar mi ubicación" para geolocalización
- [ ] Campo opcional para código postal (fallback)
- [ ] Selector de radio de búsqueda (1-50km, por defecto 5km)
- [ ] Filtro opcional por fecha para ver disponibilidad

### CA3: Geolocalización
- [ ] Solicitar permiso de ubicación al navegador
- [ ] Obtener coordenadas (lat, lng) del navegador
- [ ] Mostrar marcador del usuario en el mapa
- [ ] Si se deniega, mostrar campo de código postal como obligatorio

### CA4: Resultados de Búsqueda
- [ ] Mostrar lista de médicos encontrados con:
  - Nombre completo
  - Especialidades
  - Dirección
  - Distancia en km (si búsqueda por coordenadas)
  - Rating promedio y total de reseñas
  - Botones "Ver perfil" y "Ver disponibilidad"

### CA5: Visualización en Mapa
- [ ] Mostrar mapa de Google Maps con:
  - Marcador del usuario (si hay geolocalización)
  - Marcadores de todos los médicos encontrados
  - InfoWindow al hacer clic en marcador
  - Zoom automático para mostrar todos los marcadores

### CA6: Paginación
- [ ] Implementar paginación (20 resultados por página, máximo 50)
- [ ] Mostrar información de paginación (página actual, total de páginas, total de resultados)

### CA7: Internacionalización
- [ ] Todos los textos en español e inglés
- [ ] Nombres de especialidades en idioma seleccionado

## Pasos Técnicos Detallados

### 1. Crear Componente de Búsqueda
**Ubicación**: `frontend/src/components/search/DoctorSearch.tsx`

```typescript
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'next-intl';
import { GoogleMap, Marker, InfoWindow, useLoadScript } from '@react-google-maps/api';
import { useQuery } from '@tanstack/react-query';

interface SearchFilters {
  specialty: string;
  lat?: number;
  lng?: number;
  postalCode?: string;
  radius: number;
  date?: string;
  page: number;
  limit: number;
}

export default function DoctorSearch() {
  const { t } = useTranslation();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const { register, handleSubmit, watch, setValue } = useForm<SearchFilters>({
    defaultValues: {
      radius: 5,
      page: 1,
      limit: 20,
    },
  });

  const specialty = watch('specialty');
  const lat = watch('lat');
  const lng = watch('lng');
  const postalCode = watch('postalCode');
  const radius = watch('radius');
  const date = watch('date');

  // Solicitar geolocalización
  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setValue('lat', position.coords.latitude);
          setValue('lng', position.coords.longitude);
        },
        () => {
          // Usuario denegó geolocalización
          setValue('postalCode', '');
        },
      );
    }
  };

  // Query de búsqueda con React Query
  const { data, isLoading, error } = useQuery({
    queryKey: ['doctors', { specialty, lat, lng, postalCode, radius, date }],
    queryFn: async () => {
      const params = new URLSearchParams({
        specialty: specialty || '',
        radius: radius.toString(),
        page: '1',
        limit: '20',
      });

      if (lat && lng) {
        params.append('lat', lat.toString());
        params.append('lng', lng.toString());
      } else if (postalCode) {
        params.append('postalCode', postalCode);
      }

      if (date) {
        params.append('date', date);
      }

      const response = await fetch(`/api/v1/doctors?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error en búsqueda');
      }

      return response.json();
    },
    enabled: !!specialty && (!!(lat && lng) || !!postalCode),
  });

  return (
    <div className="container mx-auto p-4">
      <form onSubmit={handleSubmit(() => {})} className="mb-6">
        {/* Selector de especialidad */}
        <select {...register('specialty')}>
          {/* Opciones de especialidades */}
        </select>

        {/* Botón de geolocalización */}
        <button type="button" onClick={requestLocation}>
          {t('search.useMyLocation')}
        </button>

        {/* Campo código postal */}
        {!userLocation && (
          <input
            {...register('postalCode')}
            placeholder={t('search.postalCode')}
            required
          />
        )}

        {/* Selector de radio */}
        <input
          type="range"
          min="1"
          max="50"
          {...register('radius')}
        />
        <span>{radius} km</span>

        {/* Filtro de fecha */}
        <input type="date" {...register('date')} />
      </form>

      {/* Mapa */}
      {isLoaded && (
        <div className="h-96 w-full mb-6">
          <GoogleMap
            zoom={userLocation ? 12 : 10}
            center={userLocation || { lat: 19.4326, lng: -99.1332 }}
            mapContainerClassName="w-full h-full"
          >
            {userLocation && (
              <Marker
                position={userLocation}
                label="U"
                title={t('search.yourLocation')}
              />
            )}
            {data?.doctors?.map((doctor) => (
              <Marker
                key={doctor.id}
                position={{ lat: doctor.latitude, lng: doctor.longitude }}
                onClick={() => setSelectedDoctor(doctor.id)}
              >
                {selectedDoctor === doctor.id && (
                  <InfoWindow>
                    <div>
                      <h3>{doctor.firstName} {doctor.lastName}</h3>
                      <p>{doctor.address}</p>
                    </div>
                  </InfoWindow>
                )}
              </Marker>
            ))}
          </GoogleMap>
        </div>
      )}

      {/* Lista de resultados */}
      <div className="space-y-4">
        {data?.doctors?.map((doctor) => (
          <div key={doctor.id} className="border p-4 rounded">
            <h3>{doctor.firstName} {doctor.lastName}</h3>
            <p>{doctor.address}</p>
            {doctor.distanceKm && <p>{doctor.distanceKm} km</p>}
            <p>⭐ {doctor.ratingAverage} ({doctor.totalReviews} reseñas)</p>
            <button onClick={() => router.push(`/doctors/${doctor.id}`)}>
              {t('search.viewProfile')}
            </button>
          </div>
        ))}
      </div>

      {/* Paginación */}
      {data?.pagination && (
        <div className="flex justify-between items-center mt-6">
          <button
            disabled={data.pagination.page === 1}
            onClick={() => setValue('page', data.pagination.page - 1)}
          >
            Anterior
          </button>
          <span>
            Página {data.pagination.page} de {data.pagination.totalPages}
          </span>
          <button
            disabled={data.pagination.page === data.pagination.totalPages}
            onClick={() => setValue('page', data.pagination.page + 1)}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
```

## Archivos a Crear/Modificar

1. `frontend/src/components/search/DoctorSearch.tsx` - Componente principal
2. `frontend/src/app/search/page.tsx` - Página de búsqueda
3. `frontend/src/hooks/useGeolocation.ts` - Hook de geolocalización

## Testing

Ver ticket HU3-TEST-001.
