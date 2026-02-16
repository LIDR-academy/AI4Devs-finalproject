# HU3-BE-001: Endpoint de Búsqueda de Médicos

## Información General
- **ID**: HU3-BE-001
- **Historia de Usuario**: HU3 - Búsqueda de Médicos
- **Tipo**: Backend
- **Prioridad**: Alta
- **Estimación**: 15 horas (2.5 story points)
- **Dependencias**: HU3-DB-001 (Tabla SPECIALTIES), HU2-DB-001 (Tabla DOCTORS)

## Descripción
Implementar endpoint GET `/api/v1/doctors` que permite buscar médicos por especialidad y proximidad geográfica usando fórmula Haversine, con fallback a búsqueda por código postal, filtro por disponibilidad, cache en Redis, y paginación.

## Criterios de Aceptación

### CA1: Autenticación Requerida
- [ ] Endpoint requiere autenticación JWT (Bearer token)
- [ ] Retornar error 401 si no hay token o es inválido
- [ ] Verificar que token contenga role="patient"

### CA2: Búsqueda por Proximidad (coordenadas)
- [ ] Si se proporcionan coordenadas (lat, lng):
  - Calcular distancia usando fórmula Haversine en MySQL
  - Filtrar médicos dentro del radio especificado (por defecto 5km)
  - Ordenar por distancia (más cercanos primero)
  - Mostrar distancia en kilómetros para cada médico
- [ ] Solo mostrar médicos con verification_status='approved'
- [ ] Solo mostrar médicos con deleted_at IS NULL

### CA3: Búsqueda por Código Postal (fallback)
- [ ] Si no hay coordenadas pero hay código postal:
  - Filtrar médicos por código postal
  - Ordenar por especialidad y rating promedio
  - No mostrar distancia

### CA4: Filtro por Disponibilidad
- [ ] Si se proporciona fecha:
  - Mostrar solo médicos con slots disponibles en esa fecha
  - Verificar que slots tengan is_available=true
  - Verificar que slots no estén bloqueados

### CA5: Cache
- [ ] Cachear resultados en Redis:
  - Key: `doctors:{specialty}:{lat}:{lng}:{radius}:{date}`
  - TTL: 10 minutos
  - Retornar desde cache si existe

### CA6: Paginación
- [ ] Por defecto: 20 resultados por página
- [ ] Máximo: 50 resultados por página
- [ ] Incluir información de paginación en respuesta

## Pasos Técnicos Detallados

### 1. Crear Servicio de Búsqueda
**Ubicación**: `backend/src/services/doctor-search.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from '../entities/doctor.entity';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class DoctorSearchService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async searchDoctors(filters: SearchFilters): Promise<SearchResult> {
    // Generar clave de cache
    const cacheKey = this.generateCacheKey(filters);
    
    // Verificar cache
    const cached = await this.cacheManager.get<SearchResult>(cacheKey);
    if (cached) {
      return cached;
    }

    let query = this.doctorRepository
      .createQueryBuilder('doctor')
      .innerJoin('doctor.user', 'user')
      .where('doctor.verification_status = :status', { status: 'approved' })
      .andWhere('doctor.deleted_at IS NULL');

    // Filtro por especialidad
    if (filters.specialty) {
      query = query
        .innerJoin('doctor.specialties', 'specialty')
        .andWhere('specialty.id = :specialtyId', { specialtyId: filters.specialty });
    }

    // Búsqueda por proximidad (Haversine)
    if (filters.lat && filters.lng) {
      const radius = filters.radius || 5;
      query = query
        .select([
          'doctor.*',
          `(
            6371 * acos(
              cos(radians(:lat)) * cos(radians(doctor.latitude)) *
              cos(radians(doctor.longitude) - radians(:lng)) +
              sin(radians(:lat)) * sin(radians(doctor.latitude))
            )
          ) AS distance_km`,
        ])
        .setParameter('lat', filters.lat)
        .setParameter('lng', filters.lng)
        .having('distance_km <= :radius', { radius })
        .orderBy('distance_km', 'ASC');
    } else if (filters.postalCode) {
      // Búsqueda por código postal
      query = query
        .andWhere('doctor.postalCode = :postalCode', { postalCode: filters.postalCode })
        .orderBy('doctor.rating_average', 'DESC');
    }

    // Filtro por disponibilidad
    if (filters.date) {
      query = query
        .innerJoin('doctor.slots', 'slot')
        .andWhere('slot.start_time >= :dateStart', {
          dateStart: `${filters.date} 00:00:00`,
        })
        .andWhere('slot.start_time < :dateEnd', {
          dateEnd: `${filters.date} 23:59:59`,
        })
        .andWhere('slot.is_available = :available', { available: true })
        .andWhere(
          '(slot.locked_until IS NULL OR slot.locked_until < NOW())',
        );
    }

    // Paginación
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 50);
    const skip = (page - 1) * limit;

    query = query.skip(skip).take(limit);

    const [doctors, total] = await query.getManyAndCount();

    const result: SearchResult = {
      doctors: doctors.map((doctor) => ({
        id: doctor.id,
        firstName: doctor.user.firstName,
        lastName: doctor.user.lastName,
        specialties: doctor.specialties,
        address: doctor.address,
        latitude: doctor.latitude,
        longitude: doctor.longitude,
        distanceKm: (doctor as any).distance_km,
        ratingAverage: doctor.ratingAverage,
        totalReviews: doctor.totalReviews,
        verificationStatus: doctor.verificationStatus,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Guardar en cache
    await this.cacheManager.set(cacheKey, result, 600); // 10 minutos

    return result;
  }

  private generateCacheKey(filters: SearchFilters): string {
    const parts = [
      'doctors',
      filters.specialty || 'all',
      filters.lat || '0',
      filters.lng || '0',
      filters.postalCode || '0',
      filters.radius || '5',
      filters.date || 'all',
    ];
    return parts.join(':');
  }
}
```

### 2. Crear Controlador
**Ubicación**: `backend/src/controllers/doctors.controller.ts`

```typescript
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { DoctorSearchService } from '../services/doctor-search.service';

@Controller('api/v1/doctors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DoctorsController {
  constructor(private readonly searchService: DoctorSearchService) {}

  @Get()
  @Roles('patient')
  async searchDoctors(@Query() filters: SearchFiltersDto) {
    return await this.searchService.searchDoctors(filters);
  }
}
```

## Archivos a Crear/Modificar

1. `backend/src/services/doctor-search.service.ts` - Servicio de búsqueda
2. `backend/src/controllers/doctors.controller.ts` - Controlador
3. `backend/src/dto/doctors/search-filters.dto.ts` - DTO de filtros

## Testing

Ver ticket HU3-TEST-001.
