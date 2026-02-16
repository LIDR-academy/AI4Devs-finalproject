import { IsEnum, IsOptional } from 'class-validator';
import { VerificationDocumentType } from '../../models/verification-document.entity';

export class UploadVerificationDocumentDto {
  @IsOptional()
  @IsEnum(['cedula', 'diploma', 'other'], {
    message: 'documentType debe ser cedula, diploma u other',
  })
  documentType?: VerificationDocumentType;
}
