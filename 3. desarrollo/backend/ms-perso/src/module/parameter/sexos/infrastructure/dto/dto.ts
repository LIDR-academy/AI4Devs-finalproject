import { IsOptional } from "class-validator";
import { SexosEntity } from "../../domain/entity";
import { Type } from "class-transformer";
import { IsPositiveField, IsStringField, MinField, IsBooleanField, LengthField } from "src/shared/util";
import { ApiProperty } from "@nestjs/swagger";

export class SexosDto implements SexosEntity {
  @IsOptional()
  @Type(() => Number)
  @IsPositiveField({ message: 'El ID' })
  @MinField({ message: 'El ID del sexo', minValue: 1 })
  @ApiProperty({ example: 1, description: 'Código del sexo', required: false })
  sexos_cod_sexos?: number;

  @Type(() => String)
  @IsStringField({ message: 'El nombre del sexo' })
  @ApiProperty({ example: 'MASCULINO', description: 'Nombre del sexo' })
  sexos_nom_sexos: string;

  @Type(() => String)
  @IsStringField({ message: 'El código SEPS' })
  @LengthField({ message: 'El código SEPS' }, 1, 1)
  @ApiProperty({ example: 'M', description: 'Código SEPS (M=Masculino, F=Femenino, N=No aplica)' })
  sexos_cod_seps: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBooleanField({ message: 'El estado' })
  @ApiProperty({ example: true, description: 'Estado activo/inactivo', required: false, default: true })
  sexos_est_sexos?: boolean;
}

