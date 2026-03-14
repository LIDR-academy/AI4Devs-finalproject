import { AppDataSource } from '../../../src/config/database';
import redisClient from '../../../src/config/redis';
import { DoctorService } from '../../../src/services/doctor.service';
import { GeocodingService } from '../../../src/services/geocoding.service';
import { AuditLog } from '../../../src/models/audit-log.entity';
import { clearTestDatabase } from '../../setup/test-db';
import { createTestDoctor, createTestUser } from '../../helpers/factories';

describe('DoctorService (perfil HU6)', () => {
  let doctorService: DoctorService;
  let doctorUserId: string;
  let doctorId: string;
  const geocodeSpy = jest.spyOn(GeocodingService.prototype, 'geocodeAddress');
  const redisDelMock = jest.fn();
  const redisScanMock = jest.fn();

  beforeAll(async () => {
    process.env.DB_NAME = process.env.TEST_DB_NAME || 'citaya_test';

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      await AppDataSource.runMigrations();
    }

    doctorService = new DoctorService();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await clearTestDatabase(AppDataSource as any);

    const doctorUser = await createTestUser(AppDataSource as any, {
      email: 'doctor-unit-profile@test.com',
      role: 'doctor',
      firstName: 'Laura',
      lastName: 'Campos',
      phone: '+5215519988776',
    });
    doctorUserId = doctorUser.id;

    const doctor = await createTestDoctor(AppDataSource as any, doctorUser, {
      address: 'Av. Original 100',
      postalCode: '01010',
      latitude: 19.1,
      longitude: -99.1,
      verificationStatus: 'approved',
    });
    doctorId = doctor.id;

    Object.defineProperty(redisClient, 'isOpen', {
      value: true,
      configurable: true,
    });
    (redisClient as any).del = redisDelMock;
    (redisClient as any).scanIterator = redisScanMock;
  });

  afterAll(async () => {
    geocodeSpy.mockRestore();
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it('getMyProfile debe retornar null si el usuario no es doctor', async () => {
    const patient = await createTestUser(AppDataSource as any, {
      email: 'patient-unit-profile@test.com',
      role: 'patient',
    });

    const profile = await doctorService.getMyProfile(patient.id);
    expect(profile).toBeNull();
  });

  it('updateMyProfile debe actualizar perfil, geocodificar e invalidar cache', async () => {
    geocodeSpy.mockResolvedValue({ latitude: 20.1234, longitude: -99.9999 });
    redisScanMock.mockImplementation(async function* scanIteratorMock() {
      yield 'doctors:all:cache';
      yield 'doctors:cardiology:page1';
    });

    const result = await doctorService.updateMyProfile(
      doctorUserId,
      {
        firstName: 'Luisa',
        lastName: 'Campos Rivera',
        address: 'Av. Nueva 500',
        postalCode: '02020',
      },
      '127.0.0.1'
    );

    expect(result).not.toBeNull();
    expect(result?.doctor.firstName).toBe('Luisa');
    expect(result?.doctor.lastName).toBe('Campos Rivera');
    expect(result?.doctor.latitude).toBe(20.1234);
    expect(result?.doctor.longitude).toBe(-99.9999);
    expect(result?.warnings).toBeUndefined();

    expect(redisDelMock).toHaveBeenCalledWith([
      `doctor:${doctorId}`,
      'doctors:all:cache',
      'doctors:cardiology:page1',
    ]);

    const audit = await AppDataSource.getRepository(AuditLog).findOne({
      where: { action: 'update_doctor_profile', entityId: doctorId },
      order: { timestamp: 'DESC' },
    });
    expect(audit).toBeDefined();
    expect(audit?.oldValues).toContain('Av. Original 100');
    expect(audit?.newValues).toContain('Av. Nueva 500');
  });

  it('updateMyProfile debe guardar y retornar warning si geocoding falla', async () => {
    geocodeSpy.mockResolvedValue(null);
    redisScanMock.mockImplementation(async function* emptyScanIteratorMock() {
      return;
    });

    const result = await doctorService.updateMyProfile(
      doctorUserId,
      {
        address: 'Calle Sin Coordenadas 123',
        postalCode: '99999',
      },
      '127.0.0.1'
    );

    expect(result).not.toBeNull();
    expect(result?.doctor.address).toBe('Calle Sin Coordenadas 123');
    expect(result?.doctor.postalCode).toBe('99999');
    expect(result?.warnings?.length).toBe(1);
    expect(result?.warnings?.[0]).toContain('No se pudo geocodificar');
  });
});
