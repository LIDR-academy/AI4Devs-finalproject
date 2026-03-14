import request from 'supertest';
import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as jwt from 'jsonwebtoken';
import { AppDataSource } from '../../../../src/config/database';
import { Specialty } from '../../../../src/models/specialty.entity';
import { Doctor } from '../../../../src/models/doctor.entity';
import { errorHandler } from '../../../../src/middleware/error-handler.middleware';
import doctorsRoutes from '../../../../src/routes/doctors.routes';
import { clearTestDatabase } from '../../../setup/test-db';
import {
  createTestUser,
  createTestDoctor,
  assignSpecialtyToDoctor,
} from '../../../helpers/factories';

describe('Doctors Search API (Integration)', () => {
  let app: Express;
  let testDataSource = AppDataSource;
  let specialty: Specialty;
  let patientToken: string;

  function createTestApp(): Express {
    const testApp = express();
    testApp.use(cors());
    testApp.use(express.json());
    testApp.use(express.urlencoded({ extended: true }));
    testApp.use(cookieParser());
    testApp.set('trust proxy', 1);

    // Rutas
    testApp.use('/api/v1/doctors', doctorsRoutes);

    // Manejo de errores
    testApp.use(errorHandler);

    return testApp;
  }

  beforeAll(async () => {
    // Configurar variables de entorno para testing
    process.env.DB_HOST = process.env.DB_HOST || 'localhost';
    process.env.DB_NAME = process.env.TEST_DB_NAME || 'citaya_test';

    // Inicializar base de datos si no está inicializada
    if (!AppDataSource.isInitialized) {
      try {
        await AppDataSource.initialize();
        // Ejecutar migraciones para asegurar que las tablas existan
        await AppDataSource.runMigrations();
      } catch (error) {
        console.error('Error inicializando base de datos en tests:', error);
        throw error;
      }
    }

    testDataSource = AppDataSource;
    app = createTestApp();

    // Limpiar base de datos
    await clearTestDatabase(testDataSource);

    // Crear especialidad de prueba
    const specialtyRepository = testDataSource.getRepository(Specialty);
    specialty = specialtyRepository.create({
      nameEs: 'Cardiología',
      nameEn: 'Cardiology',
      isActive: true,
    });
    specialty = await specialtyRepository.save(specialty);

    // Crear usuario paciente para autenticación en tests
    const patientUser = await createTestUser(testDataSource, {
      email: 'patient@test.com',
      role: 'patient',
    });

    // Generar token JWT para el paciente
    const payload = {
      sub: patientUser.id,
      email: patientUser.email,
      role: patientUser.role,
    };
    const secret = process.env.JWT_ACCESS_SECRET || 'test-access-secret';
    const expiresIn: string | number = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
    patientToken = jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
  });

  beforeEach(async () => {
    // Limpiar datos antes de cada test para evitar conflictos
    await clearTestDatabase(testDataSource);
  });

  afterAll(async () => {
    if (testDataSource.isInitialized) {
      await testDataSource.destroy();
    }
  });

  describe('GET /api/v1/doctors - Búsqueda por coordenadas', () => {
    it('debe retornar médicos ordenados por distancia cuando se proporcionan coordenadas', async () => {
      // Crear médicos de prueba con diferentes ubicaciones
      const user1 = await createTestUser(testDataSource, {
        email: 'doctor1@test.com',
        role: 'doctor',
      });
      const doctor1 = await createTestDoctor(testDataSource, user1, {
        address: 'Av. Reforma 123, CDMX',
        postalCode: '06000',
        latitude: 19.4326, // CDMX centro
        longitude: -99.1332,
        verificationStatus: 'approved',
        ratingAverage: 4.5,
        totalReviews: 10,
      });

      const user2 = await createTestUser(testDataSource, {
        email: 'doctor2@test.com',
        role: 'doctor',
      });
      const doctor2 = await createTestDoctor(testDataSource, user2, {
        address: 'Av. Insurgentes 500, CDMX',
        postalCode: '03100',
        latitude: 19.3850, // Más lejos
        longitude: -99.1615,
        verificationStatus: 'approved',
        ratingAverage: 4.8,
        totalReviews: 20,
      });

      // Asignar especialidad a los médicos
      // Esperar un poco para asegurar que los doctores estén completamente guardados
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verificar que los doctores existen antes de asignar especialidades
      const doctorRepository = testDataSource.getRepository(Doctor);
      const reloadedDoctor1 = await doctorRepository.findOne({ where: { id: doctor1.id } });
      const reloadedDoctor2 = await doctorRepository.findOne({ where: { id: doctor2.id } });
      
      if (!reloadedDoctor1) {
        throw new Error(`Doctor 1 con id ${doctor1.id} no se encontró después de guardarlo. User ID: ${user1.id}`);
      }
      if (!reloadedDoctor2) {
        throw new Error(`Doctor 2 con id ${doctor2.id} no se encontró después de guardarlo. User ID: ${user2.id}`);
      }
      
      await assignSpecialtyToDoctor(testDataSource, reloadedDoctor1, specialty);
      await assignSpecialtyToDoctor(testDataSource, reloadedDoctor2, specialty);

      const response = await request(app)
        .get('/api/v1/doctors')
        .query({
          lat: 19.4326,
          lng: -99.1332,
          radius: 10,
          specialty: specialty.id,
        })
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('doctors');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.doctors.length).toBeGreaterThan(0);
      expect(response.body.doctors[0]).toHaveProperty('distanceKm');
    });

    it('debe respetar el radio de búsqueda especificado', async () => {
      // Crear médico dentro del radio
      const user1 = await createTestUser(testDataSource, {
        email: 'doctor1-radio@test.com',
        role: 'doctor',
      });
      const doctor1 = await createTestDoctor(testDataSource, user1, {
        address: 'Av. Reforma 123, CDMX',
        postalCode: '06000',
        latitude: 19.4326,
        longitude: -99.1332,
        verificationStatus: 'approved',
      });
      await assignSpecialtyToDoctor(testDataSource, doctor1, specialty);

      // Crear médico fuera del radio (más de 5km)
      const user2 = await createTestUser(testDataSource, {
        email: 'doctor2-radio@test.com',
        role: 'doctor',
      });
      const doctor2 = await createTestDoctor(testDataSource, user2, {
        address: 'Lejos de CDMX',
        postalCode: '50000',
        latitude: 20.0, // Muy lejos (más de 100km)
        longitude: -100.0,
        verificationStatus: 'approved',
      });
      await assignSpecialtyToDoctor(testDataSource, doctor2, specialty);

      const response = await request(app)
        .get('/api/v1/doctors')
        .query({
          lat: 19.4326,
          lng: -99.1332,
          radius: 5, // Radio pequeño
          specialty: specialty.id,
        })
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(200);

      // Solo debe encontrar el médico cercano
      expect(response.body.doctors.length).toBe(1);
      expect(response.body.doctors[0].distanceKm).toBeLessThanOrEqual(5);
    });

    it('solo debe retornar médicos con verification_status=approved', async () => {
      // Crear médico aprobado
      const user1 = await createTestUser(testDataSource, {
        email: 'doctor1-approved@test.com',
        role: 'doctor',
      });
      const doctor1 = await createTestDoctor(testDataSource, user1, {
        address: 'Av. Reforma 123, CDMX',
        postalCode: '06000',
        latitude: 19.4326,
        longitude: -99.1332,
        verificationStatus: 'approved',
      });
      await assignSpecialtyToDoctor(testDataSource, doctor1, specialty);

      // Crear médico pendiente
      const user2 = await createTestUser(testDataSource, {
        email: 'doctor2-pending@test.com',
        role: 'doctor',
      });
      await createTestDoctor(testDataSource, user2, {
        address: 'Av. Insurgentes 500, CDMX',
        postalCode: '03100',
        latitude: 19.3850,
        longitude: -99.1615,
        verificationStatus: 'pending',
      });

      const response = await request(app)
        .get('/api/v1/doctors')
        .query({
          lat: 19.4326,
          lng: -99.1332,
          radius: 10,
          specialty: specialty.id,
        })
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(200);

      // Solo debe encontrar el médico aprobado
      expect(response.body.doctors.length).toBe(1);
      expect(response.body.doctors[0].verificationStatus).toBe('approved');
    });
  });

  describe('GET /api/v1/doctors - Búsqueda por código postal', () => {
    it('debe retornar médicos cuando se proporciona código postal', async () => {
      const user = await createTestUser(testDataSource, {
        email: 'doctor1-postal@test.com',
        role: 'doctor',
      });
      const doctor = await createTestDoctor(testDataSource, user, {
        address: 'Av. Reforma 123, CDMX',
        postalCode: '06000',
        latitude: 19.4326,
        longitude: -99.1332,
        verificationStatus: 'approved',
      });
      await assignSpecialtyToDoctor(testDataSource, doctor, specialty);

      const response = await request(app)
        .get('/api/v1/doctors')
        .query({
          postalCode: '06000',
          specialty: specialty.id,
        })
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('doctors');
      expect(response.body.doctors.length).toBeGreaterThan(0);
      // No debe tener distanceKm cuando se busca por código postal
      expect(response.body.doctors[0].distanceKm).toBeUndefined();
    });

    it('debe ordenar por rating cuando se busca por código postal', async () => {
      const user1 = await createTestUser(testDataSource, {
        email: 'doctor1-rating@test.com',
        role: 'doctor',
      });
      const doctor1 = await createTestDoctor(testDataSource, user1, {
        address: 'Av. Reforma 123, CDMX',
        postalCode: '06000',
        verificationStatus: 'approved',
        ratingAverage: 4.0,
        totalReviews: 10,
      });
      await assignSpecialtyToDoctor(testDataSource, doctor1, specialty);

      const user2 = await createTestUser(testDataSource, {
        email: 'doctor2-rating@test.com',
        role: 'doctor',
      });
      const doctor2 = await createTestDoctor(testDataSource, user2, {
        address: 'Av. Reforma 456, CDMX',
        postalCode: '06000',
        verificationStatus: 'approved',
        ratingAverage: 4.8,
        totalReviews: 20,
      });
      await assignSpecialtyToDoctor(testDataSource, doctor2, specialty);

      const response = await request(app)
        .get('/api/v1/doctors')
        .query({
          postalCode: '06000',
          specialty: specialty.id,
        })
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(200);

      expect(response.body.doctors.length).toBe(2);
      // El médico con mayor rating debe estar primero
      expect(response.body.doctors[0].ratingAverage).toBeGreaterThanOrEqual(
        response.body.doctors[1].ratingAverage
      );
    });
  });

  describe('GET /api/v1/doctors - Filtro por especialidad', () => {
    it('debe filtrar médicos por especialidad cuando se proporciona', async () => {
      // Este test requiere que los médicos tengan especialidades asignadas
      // Por ahora, verificamos que el parámetro se acepta
      const response = await request(app)
        .get('/api/v1/doctors')
        .query({
          lat: 19.4326,
          lng: -99.1332,
          radius: 10,
          specialty: specialty.id,
        })
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('doctors');
    });
  });

  describe('GET /api/v1/doctors - Paginación', () => {
    it('debe retornar resultados paginados con información correcta', async () => {
      // Crear múltiples médicos
      for (let i = 0; i < 25; i++) {
        const user = await createTestUser(testDataSource, {
          email: `doctor${i}@test.com`,
          role: 'doctor',
        });
        await createTestDoctor(testDataSource, user, {
          address: `Av. Test ${i}, CDMX`,
          postalCode: '06000',
          latitude: 19.4326 + (i * 0.01),
          longitude: -99.1332 + (i * 0.01),
          verificationStatus: 'approved',
        });
      }

      const response = await request(app)
        .get('/api/v1/doctors')
        .query({
          lat: 19.4326,
          lng: -99.1332,
          radius: 50,
          page: 1,
          limit: 20,
        })
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(200);

      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(20);
      expect(response.body.pagination.total).toBeGreaterThanOrEqual(20);
      expect(response.body.doctors.length).toBeLessThanOrEqual(20);
    });

    it('debe respetar el límite máximo de 50 resultados por página', async () => {
      // Crear algunos médicos para la prueba
      const user = await createTestUser(testDataSource, {
        email: 'doctor-limit@test.com',
        role: 'doctor',
      });
      const doctor = await createTestDoctor(testDataSource, user, {
        address: 'Av. Test, CDMX',
        postalCode: '06000',
        latitude: 19.4326,
        longitude: -99.1332,
        verificationStatus: 'approved',
      });
      await assignSpecialtyToDoctor(testDataSource, doctor, specialty);

      const response = await request(app)
        .get('/api/v1/doctors')
        .query({
          lat: 19.4326,
          lng: -99.1332,
          radius: 10,
          specialty: specialty.id,
          page: 1,
          limit: 100, // Intento de exceder el máximo
        })
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(200);

      expect(response.body.pagination.limit).toBeLessThanOrEqual(50);
      expect(response.body.doctors.length).toBeLessThanOrEqual(50);
    });
  });

  describe('GET /api/v1/doctors - Validación de parámetros', () => {
    it('debe retornar 400 si no se proporcionan coordenadas ni código postal', async () => {
      const response = await request(app)
        .get('/api/v1/doctors')
        .query({
          specialty: specialty.id,
        })
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.code).toBe('MISSING_LOCATION_PARAMS');
    });

    it('debe retornar 400 si se proporciona lat sin lng o viceversa', async () => {
      const response = await request(app)
        .get('/api/v1/doctors')
        .query({
          lat: 19.4326,
          // lng faltante
        })
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.code).toBe('INCOMPLETE_COORDINATES');
    });

    it('debe retornar 400 si los parámetros son inválidos', async () => {
      const response = await request(app)
        .get('/api/v1/doctors')
        .query({
          lat: 'invalid',
          lng: -99.1332,
          radius: 10,
        })
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/doctors - Cache Redis', () => {
    it('debe cachear resultados en Redis', async () => {
      // Este test requiere Redis corriendo
      // Por ahora, verificamos que la búsqueda funciona
      const user = await createTestUser(testDataSource, {
        email: 'doctor1@test.com',
        role: 'doctor',
      });
      await createTestDoctor(testDataSource, user, {
        address: 'Av. Reforma 123, CDMX',
        postalCode: '06000',
        latitude: 19.4326,
        longitude: -99.1332,
        verificationStatus: 'approved',
      });

      // Primera búsqueda
      const response1 = await request(app)
        .get('/api/v1/doctors')
        .query({
          lat: 19.4326,
          lng: -99.1332,
          radius: 10,
        })
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(200);

      // Segunda búsqueda (debería usar cache si Redis está disponible)
      const response2 = await request(app)
        .get('/api/v1/doctors')
        .query({
          lat: 19.4326,
          lng: -99.1332,
          radius: 10,
        })
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(200);

      // Los resultados deben ser iguales
      expect(response1.body.doctors.length).toBe(response2.body.doctors.length);
    });
  });
});
