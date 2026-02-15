import request from 'supertest';
import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as jwt from 'jsonwebtoken';
import { AppDataSource } from '../../../../src/config/database';
import { clearTestDatabase } from '../../../setup/test-db';
import doctorsRoutes from '../../../../src/routes/doctors.routes';
import { errorHandler } from '../../../../src/middleware/error-handler.middleware';
import { DoctorSchedule } from '../../../../src/models/doctor-schedule.entity';
import { Slot } from '../../../../src/models/slot.entity';
import { Appointment } from '../../../../src/models/appointment.entity';
import {
  createTestDoctor,
  createTestUser,
  createTestAppointment,
} from '../../../helpers/factories';

describe('Doctor Schedules API (Integration)', () => {
  let app: Express;
  let doctorToken: string;
  let patientToken: string;
  let doctorUserId: string;
  let doctorId: string;

  function createTestApp(): Express {
    const testApp = express();
    testApp.use(cors());
    testApp.use(express.json());
    testApp.use(express.urlencoded({ extended: true }));
    testApp.use(cookieParser());
    testApp.set('trust proxy', 1);
    testApp.use('/api/v1/doctors', doctorsRoutes);
    testApp.use(errorHandler);
    return testApp;
  }

  beforeAll(async () => {
    process.env.DB_NAME = process.env.TEST_DB_NAME || 'citaya_test';
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      await AppDataSource.runMigrations();
    }
    app = createTestApp();
  });

  beforeEach(async () => {
    await clearTestDatabase(AppDataSource as never);
    const doctorUser = await createTestUser(AppDataSource as never, {
      email: 'doctor-schedules@test.com',
      role: 'doctor',
    });
    const patientUser = await createTestUser(AppDataSource as never, {
      email: 'patient-schedules@test.com',
      role: 'patient',
    });
    const doctor = await createTestDoctor(AppDataSource as never, doctorUser, {
      verificationStatus: 'approved',
    });

    doctorUserId = doctorUser.id;
    doctorId = doctor.id;

    const secret = process.env.JWT_ACCESS_SECRET || 'dev-access-secret';
    doctorToken = jwt.sign(
      { sub: doctorUser.id, email: doctorUser.email, role: doctorUser.role },
      secret,
      { expiresIn: '15m' },
    );
    patientToken = jwt.sign(
      { sub: patientUser.id, email: patientUser.email, role: patientUser.role },
      secret,
      { expiresIn: '15m' },
    );
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it('POST /api/v1/doctors/me/schedules crea horario y genera slots', async () => {
    const response = await request(app)
      .post('/api/v1/doctors/me/schedules')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        dayOfWeek: 1,
        startTime: '09:00:00',
        endTime: '11:00:00',
        slotDurationMinutes: 30,
        breakDurationMinutes: 0,
        isActive: true,
      })
      .expect(201);

    expect(response.body.id).toBeDefined();
    expect(response.body.doctorId).toBe(doctorId);

    const slots = await AppDataSource.getRepository(Slot).find({
      where: { scheduleId: response.body.id },
    });
    expect(slots.length).toBeGreaterThan(0);
  });

  it('POST /api/v1/doctors/me/schedules retorna 400 por solapamiento', async () => {
    await request(app)
      .post('/api/v1/doctors/me/schedules')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        dayOfWeek: 2,
        startTime: '09:00:00',
        endTime: '12:00:00',
        slotDurationMinutes: 30,
        breakDurationMinutes: 0,
        isActive: true,
      })
      .expect(201);

    const response = await request(app)
      .post('/api/v1/doctors/me/schedules')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        dayOfWeek: 2,
        startTime: '11:00:00',
        endTime: '13:00:00',
        slotDurationMinutes: 30,
        breakDurationMinutes: 0,
        isActive: true,
      })
      .expect(400);

    expect(response.body.code).toBe('SCHEDULE_OVERLAP');
  });

  it('PATCH /api/v1/doctors/me/schedules/:id regenera slots y mantiene reservados', async () => {
    const createResponse = await request(app)
      .post('/api/v1/doctors/me/schedules')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        dayOfWeek: 3,
        startTime: '09:00:00',
        endTime: '11:00:00',
        slotDurationMinutes: 30,
        breakDurationMinutes: 0,
        isActive: true,
      })
      .expect(201);

    const scheduleId = createResponse.body.id as string;
    const scheduleSlots = await AppDataSource.getRepository(Slot).find({
      where: { scheduleId },
      order: { startTime: 'ASC' },
    });
    expect(scheduleSlots.length).toBeGreaterThan(0);

    const reservedSlot = scheduleSlots[0];
    const patient = await createTestUser(AppDataSource as never, {
      email: 'patient-reserved@test.com',
      role: 'patient',
    });
    await createTestAppointment(AppDataSource as never, {
      patientId: patient.id,
      doctorId,
      slotId: reservedSlot.id,
      appointmentDate: reservedSlot.startTime,
      status: 'confirmed',
    });

    await request(app)
      .patch(`/api/v1/doctors/me/schedules/${scheduleId}`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        startTime: '10:00:00',
        endTime: '12:00:00',
      })
      .expect(200);

    const keptReservedSlot = await AppDataSource.getRepository(Slot).findOne({
      where: { id: reservedSlot.id },
    });
    expect(keptReservedSlot).toBeDefined();

    const regeneratedSlots = await AppDataSource.getRepository(Slot).find({
      where: { scheduleId },
    });
    expect(regeneratedSlots.length).toBeGreaterThan(0);
  });

  it('DELETE /api/v1/doctors/me/schedules/:id soft-delete del horario y elimina slots futuros no reservados', async () => {
    const createResponse = await request(app)
      .post('/api/v1/doctors/me/schedules')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        dayOfWeek: 4,
        startTime: '09:00:00',
        endTime: '11:00:00',
        slotDurationMinutes: 30,
        breakDurationMinutes: 0,
        isActive: true,
      })
      .expect(201);

    const scheduleId = createResponse.body.id as string;
    await request(app)
      .delete(`/api/v1/doctors/me/schedules/${scheduleId}`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .expect(200);

    const schedule = await AppDataSource.getRepository(DoctorSchedule).findOne({
      where: { id: scheduleId },
      withDeleted: true,
    });
    expect(schedule?.deletedAt).toBeTruthy();

    const futureSlots = await AppDataSource.getRepository(Slot)
      .createQueryBuilder('slot')
      .where('slot.schedule_id = :scheduleId', { scheduleId })
      .andWhere('slot.start_time > NOW()')
      .getMany();

    expect(futureSlots.length).toBe(0);
  });

  it('GET /api/v1/doctors/me/schedules retorna 403 para usuario no doctor', async () => {
    const response = await request(app)
      .get('/api/v1/doctors/me/schedules')
      .set('Authorization', `Bearer ${patientToken}`)
      .expect(403);

    expect(response.body.code).toBe('FORBIDDEN');
  });

  it('DELETE no permite eliminar horario con cita futura confirmada', async () => {
    const createResponse = await request(app)
      .post('/api/v1/doctors/me/schedules')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        dayOfWeek: 5,
        startTime: '09:00:00',
        endTime: '11:00:00',
        slotDurationMinutes: 30,
        breakDurationMinutes: 0,
        isActive: true,
      })
      .expect(201);

    const scheduleId = createResponse.body.id as string;
    const slots = await AppDataSource.getRepository(Slot).find({
      where: { scheduleId },
      order: { startTime: 'ASC' },
    });
    const patient = await createTestUser(AppDataSource as never, {
      email: 'patient-delete-locked@test.com',
      role: 'patient',
    });
    await createTestAppointment(AppDataSource as never, {
      patientId: patient.id,
      doctorId,
      slotId: slots[0].id,
      appointmentDate: slots[0].startTime,
      status: 'confirmed',
    });

    const response = await request(app)
      .delete(`/api/v1/doctors/me/schedules/${scheduleId}`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .expect(400);

    expect(response.body.code).toBe('SCHEDULE_HAS_FUTURE_APPOINTMENTS');
    const count = await AppDataSource.getRepository(Appointment).count();
    expect(count).toBeGreaterThan(0);
  });

  it('GET /api/v1/doctors/me/schedules lista horarios del médico autenticado', async () => {
    await request(app)
      .post('/api/v1/doctors/me/schedules')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        dayOfWeek: 6,
        startTime: '08:00:00',
        endTime: '10:00:00',
        slotDurationMinutes: 30,
        breakDurationMinutes: 0,
        isActive: true,
      })
      .expect(201);

    const response = await request(app)
      .get('/api/v1/doctors/me/schedules')
      .set('Authorization', `Bearer ${doctorToken}`)
      .expect(200);

    expect(Array.isArray(response.body.schedules)).toBe(true);
    expect(response.body.schedules.length).toBeGreaterThan(0);
    expect(response.body.schedules[0].doctorId).toBe(doctorId);
    expect(doctorUserId).toBeDefined();
  });
});
