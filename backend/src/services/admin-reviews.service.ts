import { AppDataSource } from '../config/database';
import { AuditLog } from '../models/audit-log.entity';
import { Doctor } from '../models/doctor.entity';
import { Review } from '../models/review.entity';

export class AdminReviewsService {
  async listModerationQueue(page = 1, limit = 20): Promise<{
    items: Array<{
      reviewId: string;
      patientId: string;
      patientName: string;
      doctorId: string;
      doctorName: string;
      rating: number;
      comment: string;
      createdAt: string;
      appointmentId: string;
      moderationStatus: string;
    }>;
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const reviewRepo = AppDataSource.getRepository(Review);
    const qb = reviewRepo
      .createQueryBuilder('review')
      .innerJoin('review.patient', 'patient')
      .innerJoin('review.doctor', 'doctor')
      .innerJoin('doctor.user', 'doctorUser')
      .where('review.moderation_status = :status', { status: 'pending' });

    const total = await qb.getCount();
    const rows = await qb
      .select('review.id', 'reviewId')
      .addSelect('review.patient_id', 'patientId')
      .addSelect("CONCAT(patient.firstName, ' ', patient.lastName)", 'patientName')
      .addSelect('review.doctor_id', 'doctorId')
      .addSelect("CONCAT(doctorUser.firstName, ' ', doctorUser.lastName)", 'doctorName')
      .addSelect('review.rating', 'rating')
      .addSelect('review.comment', 'comment')
      .addSelect('review.created_at', 'createdAt')
      .addSelect('review.appointment_id', 'appointmentId')
      .addSelect('review.moderation_status', 'moderationStatus')
      .orderBy('review.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getRawMany();

    return {
      items: rows.map((row) => ({
        reviewId: row.reviewId,
        patientId: row.patientId,
        patientName: row.patientName,
        doctorId: row.doctorId,
        doctorName: row.doctorName,
        rating: Number(row.rating),
        comment: row.comment,
        createdAt: new Date(row.createdAt).toISOString(),
        appointmentId: row.appointmentId,
        moderationStatus: row.moderationStatus,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  private async recalculateDoctorRating(doctorId: string): Promise<void> {
    const reviewRepo = AppDataSource.getRepository(Review);
    const doctorRepo = AppDataSource.getRepository(Doctor);

    const agg = await reviewRepo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .addSelect('COUNT(review.id)', 'total')
      .where('review.doctor_id = :doctorId', { doctorId })
      .andWhere('review.moderation_status = :status', { status: 'approved' })
      .getRawOne();

    const doctor = await doctorRepo.findOne({ where: { id: doctorId } });
    if (!doctor) return;

    const average = Number(parseFloat(agg?.avg || '0').toFixed(2));
    const total = Number(agg?.total || 0);
    doctor.ratingAverage = average;
    doctor.totalReviews = total;
    await doctorRepo.save(doctor);
  }

  async approveReview(params: {
    reviewId: string;
    adminUserId: string;
    ipAddress: string;
    notes?: string;
  }): Promise<{ reviewId: string; moderationStatus: string; moderatedAt: string }> {
    const { reviewId, adminUserId, ipAddress, notes } = params;

    const review = await AppDataSource.transaction(async (manager) => {
      const reviewRepo = manager.getRepository(Review);
      const auditRepo = manager.getRepository(AuditLog);

      const current = await reviewRepo.findOne({ where: { id: reviewId } });
      if (!current) throw new Error('REVIEW_NOT_FOUND');

      const oldValues = {
        moderationStatus: current.moderationStatus,
        moderationNotes: current.moderationNotes || undefined,
      };

      current.moderationStatus = 'approved';
      current.moderatedBy = adminUserId;
      current.moderatedAt = new Date();
      current.moderationNotes = notes?.trim() || undefined;
      await reviewRepo.save(current);

      await auditRepo.save(
        auditRepo.create({
          action: 'approve_review_moderation',
          entityType: 'review',
          entityId: current.id,
          userId: adminUserId,
          ipAddress,
          oldValues: JSON.stringify(oldValues),
          newValues: JSON.stringify({
            moderationStatus: current.moderationStatus,
            moderatedBy: current.moderatedBy,
            moderatedAt: current.moderatedAt,
            moderationNotes: current.moderationNotes,
          }),
        })
      );

      return current;
    });

    await this.recalculateDoctorRating(review.doctorId);

    return {
      reviewId: review.id,
      moderationStatus: review.moderationStatus,
      moderatedAt: (review.moderatedAt || new Date()).toISOString(),
    };
  }

  async rejectReview(params: {
    reviewId: string;
    adminUserId: string;
    ipAddress: string;
    notes: string;
  }): Promise<{ reviewId: string; moderationStatus: string; moderationNotes: string }> {
    const { reviewId, adminUserId, ipAddress, notes } = params;
    if (!notes.trim()) {
      throw new Error('MODERATION_NOTES_REQUIRED');
    }

    const review = await AppDataSource.transaction(async (manager) => {
      const reviewRepo = manager.getRepository(Review);
      const auditRepo = manager.getRepository(AuditLog);

      const current = await reviewRepo.findOne({ where: { id: reviewId } });
      if (!current) throw new Error('REVIEW_NOT_FOUND');

      const oldValues = {
        moderationStatus: current.moderationStatus,
        moderationNotes: current.moderationNotes || undefined,
      };

      current.moderationStatus = 'rejected';
      current.moderatedBy = adminUserId;
      current.moderatedAt = new Date();
      current.moderationNotes = notes.trim();
      await reviewRepo.save(current);

      await auditRepo.save(
        auditRepo.create({
          action: 'reject_review_moderation',
          entityType: 'review',
          entityId: current.id,
          userId: adminUserId,
          ipAddress,
          oldValues: JSON.stringify(oldValues),
          newValues: JSON.stringify({
            moderationStatus: current.moderationStatus,
            moderatedBy: current.moderatedBy,
            moderatedAt: current.moderatedAt,
            moderationNotes: current.moderationNotes,
          }),
        })
      );

      return current;
    });

    await this.recalculateDoctorRating(review.doctorId);

    return {
      reviewId: review.id,
      moderationStatus: review.moderationStatus,
      moderationNotes: review.moderationNotes || '',
    };
  }
}
