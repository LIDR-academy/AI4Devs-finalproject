import { IsOptional } from "class-validator";
import { EtniaEntity } from "../../domain/entity";
import { Type } from "class-transformer";
import { IsPositiveField, IsStringField, MinField, IsBooleanField, LengthField } from "src/shared/util";
import { ApiProperty } from "@nestjs/swagger";

export class EtniaDto implements EtniaEntity {
  @IsOptional()
  @Type(() => Number)
  @IsPositiveField({ message: 'El ID' })
  @MinField({ message: 'El ID de la etnia', minValue: 1 })
  @ApiProperty({ example: 1, description: 'Código de la etnia', required: false })
  etnia_cod_etnia?: number;

  @Type(() => String)
  @IsStringField({ message: 'El nombre de la etnia' })
  @ApiProperty({ example: 'MESTIZO', description: 'Nombre de la etnia' })
  etnia_nom_etnia: string;

  @Type(() => String)
  @IsStringField({ message: 'El código SEPS' })
  @LengthField({ message: 'El código SEPS' }, 1, 2)
  @ApiProperty({ example: '1', description: 'Código SEPS de la etnia' })
  etnia_cod_seps: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBooleanField({ message: 'El estado' })
  @ApiProperty({ example: true, description: 'Estado activo/inactivo', required: false, default: true })
  etnia_est_etnia?: boolean;
}

