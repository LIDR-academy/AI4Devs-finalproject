import { AppDataSource } from '../config/database';
import { EntityManager } from 'typeorm';
import { notificationQueue } from '../config/queue';
import { AuditLog } from '../models/audit-log.entity';
import { Doctor } from '../models/doctor.entity';
import { VerificationDocument } from '../models/verification-document.entity';

export interface AdminVerificationListFilters {
  page: number;
  limit: number;
  status?: 'pending' | 'approved' | 'rejected';
}

export class AdminVerificationService {
  private async syncDoctorVerificationStatus(
    manager: EntityManager,
    doctor: Doctor,
    adminUserId: string,
    notes?: string
  ): Promise<void> {
    const documentRepo = manager.getRepository(VerificationDocument);
    const totalDocumentsRow = await documentRepo
      .createQueryBuilder('doc')
      .select('COUNT(*)', 'totalDocuments')
      .where('doc.doctor_id = :doctorId', { doctorId: doctor.id })
      .getRawOne<{ totalDocuments: string }>();

    const notApprovedDocumentsRow = await documentRepo
      .createQueryBuilder('doc')
      .select('COUNT(*)', 'notApprovedDocuments')
      .where('doc.doctor_id = :doctorId', { doctorId: doctor.id })
      .andWhere('doc.status <> :approvedStatus', { approvedStatus: 'approved' })
      .getRawOne<{ notApprovedDocuments: string }>();

    const total = Number(totalDocumentsRow?.totalDocuments || 0);
    const notApproved = Number(notApprovedDocumentsRow?.notApprovedDocuments || 0);
    const shouldBeApproved = total === 0 || notApproved === 0;

    const nextStatus: 'approved' | 'pending' = shouldBeApproved ? 'approved' : 'pending';
    doctor.verificationStatus = nextStatus;
    doctor.verifiedBy = adminUserId;
    doctor.verifiedAt = new Date();
    doctor.verificationNotes = notes?.trim() || null;
    await manager.getRepository(Doctor).save(doctor);
  }

  async listDoctors(filters: AdminVerificationListFilters): Promise<{
    items: Array<{
      doctorId: string;
      userId: string;
      fullName: string;
      email: string;
      specialty: string;
      verificationStatus: 'pending' | 'approved' | 'rejected';
      totalDocuments: number;
      pendingDocuments: number;
      approvedDocuments: number;
      rejectedDocuments: number;
      createdAt: string;
      verificationNotes?: string;
    }>;
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const doctorRepo = AppDataSource.getRepository(Doctor);
    const qb = doctorRepo
      .createQueryBuilder('doctor')
      .innerJoin('doctor.user', 'user')
      .leftJoin('doctor.specialties', 'specialty')
      .leftJoin('VERIFICATION_DOCUMENTS', 'doc', 'doc.doctor_id = doctor.id');

    if (filters.status === 'pending') {
      // Incluye inconsistencias históricas: médicos con documentos pendientes aunque
      // el estado agregado del doctor no se haya sincronizado correctamente.
      qb.andWhere(
        `(doctor.verification_status = :doctorStatusPending
          OR EXISTS (
            SELECT 1
            FROM VERIFICATION_DOCUMENTS pending_doc
            WHERE pending_doc.doctor_id = doctor.id
              AND pending_doc.status = :documentStatusPending
          ))`,
        {
          doctorStatusPending: 'pending',
          documentStatusPending: 'pending',
        }
      );
    } else if (filters.status) {
      qb.andWhere('doctor.verification_status = :status', { status: filters.status });
    }

    const total = await qb.getCount();
    const rows = await qb
      .select('doctor.id', 'doctorId')
      .addSelect('doctor.user_id', 'userId')
      .addSelect("CONCAT(user.firstName, ' ', user.lastName)", 'fullName')
      .addSelect('user.email', 'email')
      .addSelect("COALESCE(MAX(specialty.name_es), 'Sin especialidad')", 'specialty')
      .addSelect('doctor.verification_status', 'verificationStatus')
      .addSelect('doctor.verification_notes', 'verificationNotes')
      .addSelect('COUNT(DISTINCT doc.id)', 'totalDocuments')
      .addSelect(
        "COUNT(DISTINCT CASE WHEN doc.status = 'pending' THEN doc.id END)",
        'pendingDocuments'
      )
      .addSelect(
        "COUNT(DISTINCT CASE WHEN doc.status = 'approved' THEN doc.id END)",
        'approvedDocuments'
      )
      .addSelect(
        "COUNT(DISTINCT CASE WHEN doc.status = 'rejected' THEN doc.id END)",
        'rejectedDocuments'
      )
      .addSelect('doctor.created_at', 'createdAt')
      .groupBy('doctor.id')
      .addGroupBy('doctor.user_id')
      .addGroupBy('user.firstName')
      .addGroupBy('user.lastName')
      .addGroupBy('user.email')
      .addGroupBy('doctor.verification_status')
      .addGroupBy('doctor.verification_notes')
      .addGroupBy('doctor.created_at')
      .orderBy('doctor.created_at', 'DESC')
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit)
      .getRawMany();

