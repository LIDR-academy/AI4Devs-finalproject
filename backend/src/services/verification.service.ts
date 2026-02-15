import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import * as jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { AuditLog } from '../models/audit-log.entity';
import { Doctor } from '../models/doctor.entity';
import {
  VerificationDocument,
  VerificationDocumentStatus,
  VerificationDocumentType,
} from '../models/verification-document.entity';
import { logger } from '../utils/logger';

const BYTES_PER_MB = 1024 * 1024;
const ALLOWED_MIME_TO_EXT: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};
const ALLOWED_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png']);
const MALWARE_EICAR_SIGNATURE = 'EICAR-STANDARD-ANTIVIRUS-TEST-FILE';

export class VerificationError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'VerificationError';
  }
}

interface UploadDocumentParams {
  userId: string;
  ipAddress: string;
  file: Express.Multer.File;
  documentType: VerificationDocumentType;
}

interface SignedDocumentPayload {
  documentId: string;
  purpose: 'verification_document_view';
}

export class VerificationService {
  private readonly verificationRepo = AppDataSource.getRepository(VerificationDocument);
  private readonly doctorRepo = AppDataSource.getRepository(Doctor);
  private readonly auditRepo = AppDataSource.getRepository(AuditLog);

  private getUploadsPath(): string {
    return process.env.UPLOADS_PATH
      ? path.resolve(process.env.UPLOADS_PATH)
      : path.resolve(process.cwd(), 'storage', 'uploads');
  }

  private getMaxFileBytes(): number {
    const maxFileSizeMb = Number(process.env.MAX_FILE_SIZE_MB || '10');
    return maxFileSizeMb * BYTES_PER_MB;
  }

  private getSignedUrlSecret(): string {
    return process.env.VERIFICATION_SIGNED_URL_SECRET
      || process.env.JWT_ACCESS_SECRET
      || 'verification-dev-secret';
  }

  private getApiBaseUrl(): string {
    return (
      process.env.PUBLIC_API_URL
      || process.env.API_BASE_URL
      || `http://localhost:${process.env.API_PORT || 4000}`
    );
  }

  private async ensureUploadsDirectory(): Promise<void> {
    const uploadsPath = this.getUploadsPath();
    await fs.mkdir(uploadsPath, { recursive: true, mode: 0o700 });
    await fs.chmod(uploadsPath, 0o700);
  }

  private mapDocumentType(rawType?: string): VerificationDocumentType {
    if (rawType === 'diploma' || rawType === 'other') {
      return rawType;
    }
    return 'cedula';
  }

  private async validateFile(file: Express.Multer.File): Promise<{
    canonicalMimeType: string;
    canonicalExtension: string;
  }> {
    const maxFileBytes = this.getMaxFileBytes();
    if (file.size > maxFileBytes) {
      throw new VerificationError(
        'FILE_TOO_LARGE',
        400,
        `El archivo excede el tamaño máximo permitido (${maxFileBytes / BYTES_PER_MB}MB)`
      );
    }

    const originalExtension = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (!ALLOWED_EXTENSIONS.has(originalExtension)) {
      throw new VerificationError(
        'INVALID_FILE_TYPE',
        400,
        'Tipo de archivo no permitido. Solo PDF, JPG y PNG.'
      );
    }

    const detectedMime = this.detectMimeType(file.buffer);
    if (!detectedMime || !(detectedMime in ALLOWED_MIME_TO_EXT)) {
      throw new VerificationError(
        'INVALID_FILE_TYPE',
        400,
        'No se pudo validar el tipo MIME real del archivo.'
      );
    }

    const canonicalExtension = ALLOWED_MIME_TO_EXT[detectedMime];
    if (
      (canonicalExtension === 'jpg' && !['jpg', 'jpeg'].includes(originalExtension))
      || (canonicalExtension !== 'jpg' && canonicalExtension !== originalExtension)
    ) {
      throw new VerificationError(
        'INVALID_FILE_TYPE',
        400,
        'La extensión del archivo no coincide con su contenido real.'
      );
    }

    return {
      canonicalMimeType: detectedMime,
      canonicalExtension,
    };
  }

  private detectMimeType(buffer: Buffer): string | null {
    if (buffer.length >= 4) {
      // PDF magic number: 25 50 44 46
      if (
        buffer[0] === 0x25 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x44 &&
        buffer[3] === 0x46
      ) {
        return 'application/pdf';
      }
    }

    if (buffer.length >= 3) {
      // JPEG magic number: FF D8 FF
      if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        return 'image/jpeg';
      }
    }

    if (buffer.length >= 8) {
      // PNG magic number: 89 50 4E 47 0D 0A 1A 0A
      if (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0d &&
        buffer[5] === 0x0a &&
        buffer[6] === 0x1a &&
        buffer[7] === 0x0a
      ) {
        return 'image/png';
      }
    }

