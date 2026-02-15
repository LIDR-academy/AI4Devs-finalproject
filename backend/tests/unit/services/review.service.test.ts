import { AppDataSource } from '../../../src/config/database';
import { ReviewService, ReviewError } from '../../../src/services/review.service';
import { Review } from '../../../src/models/review.entity';
import { AuditLog } from '../../../src/models/audit-log.entity';
import { clearTestDatabase } from '../../setup/test-db';
import {
  createTestAppointment,
  createTestDoctor,
  createTestSlot,
  createTestUser,
} from '../../helpers/factories';
import { notificationQueue } from '../../../src/config/queue';

jest.mock('../../../src/config/queue', () => ({
  notificationQueue: {
    add: jest.fn().mockResolvedValue({}),
    close: jest.fn(),
  },
}));

describe('ReviewService', () => {
  let reviewService: ReviewService;
  let patientId: string;
  let doctorId: string;

  async function createCompletedAppointment() {
    const slot = await createTestSlot(AppDataSource as any, doctorId, {
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
    });

    return createTestAppointment(AppDataSource as any, {
      patientId,
      doctorId,
      slotId: slot.id,
      appointmentDate: slot.startTime,
      status: 'completed',
    });
  }

  beforeAll(async () => {
    process.env.DB_NAME = process.env.TEST_DB_NAME || 'citaya_test';

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      await AppDataSource.runMigrations();
    }

    await clearTestDatabase(AppDataSource as any);

    const patient = await createTestUser(AppDataSource as any, {
      email: 'unit-review-patient@test.com',
      role: 'patient',
    });
    patientId = patient.id;

    const doctorUser = await createTestUser(AppDataSource as any, {
      email: 'unit-review-doctor@test.com',
      role: 'doctor',
    });
    const doctor = await createTestDoctor(AppDataSource as any, doctorUser, {
      verificationStatus: 'approved',
    });
    doctorId = doctor.id;

    reviewService = new ReviewService();
  });

  afterAll(async () => {
    await (notificationQueue.close as jest.Mock)();
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('crea reseña pending, registra auditoría y encola notificación', async () => {
    const appointment = await createCompletedAppointment();

    const review = await reviewService.createReview({
      appointmentId: appointment.id,
      patientId,
      rating: 5,
      comment: 'Excelente atención durante toda la consulta.',
      ipAddress: '127.0.0.1',
    });

    expect(review.id).toBeDefined();
    expect(review.moderationStatus).toBe('pending');

    const auditRepo = AppDataSource.getRepository(AuditLog);
    const auditLog = await auditRepo.findOne({
      where: { action: 'create_review', entityId: review.id },
    });
    expect(auditLog).toBeDefined();

    expect(notificationQueue.add).toHaveBeenCalledWith(
      'send-review-pending-notification',
      expect.objectContaining({
        reviewId: review.id,
        appointmentId: appointment.id,
      })
    );
  });

  it('lanza 409 cuando ya existe reseña para la cita', async () => {
    const appointment = await createCompletedAppointment();
    await reviewService.createReview({
      appointmentId: appointment.id,
      patientId,
      rating: 4,
      comment: 'Reseña inicial para la cita completada.',
      ipAddress: '127.0.0.1',
    });

    const error = await reviewService
      .createReview({
        appointmentId: appointment.id,
        patientId,
        rating: 5,
        comment: 'Segunda reseña duplicada para la misma cita.',
        ipAddress: '127.0.0.1',
      })
      .catch((e) => e);

    expect(error).toBeInstanceOf(ReviewError);
    expect((error as ReviewError).statusCode).toBe(409);
    expect((error as ReviewError).code).toBe('REVIEW_ALREADY_EXISTS');
  });

  it('lanza 400 cuando la cita no está completada', async () => {
    const slot = await createTestSlot(AppDataSource as any, doctorId);
    const appointment = await createTestAppointment(AppDataSource as any, {
      patientId,
      doctorId,
      slotId: slot.id,
      appointmentDate: slot.startTime,
      status: 'confirmed',
    });

    const error = await reviewService
      .createReview({
        appointmentId: appointment.id,
        patientId,
        rating: 4,
        comment: 'Comentario válido para cita no completada.',
        ipAddress: '127.0.0.1',
      })
      .catch((e) => e);

    expect(error).toBeInstanceOf(ReviewError);
    expect((error as ReviewError).statusCode).toBe(400);
    expect((error as ReviewError).code).toBe('APPOINTMENT_NOT_COMPLETED');
  });

  it('sanitiza comentarios eliminando etiquetas HTML/JS', async () => {
    const appointment = await createCompletedAppointment();

    const review = await reviewService.createReview({
      appointmentId: appointment.id,
      patientId,
      rating: 5,
      comment: 'Muy bien <script>alert(1)</script> trato <b>amable</b> y claro.',
      ipAddress: '127.0.0.1',
    });

    const reviewRepo = AppDataSource.getRepository(Review);
    const saved = await reviewRepo.findOne({ where: { id: review.id } });
    expect(saved).toBeDefined();
    expect(saved?.comment).not.toContain('<script>');
    expect(saved?.comment).not.toContain('<b>');
    expect(saved?.comment).toContain('Muy bien');
  });
});
