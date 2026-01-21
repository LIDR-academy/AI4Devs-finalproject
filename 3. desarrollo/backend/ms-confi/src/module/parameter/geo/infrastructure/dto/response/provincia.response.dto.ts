import { ProvinciaEntity } from "../../../domain/entity";
import { ApiProperty } from '@nestjs/swagger';

export class ProvinciaResponseDto implements ProvinciaEntity {
  @ApiProperty({ example: 1, description: 'ID único de la provincia' })
  provi_cod_provi?: number;

  @ApiProperty({ example: '01', description: 'Código SEPS/INEC de la provincia' })
  provi_cod_prov: string;

  @ApiProperty({ example: 'Azuay', description: 'Nombre de la provincia' })
  provi_nom_provi: string;

  @ApiProperty({ example: true, description: 'Indica si la provincia está activa' })
  provi_flg_acti: boolean;

  @ApiProperty({ example: '2025-01-01T00:00:00Z', description: 'Fecha de creación', required: false })
  provi_fec_creac?: Date;

  @ApiProperty({ example: '2025-01-01T00:00:00Z', description: 'Fecha de última modificación', required: false })
  provi_fec_modif?: Date;

  @ApiProperty({ example: null, description: 'Fecha de eliminación (soft delete)', required: false, nullable: true })
  provi_fec_elimi?: Date | null;
}