    return null;
  }

  private async scanForMalware(file: Express.Multer.File): Promise<void> {
    if (file.buffer.toString('utf-8').includes(MALWARE_EICAR_SIGNATURE)) {
      throw new VerificationError(
        'MALWARE_DETECTED',
        400,
        'Se detectó malware en el archivo cargado'
      );
    }

    if (process.env.MALWARE_SCAN_STRICT !== 'true') {
      return;
    }

    logger.warn(
      'MALWARE_SCAN_STRICT=true sin adaptador real de antivirus. ' +
        'Se aplicó solo validación EICAR.'
    );
  }

  private async getDoctorByUserId(userId: string): Promise<Doctor> {
    const doctor = await this.doctorRepo.findOne({ where: { userId } });
    if (!doctor) {
      throw new VerificationError(
        'DOCTOR_PROFILE_NOT_FOUND',
        404,
        'Perfil de médico no encontrado'
      );
    }
    return doctor;
  }

  async uploadDocument(params: UploadDocumentParams): Promise<{
    id: string;
    documentType: VerificationDocumentType;
    status: VerificationDocumentStatus;
    originalFilename: string;
    mimeType: string;
    fileSizeBytes: number;
    createdAt: string;
  }> {
    const { userId, ipAddress, file } = params;
    const doctor = await this.getDoctorByUserId(userId);
    const documentType = this.mapDocumentType(params.documentType);
    await this.ensureUploadsDirectory();

    const { canonicalMimeType, canonicalExtension } = await this.validateFile(file);
    await this.scanForMalware(file);

    const randomSuffix = crypto.randomBytes(8).toString('hex');
    const fileName = `${doctor.id}_${Date.now()}_${randomSuffix}.${canonicalExtension}`;
    const storagePath = path.join(this.getUploadsPath(), fileName);
    const normalizedStoragePath = path.resolve(storagePath);

    if (!normalizedStoragePath.startsWith(this.getUploadsPath())) {
      throw new VerificationError('INVALID_STORAGE_PATH', 500, 'Ruta de almacenamiento inválida');
    }

    await fs.writeFile(normalizedStoragePath, file.buffer, { mode: 0o600 });

    const savedDocument = await this.verificationRepo.save(
      this.verificationRepo.create({
        doctorId: doctor.id,
        filePath: normalizedStoragePath,
        originalFilename: file.originalname,
        mimeType: canonicalMimeType,
        fileSizeBytes: String(file.size),
        documentType,
        status: 'pending',
      })
    );

    await this.auditRepo.save(
      this.auditRepo.create({
        action: 'upload_verification_document',
        entityType: 'verification_document',
        entityId: savedDocument.id,
        userId,
        ipAddress,
        newValues: JSON.stringify({
          doctorId: doctor.id,
          documentType,
          status: savedDocument.status,
          mimeType: savedDocument.mimeType,
          fileSizeBytes: savedDocument.fileSizeBytes,
        }),
      })
    );

    return {
      id: savedDocument.id,
      documentType: savedDocument.documentType,
      status: savedDocument.status,
      originalFilename: savedDocument.originalFilename,
      mimeType: savedDocument.mimeType,
      fileSizeBytes: Number(savedDocument.fileSizeBytes),
      createdAt: savedDocument.createdAt.toISOString(),
    };
  }

  async getMyDocuments(userId: string): Promise<
    Array<{
      id: string;
      documentType: VerificationDocumentType;
      status: VerificationDocumentStatus;
      originalFilename: string;
      mimeType: string;
      fileSizeBytes: number;
      createdAt: string;
    }>
  > {
    const doctor = await this.getDoctorByUserId(userId);
    const documents = await this.verificationRepo.find({
      where: { doctorId: doctor.id },
      order: { createdAt: 'DESC' },
    });

    return documents.map((doc) => ({
      id: doc.id,
      documentType: doc.documentType,
      status: doc.status,
      originalFilename: doc.originalFilename,
      mimeType: doc.mimeType,
      fileSizeBytes: Number(doc.fileSizeBytes),
      createdAt: doc.createdAt.toISOString(),
    }));
  }

  async getAdminSignedUrl(documentId: string): Promise<{ url: string; expiresInSeconds: number }> {
    const document = await this.verificationRepo.findOne({ where: { id: documentId } });
    if (!document) {
      throw new VerificationError(
        'VERIFICATION_DOCUMENT_NOT_FOUND',
        404,
        'Documento de verificación no encontrado'
      );
    }

    const expiresInSeconds = Number(process.env.VERIFICATION_SIGNED_URL_TTL_SECONDS || '900');
    const payload: SignedDocumentPayload = {
      documentId: document.id,
      purpose: 'verification_document_view',
    };
    const token = jwt.sign(payload, this.getSignedUrlSecret(), {
      expiresIn: expiresInSeconds,
    });

    return {
      url: `${this.getApiBaseUrl()}/api/v1/verification-documents/file/${token}`,
      expiresInSeconds,
    };
  }

  async resolveSignedDocumentToken(token: string): Promise<{
    filePath: string;
    mimeType: string;
    originalFilename: string;
  }> {
    let payload: SignedDocumentPayload;
    try {
      payload = jwt.verify(token, this.getSignedUrlSecret()) as SignedDocumentPayload;
    } catch {
      throw new VerificationError(
        'INVALID_SIGNED_URL',
        401,
        'URL firmada inválida o expirada'
      );
    }

    if (payload.purpose !== 'verification_document_view') {
      throw new VerificationError('INVALID_SIGNED_URL', 401, 'URL firmada inválida');
    }

    const document = await this.verificationRepo.findOne({ where: { id: payload.documentId } });
    if (!document) {
      throw new VerificationError(
        'VERIFICATION_DOCUMENT_NOT_FOUND',
        404,
        'Documento de verificación no encontrado'
      );
    }

    await fs.access(document.filePath);

    return {
      filePath: document.filePath,
      mimeType: document.mimeType,
      originalFilename: document.originalFilename,
    };
  }
}
