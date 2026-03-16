import { ParroquiaEntity } from "../../../domain/entity";
import { ApiProperty } from '@nestjs/swagger';

export class ParroquiaResponseDto implements ParroquiaEntity {
  @ApiProperty({ example: 1, description: 'ID único de la parroquia' })
  parro_cod_parro?: number;

  @ApiProperty({ example: 1, description: 'ID del cantón al que pertenece' })
  canto_cod_canto: number;

  @ApiProperty({ example: '01', description: 'Código SEPS de la parroquia' })
  parro_cod_parr: string;

  @ApiProperty({ example: 'El Sagrario', description: 'Nombre de la parroquia' })
  parro_nom_parro: string;

  @ApiProperty({ 
    example: 'U', 
    description: 'Tipo de área: R=Rural, U=Urbano',
    enum: ['R', 'U'],
    required: false,
    nullable: true
  })
  parro_tip_area?: 'R' | 'U' | null;

  @ApiProperty({ example: true, description: 'Indica si la parroquia está activa' })
  parro_flg_acti: boolean;

  @ApiProperty({ example: '2025-01-01T00:00:00Z', description: 'Fecha de creación', required: false })
  parro_fec_creac?: Date;

  @ApiProperty({ example: '2025-01-01T00:00:00Z', description: 'Fecha de última modificación', required: false })
  parro_fec_modif?: Date;

  @ApiProperty({ example: null, description: 'Fecha de eliminación (soft delete)', required: false, nullable: true })
  parro_fec_elimi?: Date | null;
}

