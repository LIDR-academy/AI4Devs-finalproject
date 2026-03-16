import { IsOptional } from "class-validator";
import { TrepEntity } from "../../domain/entity";
import { Type } from "class-transformer";
import { IsPositiveField, IsStringField, MinField, IsBooleanField } from "src/shared/util";
import { ApiProperty } from "@nestjs/swagger";

export class TrepDto implements TrepEntity {
  @IsOptional()
  @Type(() => Number)
  @IsPositiveField({ message: 'El ID' })
  @MinField({ message: 'El ID del tipo de representante', minValue: 1 })
  @ApiProperty({ example: 1, description: 'Código del tipo de representante legal', required: false })
  trep_cod_trep?: number;

  @Type(() => String)
  @IsStringField({ message: 'El nombre del tipo de representante' })
  @ApiProperty({ example: 'REPRESENTANTE LEGAL', description: 'Nombre del tipo de representante legal' })
  trep_nom_trep: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBooleanField({ message: 'El estado' })
  @ApiProperty({ example: true, description: 'Estado activo/inactivo', required: false, default: true })
  trep_est_trep?: boolean;
}

