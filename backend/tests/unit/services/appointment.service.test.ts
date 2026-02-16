import { AppDataSource } from '../../../src/config/database';
import { AppointmentService } from '../../../src/services/appointment.service';
import { Slot } from '../../../src/models/slot.entity';
import { Appointment } from '../../../src/models/appointment.entity';
import { AppointmentHistory } from '../../../src/models/appointment-history.entity';
import { AuditLog } from '../../../src/models/audit-log.entity';
import { clearTestDatabase } from '../../setup/test-db';
import {
  createTestUser,
  createTestDoctor,
  createTestSlot,
  createTestAppointment,
} from '../../helpers/factories';
import { notificationQueue } from '../../../src/config/queue';

jest.mock('../../../src/config/queue', () => ({
  notificationQueue: {
    add: jest.fn().mockResolvedValue({}),
    close: jest.fn(),
  },
}));

describe('AppointmentService', () => {
  let appointmentService: AppointmentService;
  let patientId: string;
  let doctorId: string;

  beforeAll(async () => {
    process.env.DB_NAME = process.env.TEST_DB_NAME || 'citaya_test';

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      await AppDataSource.runMigrations();
    }

    await clearTestDatabase(AppDataSource as any);

    const patientUser = await createTestUser(AppDataSource as any, {
      email: 'unit-patient@test.com',
      role: 'patient',
    });
    patientId = patientUser.id;

    const doctorUser = await createTestUser(AppDataSource as any, {
      email: 'unit-doctor@test.com',
      role: 'doctor',
    });
    const doctor = await createTestDoctor(AppDataSource as any, doctorUser, {
      verificationStatus: 'approved',
    });
    doctorId = doctor.id;

    appointmentService = new AppointmentService();
  });

  afterAll(async () => {
    await (notificationQueue.close as jest.Mock)();
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('createAppointment', () => {
    it('debe crear cita exitosamente y marcar slot como no disponible', async () => {
      const slot = await createTestSlot(AppDataSource as any, doctorId);

      const appointment = await appointmentService.createAppointment(
        patientId,
        doctorId,
        slot.id,
        slot.startTime,
        'Nota de prueba',
      );

      expect(appointment).toBeDefined();
      expect(appointment.id).toBeDefined();
      expect(appointment.status).toBe('confirmed');
      expect(appointment.patientId).toBe(patientId);
      expect(appointment.doctorId).toBe(doctorId);
      expect(appointment.slotId).toBe(slot.id);
      expect(appointment.notes).toBe('Nota de prueba');

      const slotRepo = AppDataSource.getRepository(Slot);
      const updatedSlot = await slotRepo.findOne({ where: { id: slot.id } });
      expect(updatedSlot?.isAvailable).toBe(false);
    });

    it('debe encolar notificación de confirmación', async () => {
      const patient2 = await createTestUser(AppDataSource as any, {
        email: 'unit-patient2@test.com',
        role: 'patient',
      });
      const slot = await createTestSlot(AppDataSource as any, doctorId);

      await appointmentService.createAppointment(
        patient2.id,
        doctorId,
        slot.id,
        slot.startTime,
      );

      expect(notificationQueue.add).toHaveBeenCalledWith(
        'send-appointment-confirmation',
        expect.objectContaining({ appointmentId: expect.any(String) }),
      );
    });

    it('debe lanzar error 409 si el slot no está disponible', async () => {
      const patient3 = await createTestUser(AppDataSource as any, {
        email: 'unit-patient3@test.com',
        role: 'patient',
      });
      const slot = await createTestSlot(AppDataSource as any, doctorId);
      const slotRepo = AppDataSource.getRepository(Slot);
      await slotRepo.update({ id: slot.id }, { isAvailable: false });

      const err = await appointmentService
        .createAppointment(patient3.id, doctorId, slot.id, slot.startTime)
        .catch((e) => e);

      expect(err).toBeInstanceOf(Error);
      expect((err as Error).message).toContain('no está disponible');
      expect((err as Error & { statusCode?: number }).statusCode).toBe(409);
    });

    it('debe lanzar error 400 si el paciente tiene cita activa', async () => {
      const slot1 = await createTestSlot(AppDataSource as any, doctorId);
      await createTestAppointment(AppDataSource as any, {
        patientId,
        doctorId,
        slotId: slot1.id,
      });

      const slot2 = await createTestSlot(AppDataSource as any, doctorId, {
        startTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      });

      const err = await appointmentService
        .createAppointment(patientId, doctorId, slot2.id, slot2.startTime)
        .catch((e) => e);

      expect(err).toBeInstanceOf(Error);
      expect((err as Error).message).toContain('cita activa');
      expect((err as Error & { statusCode?: number }).statusCode).toBe(400);
    });
  });

  describe('cancelAppointment', () => {
    it('debe cancelar cita, liberar slot y registrar historial/auditoría', async () => {
      const slot = await createTestSlot(AppDataSource as any, doctorId);
      const appointment = await createTestAppointment(AppDataSource as any, {
        patientId,
        doctorId,
        slotId: slot.id,
        status: 'confirmed',
      });

      const result = await appointmentService.cancelAppointment(
        appointment.id,
        patientId,
        'No podré asistir',
        '127.0.0.1'
      );

      expect(result.status).toBe('cancelled');
      expect(result.cancellationReason).toBe('No podré asistir');

      const slotRepo = AppDataSource.getRepository(Slot);
      const updatedSlot = await slotRepo.findOne({ where: { id: slot.id } });
      expect(updatedSlot?.isAvailable).toBe(true);

      const historyRepo = AppDataSource.getRepository(AppointmentHistory);
      const history = await historyRepo.findOne({
        where: { appointmentId: appointment.id },
        order: { changedAt: 'DESC' },
      });
      expect(history).toBeDefined();
      expect(history?.newStatus).toBe('cancelled');

      const auditRepo = AppDataSource.getRepository(AuditLog);
      const audit = await auditRepo.findOne({
        where: { entityId: appointment.id, action: 'cancel_appointment' },
      });
      expect(audit).toBeDefined();
      expect(audit?.userId).toBe(patientId);
    });

    it('debe retornar 403 si otro paciente intenta cancelar', async () => {
      const patient2 = await createTestUser(AppDataSource as any, {
        email: 'cancel-other@test.com',
        role: 'patient',
      });
      const slot = await createTestSlot(AppDataSource as any, doctorId);
      const appointment = await createTestAppointment(AppDataSource as any, {
        patientId,
        doctorId,
        slotId: slot.id,
        status: 'confirmed',
      });

      const err = await appointmentService
        .cancelAppointment(appointment.id, patient2.id, undefined, '127.0.0.1')
        .catch((e) => e);

      expect((err as Error & { statusCode?: number }).statusCode).toBe(403);
    });
  });

  describe('rescheduleAppointment', () => {
    it('debe reprogramar cita y mover disponibilidad de slots', async () => {
      const reschedulePatient = await createTestUser(AppDataSource as any, {
        email: 'reschedule-success@test.com',
        role: 'patient',
      });
      const oldSlot = await createTestSlot(AppDataSource as any, doctorId, {
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      });
      const newSlot = await createTestSlot(AppDataSource as any, doctorId, {
        startTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 48 * 60 * 60 * 1000 + 30 * 60 * 1000),
      });

      const appointment = await createTestAppointment(AppDataSource as any, {
        patientId: reschedulePatient.id,
        doctorId,
        slotId: oldSlot.id,
        appointmentDate: oldSlot.startTime,
        status: 'confirmed',
      });

      const updated = await appointmentService.rescheduleAppointment(
        appointment.id,
        reschedulePatient.id,
        newSlot.id,
        newSlot.startTime,
        '127.0.0.1'
      );

      expect(updated.slotId).toBe(newSlot.id);
      expect(updated.status).toBe('confirmed');

      const slotRepo = AppDataSource.getRepository(Slot);
      const oldSlotAfter = await slotRepo.findOne({ where: { id: oldSlot.id } });
      const newSlotAfter = await slotRepo.findOne({ where: { id: newSlot.id } });
      expect(oldSlotAfter?.isAvailable).toBe(true);
      expect(newSlotAfter?.isAvailable).toBe(false);

      const historyRepo = AppDataSource.getRepository(AppointmentHistory);
      const historyEntries = await historyRepo.find({
        where: { appointmentId: appointment.id },
      });
      expect(historyEntries.length).toBeGreaterThan(0);
      expect(historyEntries.some((entry) => entry.changeReason === 'Cita reprogramada')).toBe(true);
    });

    it('debe retornar 409 cuando el nuevo slot no está disponible', async () => {
      const reschedulePatient = await createTestUser(AppDataSource as any, {
        email: 'reschedule-conflict@test.com',
        role: 'patient',
      });
      const oldSlot = await createTestSlot(AppDataSource as any, doctorId, {
        startTime: new Date(Date.now() + 72 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 72 * 60 * 60 * 1000 + 30 * 60 * 1000),
      });
      const unavailableSlot = await createTestSlot(AppDataSource as any, doctorId, {
        startTime: new Date(Date.now() + 96 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 96 * 60 * 60 * 1000 + 30 * 60 * 1000),
        isAvailable: false,
      });
      const appointment = await createTestAppointment(AppDataSource as any, {
        patientId: reschedulePatient.id,
        doctorId,
        slotId: oldSlot.id,
        appointmentDate: oldSlot.startTime,
        status: 'confirmed',
      });

      const err = await appointmentService
        .rescheduleAppointment(
          appointment.id,
          reschedulePatient.id,
          unavailableSlot.id,
          unavailableSlot.startTime,
          '127.0.0.1'
        )
        .catch((e) => e);

      expect((err as Error & { statusCode?: number }).statusCode).toBe(409);
    });

    it('debe retornar 400 si la cita ya está cancelada', async () => {
      const reschedulePatient = await createTestUser(AppDataSource as any, {
        email: 'reschedule-cancelled@test.com',
        role: 'patient',
      });
      const oldSlot = await createTestSlot(AppDataSource as any, doctorId, {
        startTime: new Date(Date.now() + 120 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 120 * 60 * 60 * 1000 + 30 * 60 * 1000),
      });
      const newSlot = await createTestSlot(AppDataSource as any, doctorId, {
        startTime: new Date(Date.now() + 144 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 144 * 60 * 60 * 1000 + 30 * 60 * 1000),
      });
      const appointmentRepo = AppDataSource.getRepository(Appointment);
      const appointment = await createTestAppointment(AppDataSource as any, {
        patientId: reschedulePatient.id,
        doctorId,
        slotId: oldSlot.id,
        appointmentDate: oldSlot.startTime,
        status: 'confirmed',
      });
      await appointmentRepo.update({ id: appointment.id }, { status: 'cancelled' });

      const err = await appointmentService
        .rescheduleAppointment(
          appointment.id,
          reschedulePatient.id,
          newSlot.id,
          newSlot.startTime,
          '127.0.0.1'
        )
        .catch((e) => e);

      expect((err as Error & { statusCode?: number }).statusCode).toBe(400);
    });
  });
});
