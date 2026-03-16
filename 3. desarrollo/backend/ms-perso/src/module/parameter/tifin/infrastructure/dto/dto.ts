import { IsOptional, IsIn, IsBoolean } from "class-validator";
import { TifinEntity } from "../../domain/entity";
import { Type } from "class-transformer";
import { IsPositiveField, IsStringField, MinField } from "src/shared/util";
import { ApiProperty } from "@nestjs/swagger";

export class TifinDto implements TifinEntity {
  @IsOptional()
  @Type(() => Number)
  @IsPositiveField({ message: 'El ID' })
  @MinField({ message: 'El ID del tipo financiero', minValue: 1 })
  @ApiProperty({ example: 1, description: 'Código del tipo financiero', required: false })
  tifin_cod_tifin?: number;

  @Type(() => String)
  @IsStringField({ message: 'El nombre del tipo financiero' })
  @ApiProperty({ example: 'SUELDO/SALARIO', description: 'Nombre del tipo financiero' })
  tifin_nom_tifin: string;

  @Type(() => String)
  @IsIn(['I', 'G', 'A', 'P'], { message: 'El tipo debe ser I (Ingreso), G (Gasto), A (Activo) o P (Pasivo)' })
  @ApiProperty({ example: 'I', description: 'Tipo financiero: I=Ingreso, G=Gasto, A=Activo, P=Pasivo', enum: ['I', 'G', 'A', 'P'] })
  tifin_tip_tifin: 'I' | 'G' | 'A' | 'P';

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'El estado debe ser un valor booleano' })
  tifin_est_tifin?: boolean;
}

