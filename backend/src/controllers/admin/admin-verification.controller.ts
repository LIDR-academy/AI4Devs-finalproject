import { Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { VerificationService } from '../../services/verification.service';
import { VerificationListQueryDto } from '../../dto/admin/verification-list-query.dto';
import { RejectActionDto } from '../../dto/admin/reject-action.dto';
import { AdminVerificationService } from '../../services/admin-verification.service';
import { AdminMetricsService } from '../../services/admin-metrics.service';
import { logger } from '../../utils/logger';

const adminVerificationService = new AdminVerificationService();
const verificationService = new VerificationService();
const adminMetricsService = new AdminMetricsService();

function sendError(res: Response, error: string, code: string, status = 400) {
  return res.status(status).json({
    error,
    code,
    timestamp: new Date().toISOString(),
  });
}

export const adminVerificationController = {
  list: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const dto = plainToInstance(VerificationListQueryDto, req.query);
      const errors = await validate(dto);
      if (errors.length > 0) {
        return sendError(res, 'Parámetros inválidos', 'INVALID_VERIFICATION_FILTERS');
      }

      const data = await adminVerificationService.listDoctors({
        page: dto.page || 1,
        limit: dto.limit || 20,
        status: dto.status,
      });
      return res.status(200).json(data);
    } catch (error) {
      logger.error('Error al listar verificación admin:', error);
      return sendError(res, 'Error interno del servidor', 'INTERNAL_ERROR', 500);
    }
  },

  listDoctorDocuments: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { doctorId } = req.params;
      const documents = await adminVerificationService.listDoctorDocuments(doctorId);
      return res.status(200).json({ documents });
    } catch (error) {
      logger.error('Error al listar documentos del médico:', error);
      return sendError(res, 'Error interno del servidor', 'INTERNAL_ERROR', 500);
    }
  },

  getSignedUrl: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { documentId } = req.params;
      const result = await verificationService.getAdminSignedUrl(documentId);
      return res.status(200).json({
        signedUrl: result.url,
        expiresInSeconds: result.expiresInSeconds,
      });
    } catch (error) {
      logger.error('Error al generar URL firmada admin:', error);
      return sendError(res, 'Documento no encontrado', 'VERIFICATION_DOCUMENT_NOT_FOUND', 404);
    }
  },

  approve: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { doctorId } = req.params;
      const adminUserId = req.user!.id;
      const ipAddress = req.ip || req.socket.remoteAddress || '0.0.0.0';
      const notes = typeof req.body?.notes === 'string' ? req.body.notes : undefined;

      const result = await adminVerificationService.approveDoctor({
        doctorId,
        adminUserId,
        ipAddress,
        notes,
      });
      await adminMetricsService.invalidateMetricsCache();

      return res.status(200).json({
        message: 'Médico aprobado correctamente',
        ...result,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'DOCTOR_NOT_FOUND') {
        return sendError(res, 'Médico no encontrado', 'DOCTOR_NOT_FOUND', 404);
      }
      logger.error('Error al aprobar médico:', error);
      return sendError(res, 'Error interno del servidor', 'INTERNAL_ERROR', 500);
    }
  },

  reject: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { doctorId } = req.params;
      const adminUserId = req.user!.id;
      const ipAddress = req.ip || req.socket.remoteAddress || '0.0.0.0';
      const dto = plainToInstance(RejectActionDto, req.body);
      const errors = await validate(dto);
      if (errors.length > 0) {
        return sendError(
          res,
          'La nota de rechazo es requerida',
          'REJECTION_NOTES_REQUIRED'
        );
      }

      const result = await adminVerificationService.rejectDoctor({
        doctorId,
        adminUserId,
        ipAddress,
        notes: dto.notes,
      });
      await adminMetricsService.invalidateMetricsCache();

      return res.status(200).json({
        message: 'Médico rechazado correctamente',
        ...result,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'DOCTOR_NOT_FOUND') {
        return sendError(res, 'Médico no encontrado', 'DOCTOR_NOT_FOUND', 404);
      }
      if (error instanceof Error && error.message === 'REJECTION_NOTES_REQUIRED') {
        return sendError(res, 'La nota de rechazo es requerida', 'REJECTION_NOTES_REQUIRED');
      }
      logger.error('Error al rechazar médico:', error);
      return sendError(res, 'Error interno del servidor', 'INTERNAL_ERROR', 500);
    }
  },
};
