import { DoctorSearchService } from '../../../src/services/doctor-search.service';
import { AppDataSource } from '../../../src/config/database';
import { Doctor } from '../../../src/models/doctor.entity';
import { User } from '../../../src/models/user.entity';
import { Specialty } from '../../../src/models/specialty.entity';
import { SearchFiltersDto } from '../../../src/dto/doctors/search-filters.dto';
import {
  createTestUser,
  createTestDoctor,
  createTestSpecialty,
  assignSpecialtyToDoctor,
} from '../../helpers/factories';
import redisClient from '../../../src/config/redis';

// Mock de Redis
jest.mock('../../../src/config/redis', () => ({
  __esModule: true,
  default: {
    isOpen: false,
    get: jest.fn(),
    setEx: jest.fn(),
  },
}));

describe('DoctorSearchService', () => {
  let service: DoctorSearchService;
  let testDataSource = AppDataSource;

  beforeAll(async () => {
    // Inicializar base de datos si no está inicializada
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    testDataSource = AppDataSource;
    service = new DoctorSearchService();
  });

  afterEach(async () => {
    // Limpiar datos después de cada test
    await testDataSource.query('DELETE FROM DOCTOR_SPECIALTIES');
    await testDataSource.query('DELETE FROM DOCTORS');
    await testDataSource.query('DELETE FROM USERS');
    jest.clearAllMocks();
  });

  afterAll(async () => {
    if (testDataSource.isInitialized) {
      await testDataSource.destroy();
    }
  });

  describe('searchDoctors', () => {
    it('debe retornar médicos ordenados por distancia cuando se proporcionan coordenadas', async () => {
      // Crear especialidad
      const specialty = await createTestSpecialty(testDataSource);

      // Crear médicos
      const user1 = await createTestUser(testDataSource, { role: 'doctor' });
      const doctor1 = await createTestDoctor(testDataSource, user1, {
        latitude: 19.4326,
        longitude: -99.1332,
        verificationStatus: 'approved',
      });
      await assignSpecialtyToDoctor(testDataSource, doctor1, specialty);

      const user2 = await createTestUser(testDataSource, { role: 'doctor' });
      const doctor2 = await createTestDoctor(testDataSource, user2, {
        latitude: 19.3850,
        longitude: -99.1615,
        verificationStatus: 'approved',
      });
      await assignSpecialtyToDoctor(testDataSource, doctor2, specialty);

      const filters: SearchFiltersDto = {
        lat: 19.4326,
        lng: -99.1332,
        radius: 10,
        page: 1,
        limit: 20,
      };

      const result = await service.searchDoctors(filters);

      expect(result.doctors.length).toBeGreaterThan(0);
      expect(result.doctors[0]).toHaveProperty('distanceKm');
      // El médico más cercano debe estar primero
      if (result.doctors.length > 1) {
        expect(result.doctors[0].distanceKm).toBeLessThanOrEqual(
          result.doctors[1].distanceKm || Infinity
        );
      }
    });

    it('debe filtrar por código postal cuando se proporciona', async () => {
      const user = await createTestUser(testDataSource, { role: 'doctor' });
      await createTestDoctor(testDataSource, user, {
        postalCode: '06000',
        verificationStatus: 'approved',
      });

      const filters: SearchFiltersDto = {
        postalCode: '06000',
        page: 1,
        limit: 20,
      };

      const result = await service.searchDoctors(filters);

      expect(result.doctors.length).toBeGreaterThan(0);
      expect(result.doctors[0].distanceKm).toBeUndefined();
    });

    it('solo debe retornar médicos con verification_status=approved', async () => {
      const user1 = await createTestUser(testDataSource, { role: 'doctor' });
      await createTestDoctor(testDataSource, user1, {
        latitude: 19.4326,
        longitude: -99.1332,
        verificationStatus: 'approved',
      });

      const user2 = await createTestUser(testDataSource, { role: 'doctor' });
      await createTestDoctor(testDataSource, user2, {
        latitude: 19.3850,
        longitude: -99.1615,
        verificationStatus: 'pending',
      });

      const filters: SearchFiltersDto = {
        lat: 19.4326,
        lng: -99.1332,
        radius: 10,
        page: 1,
        limit: 20,
      };

      const result = await service.searchDoctors(filters);

      expect(result.doctors.length).toBe(1);
      expect(result.doctors[0].verificationStatus).toBe('approved');
    });

    it('debe filtrar por especialidad cuando se proporciona', async () => {
      const specialty1 = await createTestSpecialty(testDataSource, {
        nameEs: 'Cardiología',
      });
      const specialty2 = await createTestSpecialty(testDataSource, {
        nameEs: 'Dermatología',
      });

      const user1 = await createTestUser(testDataSource, { role: 'doctor' });
      const doctor1 = await createTestDoctor(testDataSource, user1, {
        latitude: 19.4326,
        longitude: -99.1332,
        verificationStatus: 'approved',
      });
      await assignSpecialtyToDoctor(testDataSource, doctor1, specialty1);

      const user2 = await createTestUser(testDataSource, { role: 'doctor' });
      const doctor2 = await createTestDoctor(testDataSource, user2, {
        latitude: 19.3850,
        longitude: -99.1615,
        verificationStatus: 'approved',
      });
      await assignSpecialtyToDoctor(testDataSource, doctor2, specialty2);

      const filters: SearchFiltersDto = {
        lat: 19.4326,
        lng: -99.1332,
        radius: 10,
        specialty: specialty1.id,
        page: 1,
        limit: 20,
      };

      const result = await service.searchDoctors(filters);

      expect(result.doctors.length).toBe(1);
      expect(result.doctors[0].specialties.some((s) => s.id === specialty1.id)).toBe(true);
    });

    it('debe implementar paginación correctamente', async () => {
      // Crear múltiples médicos
      for (let i = 0; i < 25; i++) {
        const user = await createTestUser(testDataSource, { role: 'doctor' });
        await createTestDoctor(testDataSource, user, {
          latitude: 19.4326 + i * 0.01,
          longitude: -99.1332 + i * 0.01,
          verificationStatus: 'approved',
        });
      }

      const filters: SearchFiltersDto = {
        lat: 19.4326,
        lng: -99.1332,
        radius: 50,
        page: 1,
        limit: 20,
      };

      const result = await service.searchDoctors(filters);

      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(20);
      expect(result.pagination.total).toBeGreaterThanOrEqual(20);
      expect(result.doctors.length).toBeLessThanOrEqual(20);
    });
  });
});
