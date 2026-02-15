import fs from 'fs';
import multer from 'multer';
import { Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { UploadVerificationDocumentDto } from '../dto/verification/upload-document.dto';
import {
  VerificationError,
  VerificationService,
} from '../services/verification.service';
import { logger } from '../utils/logger';

const verificationService = new VerificationService();

function getRequestIp(req: AuthenticatedRequest): string {
  return req.ip || req.socket.remoteAddress || '0.0.0.0';
}

function sendVerificationError(res: Response, error: unknown): Response {
  if (error instanceof VerificationError) {
    return res.status(error.status).json({
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString(),
    });
  }

  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'El archivo excede el tamaño máximo permitido',
      code: 'FILE_TOO_LARGE',
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(500).json({
    error: 'Error interno del servidor',
    code: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
  });
}

export const verificationController = {
  uploadMyDocument: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          error: 'No autenticado',
          code: 'NOT_AUTHENTICATED',
          timestamp: new Date().toISOString(),
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error: 'El archivo document es requerido',
          code: 'MISSING_DOCUMENT_FILE',
          timestamp: new Date().toISOString(),
        });
      }

      const dto = plainToInstance(UploadVerificationDocumentDto, {
        documentType: req.body.documentType,
      });
      const errors = await validate(dto);
      if (errors.length > 0) {
        return res.status(400).json({
          error: 'documentType inválido',
          code: 'INVALID_DOCUMENT_TYPE',
          timestamp: new Date().toISOString(),
        });
      }

      const result = await verificationService.uploadDocument({
        userId,
        ipAddress: getRequestIp(req),
        file: req.file,
        documentType: dto.documentType || 'cedula',
      });

      return res.status(201).json({
        message: 'Documento subido, pendiente de revisión',
        document: result,
      });
    } catch (error) {
      logger.error('Error al subir documento de verificación:', error);
      return sendVerificationError(res, error);
    }
  },

  listMyDocuments: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          error: 'No autenticado',
          code: 'NOT_AUTHENTICATED',
          timestamp: new Date().toISOString(),
        });
      }

      const documents = await verificationService.getMyDocuments(userId);
      return res.status(200).json({ documents });
    } catch (error) {
      logger.error('Error al listar documentos de verificación:', error);
      return sendVerificationError(res, error);
    }
  },

  getSignedUrlForAdmin: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { documentId } = req.params;
      const result = await verificationService.getAdminSignedUrl(documentId);

      return res.status(200).json({
        signedUrl: result.url,
        expiresInSeconds: result.expiresInSeconds,
      });
    } catch (error) {
      logger.error('Error al generar URL firmada de verificación:', error);
      return sendVerificationError(res, error);
    }
  },

  streamSignedDocument: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { token } = req.params;
      const file = await verificationService.resolveSignedDocumentToken(token);

      res.setHeader('Content-Type', file.mimeType);
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${encodeURIComponent(file.originalFilename)}"`
      );
      const stream = fs.createReadStream(file.filePath);
      stream.on('error', () => {
        res.status(500).json({
          error: 'No se pudo leer el archivo solicitado',
          code: 'FILE_READ_ERROR',
          timestamp: new Date().toISOString(),
        });
      });
      return stream.pipe(res);
    } catch (error) {
      logger.error('Error al resolver URL firmada de documento:', error);
      return sendVerificationError(res, error);
    }
  },
};
