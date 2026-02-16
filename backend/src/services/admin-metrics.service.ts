import { AppDataSource } from '../config/database';
import redisClient from '../config/redis';
import { Appointment } from '../models/appointment.entity';
import { Doctor } from '../models/doctor.entity';
import { Review } from '../models/review.entity';
import { User } from '../models/user.entity';

const DAY_IN_SECONDS = 24 * 60 * 60;
const METRICS_KEY = 'admin:metrics';
const METRICS_LAST_KEY = 'admin:metrics:last';

export interface AdminMetricsSnapshot {
  summary: {
    totalReservations: number;
    totalCompletedAppointments: number;
    totalCancellations: number;
    cancellationRate: number;
    averageRating: number;
    activeDoctors: number;
    activePatients: number;
  };
  reservationsSeries: Array<{ date: string; total: number }>;
  cancellationsSeries: Array<{ date: string; total: number }>;
  cancellationsByReason: Array<{ reason: string; total: number }>;
  ratingsBySpecialty: Array<{ specialtyId: string; specialty: string; average: number; totalReviews: number }>;
  topDoctorsByAppointments: Array<{
    doctorId: string;
    doctorName: string;
    specialty: string;
    totalAppointments: number;
    averageRating: number;
    totalReviews: number;
  }>;
  topDoctorsByRating: Array<{
    doctorId: string;
    doctorName: string;
    specialty: string;
    totalAppointments: number;
    averageRating: number;
    totalReviews: number;
  }>;
  generatedAt: string;
}

export interface AdminReservationsFilters {
  page: number;
  limit: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  doctorId?: string;
}

export interface AdminCancellationsFilters {
  page: number;
  limit: number;
  reason?: string;
  startDate?: string;
  endDate?: string;
}

function buildCacheKey(base: string, input: object): string {
  const json = JSON.stringify(input);
  let hash = 0;
  for (let i = 0; i < json.length; i += 1) {
    hash = (hash << 5) - hash + json.charCodeAt(i);
    hash |= 0;
  }
  return `${base}:${Math.abs(hash)}`;
}

export class AdminMetricsService {
  private readonly appointmentRepo = AppDataSource.getRepository(Appointment);
  private readonly doctorRepo = AppDataSource.getRepository(Doctor);
  private readonly reviewRepo = AppDataSource.getRepository(Review);
  private readonly userRepo = AppDataSource.getRepository(User);

  private async getCached<T>(key: string): Promise<T | null> {
    if (!redisClient.isOpen) return null;
    const data = await redisClient.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  }

  private async setCached<T>(key: string, value: T, ttl = DAY_IN_SECONDS): Promise<void> {
    if (!redisClient.isOpen) return;
    await redisClient.set(key, JSON.stringify(value), { EX: ttl });
  }