    return {
      items: rows.map((row) => ({
        doctorId: row.doctorId,
        userId: row.userId,
        fullName: row.fullName,
        email: row.email,
        specialty: row.specialty,
        verificationStatus: row.verificationStatus,
        totalDocuments: Number(row.totalDocuments || 0),
        pendingDocuments: Number(row.pendingDocuments || 0),
        approvedDocuments: Number(row.approvedDocuments || 0),
        rejectedDocuments: Number(row.rejectedDocuments || 0),
        verificationNotes: row.verificationNotes || undefined,
        createdAt: new Date(row.createdAt).toISOString(),
      })),
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / filters.limit)),
      },
    };
  }

  async listDoctorDocuments(doctorId: string): Promise<Array<{
    id: string;
    status: string;
    documentType: string;
    originalFilename: string;
    createdAt: string;
  }>> {
    const documents = await AppDataSource.getRepository(VerificationDocument).find({
      where: { doctorId },
      order: { createdAt: 'DESC' },
    });

    return documents.map((doc) => ({
      id: doc.id,
      status: doc.status,
      documentType: doc.documentType,
      originalFilename: doc.originalFilename,
      createdAt: doc.createdAt.toISOString(),
    }));
  }

  async approveDoctor(params: {
    doctorId: string;
    adminUserId: string;
    ipAddress: string;
    notes?: string;
  }): Promise<{ doctorId: string; verificationStatus: string; verifiedAt: string }> {
    const { doctorId, adminUserId, ipAddress, notes } = params;

    const result = await AppDataSource.transaction(async (manager) => {
      const doctorRepo = manager.getRepository(Doctor);
      const auditRepo = manager.getRepository(AuditLog);
      const documentRepo = manager.getRepository(VerificationDocument);

      const doctor = await doctorRepo.findOne({ where: { id: doctorId } });
      if (!doctor) throw new Error('DOCTOR_NOT_FOUND');

      const oldValues = {
        verificationStatus: doctor.verificationStatus,
        verifiedBy: doctor.verifiedBy,
        verifiedAt: doctor.verifiedAt,
        verificationNotes: doctor.verificationNotes,
      };

      await documentRepo
        .createQueryBuilder()
        .update(VerificationDocument)
        .set({ status: 'approved' })
        .where('doctor_id = :doctorId', { doctorId })
        .andWhere('status = :status', { status: 'pending' })
        .execute();

      await this.syncDoctorVerificationStatus(manager, doctor, adminUserId, notes);

      await auditRepo.save(
        auditRepo.create({
          action: 'approve_doctor_verification',
          entityType: 'doctor',
          entityId: doctor.id,
          userId: adminUserId,
          ipAddress,
          oldValues: JSON.stringify(oldValues),
          newValues: JSON.stringify({
            verificationStatus: doctor.verificationStatus,
            verifiedBy: doctor.verifiedBy,
            verifiedAt: doctor.verifiedAt,
            verificationNotes: doctor.verificationNotes,
          }),
        })
      );

      return doctor;
    });

    try {
      await notificationQueue.add('send-doctor-verification-status', {
        doctorId: result.id,
        status: result.verificationStatus,
        notes: notes || null,
      });
    } catch {
      // La cola es best-effort en MVP.
    }

    return {
      doctorId: result.id,
      verificationStatus: result.verificationStatus,
      verifiedAt: (result.verifiedAt || new Date()).toISOString(),
    };
  }

  async rejectDoctor(params: {
    doctorId: string;
    adminUserId: string;
    ipAddress: string;
    notes: string;
  }): Promise<{ doctorId: string; verificationStatus: string; verificationNotes: string }> {
    const { doctorId, adminUserId, ipAddress, notes } = params;

    if (!notes.trim()) {
      throw new Error('REJECTION_NOTES_REQUIRED');
    }

    const result = await AppDataSource.transaction(async (manager) => {
      const doctorRepo = manager.getRepository(Doctor);
      const auditRepo = manager.getRepository(AuditLog);
      const documentRepo = manager.getRepository(VerificationDocument);

      const doctor = await doctorRepo.findOne({ where: { id: doctorId } });
      if (!doctor) throw new Error('DOCTOR_NOT_FOUND');

      const oldValues = {
        verificationStatus: doctor.verificationStatus,
        verifiedBy: doctor.verifiedBy,
        verifiedAt: doctor.verifiedAt,
        verificationNotes: doctor.verificationNotes,
      };

      doctor.verificationStatus = 'rejected';
      doctor.verifiedBy = adminUserId;
      doctor.verifiedAt = new Date();
      doctor.verificationNotes = notes.trim();
      await doctorRepo.save(doctor);

      await documentRepo
        .createQueryBuilder()
        .update(VerificationDocument)
        .set({ status: 'rejected' })
        .where('doctor_id = :doctorId', { doctorId })
        .andWhere('status = :status', { status: 'pending' })
        .execute();

      await auditRepo.save(
        auditRepo.create({
          action: 'reject_doctor_verification',
          entityType: 'doctor',
          entityId: doctor.id,
          userId: adminUserId,
          ipAddress,
          oldValues: JSON.stringify(oldValues),
          newValues: JSON.stringify({
            verificationStatus: doctor.verificationStatus,
            verifiedBy: doctor.verifiedBy,
            verifiedAt: doctor.verifiedAt,
            verificationNotes: doctor.verificationNotes,
          }),
        })
      );

      return doctor;
    });

    try {
      await notificationQueue.add('send-doctor-verification-status', {
        doctorId: result.id,
        status: 'rejected',
        notes: result.verificationNotes || '',
      });
    } catch {
      // La cola es best-effort en MVP.
    }

    return {
      doctorId: result.id,
      verificationStatus: result.verificationStatus,
      verificationNotes: result.verificationNotes || '',
    };
  }
}
