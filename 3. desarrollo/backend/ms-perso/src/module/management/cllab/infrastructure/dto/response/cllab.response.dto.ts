import { CllabEntity } from "../../../domain/entity";
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta de Información Laboral
 * Implementa la interfaz CllabEntity directamente
 */
export class CllabResponseDto implements CllabEntity {
  @ApiProperty({ example: 1, description: 'ID único de la información laboral' })
  cllab_cod_clab?: number;

  @ApiProperty({ example: 1, description: 'ID del cliente (rrfclien)' })
  cllab_cod_clien: number;

  @ApiProperty({ example: 1, description: 'ID de la dependencia/institución', required: false, nullable: true })
  cllab_cod_depen?: number | null;

  @ApiProperty({ example: 'GERENTE GENERAL', description: 'Cargo que desempeña', required: false, nullable: true })
  cllab_des_cargo?: string | null;

  @ApiProperty({ example: 1, description: 'Tipo de contrato (FK a rrftcont)', required: false, nullable: true })
  cllab_cod_tcont?: number | null;

  @ApiProperty({ example: '2020-01-15', description: 'Fecha ingreso al trabajo', required: false, nullable: true })
  cllab_fec_ingre?: Date | null;

  @ApiProperty({ example: '2025-12-31', description: 'Fecha fin de contrato', required: false, nullable: true })
  cllab_fec_finct?: Date | null;

  @ApiProperty({ example: 2500.00, description: 'Ingreso mensual', required: false, nullable: true, type: Number })
  cllab_val_ingre?: number | null;

  @ApiProperty({ example: 'AV. PRINCIPAL 123', description: 'Dirección del trabajo', required: false, nullable: true })
  cllab_dir_traba?: string | null;

  @ApiProperty({ example: '0999999999', description: 'Teléfono del trabajo', required: false, nullable: true })
  cllab_tlf_traba?: string | null;

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