  private getDateDaysAgo(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  async getMetricsSnapshot(forceRefresh = false): Promise<AdminMetricsSnapshot> {
    if (!forceRefresh) {
      const cached = await this.getCached<AdminMetricsSnapshot>(METRICS_KEY);
      if (cached) return cached;
    }

    const snapshot = await this.computeSnapshot();
    await this.setCached(METRICS_KEY, snapshot);
    await this.setCached(METRICS_LAST_KEY, snapshot, 7 * DAY_IN_SECONDS);
    return snapshot;
  }

  async getLastSnapshotFallback(): Promise<AdminMetricsSnapshot | null> {
    return this.getCached<AdminMetricsSnapshot>(METRICS_LAST_KEY);
  }

  async computeAndCacheDailySnapshot(): Promise<AdminMetricsSnapshot> {
    try {
      const snapshot = await this.computeSnapshot();
      await this.setCached(METRICS_KEY, snapshot);
      await this.setCached(METRICS_LAST_KEY, snapshot, 7 * DAY_IN_SECONDS);
      return snapshot;
    } catch {
      const fallback = await this.getLastSnapshotFallback();
      if (fallback) return fallback;
      throw new Error('No se pudo calcular snapshot y no existe fallback');
    }
  }

  async invalidateMetricsCache(): Promise<void> {
    if (!redisClient.isOpen) return;
    const keys = [METRICS_KEY];
    for await (const key of redisClient.scanIterator({ MATCH: 'admin:*', COUNT: 100 })) {
      if (typeof key === 'string' && key !== METRICS_LAST_KEY) {
        keys.push(key);
      }
    }
    if (keys.length > 0) {
      await redisClient.del([...new Set(keys)]);
    }
  }

  private async computeSnapshot(): Promise<AdminMetricsSnapshot> {
    const last4Weeks = this.getDateDaysAgo(28);
    const last30Days = this.getDateDaysAgo(30);

    const [
      totalReservations,
      totalCompletedAppointments,
      totalCancellations,
      activeDoctors,
      activePatients,
      averageRatingRaw,
      reservationsSeriesRaw,
      cancellationsSeriesRaw,
      cancellationsByReasonRaw,
      ratingsBySpecialtyRaw,
      topDoctorsByAppointmentsRaw,
      topDoctorsByRatingRaw,
    ] = await Promise.all([
      this.appointmentRepo.count(),
      this.appointmentRepo.count({ where: { status: 'completed' } }),
      this.appointmentRepo.count({ where: { status: 'cancelled' } }),
      this.doctorRepo
        .createQueryBuilder('doctor')
        .innerJoin('APPOINTMENTS', 'appointment', 'appointment.doctor_id = doctor.id')
        .where('appointment.created_at >= :last30Days', { last30Days })
        .select('COUNT(DISTINCT doctor.id)', 'count')
        .getRawOne(),
      this.userRepo
        .createQueryBuilder('user')
        .innerJoin('APPOINTMENTS', 'appointment', 'appointment.patient_id = user.id')
        .where('user.role = :role', { role: 'patient' })
        .andWhere('appointment.created_at >= :last30Days', { last30Days })
        .select('COUNT(DISTINCT user.id)', 'count')
        .getRawOne(),
      this.reviewRepo
        .createQueryBuilder('review')
        .select('AVG(review.rating)', 'avg')
        .where('review.moderation_status = :status', { status: 'approved' })
        .getRawOne(),
      this.appointmentRepo
        .createQueryBuilder('appointment')
        .select('DATE(appointment.appointment_date)', 'date')
        .addSelect('COUNT(*)', 'total')
        .where('appointment.appointment_date >= :start', { start: last4Weeks })
        .groupBy('DATE(appointment.appointment_date)')
        .orderBy('DATE(appointment.appointment_date)', 'ASC')
        .getRawMany(),
      this.appointmentRepo
        .createQueryBuilder('appointment')
        .select('DATE(appointment.updated_at)', 'date')
        .addSelect('COUNT(*)', 'total')
        .where('appointment.status = :status', { status: 'cancelled' })
        .andWhere('appointment.updated_at >= :start', { start: last4Weeks })
        .groupBy('DATE(appointment.updated_at)')
        .orderBy('DATE(appointment.updated_at)', 'ASC')
        .getRawMany(),
      this.appointmentRepo
        .createQueryBuilder('appointment')
        .select("COALESCE(NULLIF(TRIM(appointment.cancellation_reason), ''), 'sin_motivo')", 'reason')
        .addSelect('COUNT(*)', 'total')
        .where('appointment.status = :status', { status: 'cancelled' })
        .groupBy("COALESCE(NULLIF(TRIM(appointment.cancellation_reason), ''), 'sin_motivo')")
        .orderBy('total', 'DESC')
        .getRawMany(),
      this.reviewRepo
        .createQueryBuilder('review')
        .innerJoin('review.doctor', 'doctor')
        .leftJoin('doctor.specialties', 'specialty')
        .select('specialty.id', 'specialtyId')
        .addSelect("COALESCE(specialty.name_es, 'Sin especialidad')", 'specialty')
        .addSelect('AVG(review.rating)', 'average')
        .addSelect('COUNT(review.id)', 'totalReviews')
        .where('review.moderation_status = :status', { status: 'approved' })
        .groupBy('specialty.id')
        .addGroupBy('specialty.name_es')
        .getRawMany(),
      this.appointmentRepo
        .createQueryBuilder('appointment')
        .innerJoin('appointment.doctor', 'doctor')
        .innerJoin('doctor.user', 'doctorUser')
        .leftJoin('doctor.specialties', 'specialty')
        .select('doctor.id', 'doctorId')
        .addSelect("CONCAT(doctorUser.firstName, ' ', doctorUser.lastName)", 'doctorName')
        .addSelect("COALESCE(MAX(specialty.name_es), 'Sin especialidad')", 'specialty')
        .addSelect('COUNT(appointment.id)', 'totalAppointments')
        .addSelect('COALESCE(MAX(doctor.rating_average), 0)', 'averageRating')
        .addSelect('COALESCE(MAX(doctor.total_reviews), 0)', 'totalReviews')
        .groupBy('doctor.id')
        .addGroupBy('doctorUser.firstName')
        .addGroupBy('doctorUser.lastName')
        .orderBy('COUNT(appointment.id)', 'DESC')
        .limit(10)
        .getRawMany(),
      this.doctorRepo
        .createQueryBuilder('doctor')
        .innerJoin('doctor.user', 'doctorUser')
        .leftJoin('doctor.specialties', 'specialty')
        .select('doctor.id', 'doctorId')
        .addSelect("CONCAT(doctorUser.firstName, ' ', doctorUser.lastName)", 'doctorName')
        .addSelect("COALESCE(MAX(specialty.name_es), 'Sin especialidad')", 'specialty')
        .addSelect('COALESCE(MAX(doctor.rating_average), 0)', 'averageRating')
        .addSelect('COALESCE(MAX(doctor.total_reviews), 0)', 'totalReviews')
        .addSelect(
          '(SELECT COUNT(*) FROM APPOINTMENTS app WHERE app.doctor_id = doctor.id)',
          'totalAppointments'
        )
        .where('doctor.total_reviews > 0')
        .groupBy('doctor.id')
        .addGroupBy('doctorUser.firstName')
        .addGroupBy('doctorUser.lastName')
        .orderBy('MAX(doctor.rating_average)', 'DESC')
        .addOrderBy('MAX(doctor.total_reviews)', 'DESC')
        .limit(10)
        .getRawMany(),
    ]);

    const cancellationRate = totalReservations > 0
      ? Number(((totalCancellations / totalReservations) * 100).toFixed(2))
      : 0;

    const averageRating = Number(parseFloat(averageRatingRaw?.avg || '0').toFixed(2));

    return {
      summary: {
        totalReservations,
        totalCompletedAppointments,
        totalCancellations,
        cancellationRate,
        averageRating,
        activeDoctors: Number(activeDoctors?.count || 0),
        activePatients: Number(activePatients?.count || 0),
      },
      reservationsSeries: reservationsSeriesRaw.map((row) => ({
        date: row.date,
        total: Number(row.total),
      })),
      cancellationsSeries: cancellationsSeriesRaw.map((row) => ({
        date: row.date,
        total: Number(row.total),
      })),
      cancellationsByReason: cancellationsByReasonRaw.map((row) => ({
        reason: row.reason,
        total: Number(row.total),
      })),
      ratingsBySpecialty: ratingsBySpecialtyRaw.map((row) => ({
        specialtyId: row.specialtyId || 'none',
        specialty: row.specialty || 'Sin especialidad',
        average: Number(parseFloat(row.average || '0').toFixed(2)),
        totalReviews: Number(row.totalReviews || 0),
      })),
      topDoctorsByAppointments: topDoctorsByAppointmentsRaw.map((row) => ({
        doctorId: row.doctorId,
        doctorName: row.doctorName,
        specialty: row.specialty,
        totalAppointments: Number(row.totalAppointments || 0),
        averageRating: Number(parseFloat(row.averageRating || '0').toFixed(2)),
        totalReviews: Number(row.totalReviews || 0),
      })),
      topDoctorsByRating: topDoctorsByRatingRaw.map((row) => ({
        doctorId: row.doctorId,
        doctorName: row.doctorName,
        specialty: row.specialty,
        totalAppointments: Number(row.totalAppointments || 0),
        averageRating: Number(parseFloat(row.averageRating || '0').toFixed(2)),
        totalReviews: Number(row.totalReviews || 0),
      })),
      generatedAt: new Date().toISOString(),
    };
  }

  async getReservations(filters: AdminReservationsFilters): Promise<{
    items: Array<{
      id: string;
      appointmentDate: string;
      status: string;
      patientName: string;
      doctorName: string;
      specialty: string;
      createdAt: string;
    }>;
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const cacheKey = buildCacheKey('admin:reservations', filters);
    const cached = await this.getCached<{
      items: Array<{
        id: string;
        appointmentDate: string;
        status: string;
        patientName: string;
        doctorName: string;
        specialty: string;
        createdAt: string;
      }>;
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(cacheKey);
    if (cached) return cached;

    const qb = this.appointmentRepo
      .createQueryBuilder('appointment')
      .innerJoin('appointment.patient', 'patient')
      .innerJoin('appointment.doctor', 'doctor')
      .innerJoin('doctor.user', 'doctorUser')
      .leftJoin('doctor.specialties', 'specialty');

    if (filters.status) qb.andWhere('appointment.status = :status', { status: filters.status });
    if (filters.startDate) qb.andWhere('appointment.appointment_date >= :startDate', { startDate: filters.startDate });
    if (filters.endDate) qb.andWhere('appointment.appointment_date <= :endDate', { endDate: filters.endDate });
    if (filters.doctorId) qb.andWhere('appointment.doctor_id = :doctorId', { doctorId: filters.doctorId });

    const total = await qb.getCount();
    const rows = await qb
      .select('appointment.id', 'id')
      .addSelect('appointment.appointment_date', 'appointmentDate')
      .addSelect('appointment.status', 'status')
      .addSelect("CONCAT(patient.firstName, ' ', patient.lastName)", 'patientName')
      .addSelect("CONCAT(doctorUser.firstName, ' ', doctorUser.lastName)", 'doctorName')
      .addSelect("COALESCE(MAX(specialty.name_es), 'Sin especialidad')", 'specialty')
      .addSelect('appointment.created_at', 'createdAt')
      .groupBy('appointment.id')
      .addGroupBy('appointment.appointment_date')
      .addGroupBy('appointment.status')
      .addGroupBy('patient.firstName')
      .addGroupBy('patient.lastName')
      .addGroupBy('doctorUser.firstName')
      .addGroupBy('doctorUser.lastName')
      .addGroupBy('appointment.created_at')
      .orderBy('appointment.appointment_date', 'DESC')
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit)
      .getRawMany();

    const result = {
      items: rows.map((row) => ({
        id: row.id,
        appointmentDate: new Date(row.appointmentDate).toISOString(),
        status: row.status,
        patientName: row.patientName,
        doctorName: row.doctorName,
        specialty: row.specialty,
        createdAt: new Date(row.createdAt).toISOString(),
      })),
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / filters.limit)),
      },
    };

    await this.setCached(cacheKey, result);
    return result;
  }

  async getCancellations(filters: AdminCancellationsFilters): Promise<{
    items: Array<{
      id: string;
      appointmentDate: string;
      patientName: string;
      doctorName: string;
      cancellationReason: string;
      cancelledAt: string;
    }>;
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const cacheKey = buildCacheKey('admin:cancellations', filters);
    const cached = await this.getCached<{
      items: Array<{
        id: string;
        appointmentDate: string;
        patientName: string;
        doctorName: string;
        cancellationReason: string;
        cancelledAt: string;
      }>;
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(cacheKey);
    if (cached) return cached;

    const qb = this.appointmentRepo
      .createQueryBuilder('appointment')
      .innerJoin('appointment.patient', 'patient')
      .innerJoin('appointment.doctor', 'doctor')
      .innerJoin('doctor.user', 'doctorUser')
      .where('appointment.status = :status', { status: 'cancelled' });

    if (filters.reason) {
      qb.andWhere('appointment.cancellation_reason LIKE :reason', { reason: `%${filters.reason}%` });
    }
    if (filters.startDate) qb.andWhere('appointment.updated_at >= :startDate', { startDate: filters.startDate });
    if (filters.endDate) qb.andWhere('appointment.updated_at <= :endDate', { endDate: filters.endDate });

    const total = await qb.getCount();
    const rows = await qb
      .select('appointment.id', 'id')
      .addSelect('appointment.appointment_date', 'appointmentDate')
      .addSelect("CONCAT(patient.firstName, ' ', patient.lastName)", 'patientName')
      .addSelect("CONCAT(doctorUser.firstName, ' ', doctorUser.lastName)", 'doctorName')
      .addSelect("COALESCE(appointment.cancellation_reason, 'Sin motivo')", 'cancellationReason')
      .addSelect('appointment.updated_at', 'cancelledAt')
      .orderBy('appointment.updated_at', 'DESC')
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit)
      .getRawMany();

    const result = {
      items: rows.map((row) => ({
        id: row.id,
        appointmentDate: new Date(row.appointmentDate).toISOString(),
        patientName: row.patientName,
        doctorName: row.doctorName,
        cancellationReason: row.cancellationReason,
        cancelledAt: new Date(row.cancelledAt).toISOString(),
      })),
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / filters.limit)),
      },
    };

    await this.setCached(cacheKey, result);
    return result;
  }
}
