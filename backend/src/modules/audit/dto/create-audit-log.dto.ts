import { IsEnum, IsUUID, IsString, IsOptional, IsObject } from 'class-validator';
import { AuditAction } from '../entities/audit-log.entity';

export class CreateAuditLogDto {
  @IsUUID()
  userId: string;

  @IsEnum(AuditAction)
  action: AuditAction;

  @IsString()
  @IsOptional()
  entityType?: string | null;

  @IsUUID()
  @IsOptional()
  entityId?: string | null;

  @IsObject()
  @IsOptional()
  changes?: {
    before?: any;
    after?: any;
    metadata?: any;
  } | null;

  @IsString()
  @IsOptional()
  ipAddress?: string | null;

  @IsString()
  @IsOptional()
  userAgent?: string | null;

  @IsString()
  @IsOptional()
  endpoint?: string | null;

  @IsString()
  @IsOptional()
  method?: string | null;
}
