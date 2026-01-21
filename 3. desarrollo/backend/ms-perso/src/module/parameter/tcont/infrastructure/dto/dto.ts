import { IsOptional } from "class-validator";
import { TcontEntity } from "../../domain/entity";
import { Type } from "class-transformer";
import { IsPositiveField, IsStringField, MinField, IsBooleanField } from "src/shared/util";
import { ApiProperty } from "@nestjs/swagger";

export class TcontDto implements TcontEntity {
  @IsOptional()
  @Type(() => Number)
  @IsPositiveField({ message: 'El ID' })
  @MinField({ message: 'El ID del tipo de contrato', minValue: 1 })
  @ApiProperty({ example: 1, description: 'Código del tipo de contrato laboral', required: false })
  tcont_cod_tcont?: number;

  @Type(() => String)
  @IsStringField({ message: 'El nombre del tipo de contrato' })
  @ApiProperty({ example: 'INDEFINIDO', description: 'Nombre del tipo de contrato laboral' })
  tcont_nom_tcont: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBooleanField({ message: 'El estado' })
  @ApiProperty({ example: true, description: 'Estado activo/inactivo', required: false, default: true })
  tcont_est_tcont?: boolean;
}

