import { ClrfiEntity } from "../../../domain/entity";
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta de Residencia Fiscal
 * Implementa la interfaz ClrfiEntity directamente
 */
export class ClrfiResponseDto implements ClrfiEntity {
  @ApiProperty({ example: 1, description: 'ID único de la residencia fiscal' })
  clrfi_cod_clrfi?: number;

  @ApiProperty({ example: 1, description: 'ID del cliente (rrfclien)' })
  clrfi_cod_clien: number;

  @ApiProperty({ example: false, description: 'Tiene residencia fiscal extranjera (CRS/FATCA)' })
  clrfi_ctr_resfi: boolean;

  @ApiProperty({ example: 1, description: 'ID del país de residencia fiscal (rrfnacio)', required: false, nullable: true })
  clrfi_cod_nacio?: number | null;

  @ApiProperty({ example: 'AV. PRINCIPAL 123', description: 'Dirección', required: false, nullable: true })
  clrfi_dir_resfi?: string | null;

  @ApiProperty({ example: 'CALIFORNIA', description: 'Provincia (texto libre)', required: false, nullable: true })
  clrfi_des_provi?: string | null;

  @ApiProperty({ example: 'LOS ANGELES', description: 'Ciudad (texto libre)', required: false, nullable: true })
  clrfi_des_ciuda?: string | null;

  @ApiProperty({ example: '90001', description: 'Código postal', required: false, nullable: true })
  clrfi_cod_posta?: string | null;

  @ApiProperty({ example: '2025-01-15T00:00:00Z', description: 'Fecha de creación', required: false })
  created_at?: Date;

  @ApiProperty({ example: '2025-01-15T00:00:00Z', description: 'Fecha de última modificación', required: false })
  updated_at?: Date;

  @ApiProperty({ example: 1, description: 'ID del usuario que creó el registro' })
  created_by: number;

  @ApiProperty({ example: 1, description: 'ID del usuario que modificó el registro' })
  updated_by: number;

  @ApiProperty({ example: null, description: 'Fecha de eliminación (soft delete)', required: false, nullable: true })
  deleted_at?: Date | null;
}

