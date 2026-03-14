import { AppDataSource } from '../config/database';
import { Doctor } from '../models/doctor.entity';
import { SearchFiltersDto } from '../dto/doctors/search-filters.dto';
import redisClient from '../config/redis';
import { logger } from '../utils/logger';

export interface DoctorSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  specialties: Array<{
    id: string;
    nameEs: string;
    nameEn: string;
    isPrimary: boolean;
  }>;
  address: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
  ratingAverage?: number;
  totalReviews: number;
  verificationStatus: string;
}

export interface SearchResult {
  doctors: DoctorSearchResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class DoctorSearchService {
  private get doctorRepository() {
    if (!AppDataSource.isInitialized) {
      throw new Error('DataSource no está inicializado');
    }
    return AppDataSource.getRepository(Doctor);
  }

  private generateCacheKey(filters: SearchFiltersDto): string {
    const parts = [
      'doctors',
      filters.specialty || 'all',
      filters.lat?.toFixed(4) || '0',
      filters.lng?.toFixed(4) || '0',
      filters.postalCode || '0',
      (filters.radius || 5).toString(),
      filters.date || 'all',
      (filters.page || 1).toString(),
      (filters.limit || 20).toString(),
    ];
    return parts.join(':');
  }

  async searchDoctors(filters: SearchFiltersDto): Promise<SearchResult> {
    try {
      // Asegurar que el DataSource esté inicializado
      if (!AppDataSource.isInitialized) {
        throw new Error('DataSource no está inicializado');
      }

      // Generar clave de cache
      const cacheKey = this.generateCacheKey(filters);

      // Verificar cache
      if (redisClient.isOpen) {
        try {
          const cached = await redisClient.get(cacheKey);
          if (cached) {
            logger.debug('Cache hit para búsqueda de médicos:', cacheKey);
            return JSON.parse(cached);
          }
        } catch (cacheError) {
          logger.warn('Error al leer cache:', cacheError);
        }
      }

      // Construir query base
      const queryBuilder = this.doctorRepository
        .createQueryBuilder('doctor')
        .innerJoinAndSelect('doctor.user', 'user')
        .where('doctor.verification_status = :status', { status: 'approved' });

      // Filtro por especialidad usando EXISTS para evitar problemas con joins y ordenamiento
      if (filters.specialty) {
        queryBuilder.andWhere(
          `EXISTS (
            SELECT 1 FROM DOCTOR_SPECIALTIES ds
            INNER JOIN SPECIALTIES s ON ds.specialty_id = s.id
            WHERE ds.doctor_id = doctor.id
            AND s.id = :specialtyId
            AND s.is_active = :isActive
          )`,
          {
            specialtyId: filters.specialty,
            isActive: true,
          }
        );
      }

      // Búsqueda por proximidad (Haversine)
      if (filters.lat && filters.lng) {
        const radius = filters.radius || 5;
        queryBuilder
          .addSelect(
            `(
              6371 * acos(
                cos(radians(:lat)) * cos(radians(doctor.latitude)) *
                cos(radians(doctor.longitude) - radians(:lng)) +
                sin(radians(:lat)) * sin(radians(doctor.latitude))
              )
            )`,
            'distance_km'
          )
          .setParameter('lat', filters.lat)
          .setParameter('lng', filters.lng)
          .having('distance_km <= :radius', { radius })
          .orderBy('distance_km', 'ASC');
        
        // Asegurar que solo se incluyan médicos con coordenadas
        queryBuilder.andWhere('doctor.latitude IS NOT NULL');
        queryBuilder.andWhere('doctor.longitude IS NOT NULL');
      } else {
        // Nota: No usar orderBy aquí cuando hay EXISTS porque causa problemas con TypeORM
        // El ordenamiento se hará en memoria después de obtener los resultados
        if (filters.postalCode) {
          // Búsqueda por código postal (fallback)
          queryBuilder.andWhere('doctor.postalCode = :postalCode', {
            postalCode: filters.postalCode,
          });
        }
      }

      // Filtro por disponibilidad (si hay tabla SLOTS en el futuro)
      // Por ahora, este filtro se omite hasta que se implemente HU4/HU8
      // if (filters.date) {
      //   queryBuilder
      //     .innerJoin('doctor.slots', 'slot')
      //     .andWhere('slot.start_time >= :dateStart', {
      //       dateStart: `${filters.date} 00:00:00`,
      //     })
      //     .andWhere('slot.start_time < :dateEnd', {
      //       dateEnd: `${filters.date} 23:59:59`,
      //     })
      //     .andWhere('slot.is_available = :available', { available: true })
      //     .andWhere(
      //       '(slot.locked_until IS NULL OR slot.locked_until < NOW())'
      //     );
      // }

      // Paginación
      const page = filters.page || 1;
      const limit = Math.min(filters.limit || 20, 50);
      const skip = (page - 1) * limit;

      queryBuilder.skip(skip).take(limit);

      // Ejecutar query
      // Si hay cálculo de distancia, usar getRawAndEntities para obtener el campo calculado
      let doctors: Doctor[];
      let total: number;
      let rawResults: any[] = [];

      if (filters.lat && filters.lng) {
        // Para queries con campos calculados, necesitamos usar getRawAndEntities
        // No cargar especialidades aquí para evitar problemas con TypeORM
        const result = await queryBuilder.getRawAndEntities();
        doctors = result.entities;
        rawResults = result.raw;
        
        // Cargar especialidades después para cada doctor
        if (doctors.length > 0) {
          await Promise.all(
            doctors.map((doctor) =>
              this.doctorRepository
                .createQueryBuilder('doctor')
                .leftJoinAndSelect('doctor.specialties', 'specialties')
                .where('doctor.id = :id', { id: doctor.id })
                .getOne()
                .then((loadedDoctor) => {
                  if (loadedDoctor) {
                    doctor.specialties = loadedDoctor.specialties;
                  }
                })
            )
          );
        }
        
        // Contar total (crear query separada sin campos calculados para el count)
        const countQueryBuilder = this.doctorRepository
          .createQueryBuilder('doctor')
          .innerJoin('doctor.user', 'user')
          .where('doctor.verification_status = :status', { status: 'approved' })
          .andWhere('doctor.latitude IS NOT NULL')
          .andWhere('doctor.longitude IS NOT NULL');

        if (filters.specialty) {
          countQueryBuilder.andWhere(
            `EXISTS (
              SELECT 1 FROM DOCTOR_SPECIALTIES ds
              INNER JOIN SPECIALTIES s ON ds.specialty_id = s.id
              WHERE ds.doctor_id = doctor.id
              AND s.id = :specialtyId
              AND s.is_active = :isActive
            )`,
            {
              specialtyId: filters.specialty,
              isActive: true,
            }
          );
        }

        // Aplicar filtro de distancia en el count
        const radius = filters.radius || 5;
        countQueryBuilder
          .andWhere(
            `(
              6371 * acos(
                cos(radians(:lat)) * cos(radians(doctor.latitude)) *
                cos(radians(doctor.longitude) - radians(:lng)) +
                sin(radians(:lat)) * sin(radians(doctor.latitude))
              )
            ) <= :radius`,
            { lat: filters.lat, lng: filters.lng, radius }
          );

        total = await countQueryBuilder.getCount();
      } else {
        // Para queries sin campos calculados, usar getMany() y getCount() por separado
        // para evitar problemas con EXISTS y ordenamiento
        doctors = await queryBuilder.getMany();
        
        // Ordenar en memoria por rating (ya que no podemos usar orderBy con EXISTS)
        doctors.sort((a, b) => {
          const ratingA = a.ratingAverage || 0;
          const ratingB = b.ratingAverage || 0;
          if (ratingB !== ratingA) {
            return ratingB - ratingA;
          }
          return (b.totalReviews || 0) - (a.totalReviews || 0);
        });
        
        // Cargar especialidades para cada doctor
        if (doctors.length > 0) {
          await Promise.all(
            doctors.map((doctor) =>
              this.doctorRepository
                .createQueryBuilder('doctor')
                .leftJoinAndSelect('doctor.specialties', 'specialties')
                .where('doctor.id = :id', { id: doctor.id })
                .getOne()
                .then((loadedDoctor) => {
                  if (loadedDoctor) {
                    doctor.specialties = loadedDoctor.specialties;
                  }
                })
            )
          );
        }
        
        // Contar total con query separada más simple (sin ordenamiento)
        const countQueryBuilder = this.doctorRepository
          .createQueryBuilder('doctor')
          .where('doctor.verification_status = :status', { status: 'approved' });

        if (filters.specialty) {
          countQueryBuilder.andWhere(
            `EXISTS (
              SELECT 1 FROM DOCTOR_SPECIALTIES ds
              INNER JOIN SPECIALTIES s ON ds.specialty_id = s.id
              WHERE ds.doctor_id = doctor.id
              AND s.id = :specialtyId
              AND s.is_active = :isActive
            )`,
            {
              specialtyId: filters.specialty,
              isActive: true,
            }
          );
        }

        if (filters.postalCode) {
          countQueryBuilder.andWhere('doctor.postalCode = :postalCode', {
            postalCode: filters.postalCode,
          });
        }

        total = await countQueryBuilder.getCount();
      }

      // Mapear resultados
      const result: SearchResult = {
        doctors: doctors.map((doctor, index) => {
          // Obtener distancia del raw result si existe (solo cuando hay campos calculados)
          const distanceKm = filters.lat && filters.lng && rawResults.length > 0 && rawResults[index]
            ? parseFloat(rawResults[index].distance_km || '0')
            : undefined;

          return {
            id: doctor.id,
            firstName: doctor.user.firstName,
            lastName: doctor.user.lastName,
            specialties: doctor.specialties?.map((spec) => ({
              id: spec.id,
              nameEs: spec.nameEs,
              nameEn: spec.nameEn,
              isPrimary: false, // TODO: Implementar cuando se agregue campo is_primary en relación
            })) || [],
            address: doctor.address,
            latitude: doctor.latitude || undefined,
            longitude: doctor.longitude || undefined,
            distanceKm: distanceKm,
            ratingAverage: doctor.ratingAverage || undefined,
            totalReviews: doctor.totalReviews,
            verificationStatus: doctor.verificationStatus,
          };
        }),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };

      // Guardar en cache (TTL: 10 minutos = 600 segundos)
      if (redisClient.isOpen) {
        try {
          await redisClient.setEx(cacheKey, 600, JSON.stringify(result));
          logger.debug('Resultado cacheado:', cacheKey);
        } catch (cacheError) {
          logger.warn('Error al guardar en cache:', cacheError);
        }
      }

      return result;
    } catch (error) {
      logger.error('Error en búsqueda de médicos:', error);
      throw error;
    }
  }
}
