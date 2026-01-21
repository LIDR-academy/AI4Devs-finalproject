import { IsOptional } from "class-validator";
import { InstrEntity } from "../../domain/entity";
import { Type } from "class-transformer";
import { IsPositiveField, IsStringField, MinField, IsBooleanField, LengthField } from "src/shared/util";
import { ApiProperty } from "@nestjs/swagger";

export class InstrDto implements InstrEntity {
  @IsOptional()
  @Type(() => Number)
  @IsPositiveField({ message: 'El ID' })
  @MinField({ message: 'El ID del nivel de instrucción', minValue: 0 })
  @ApiProperty({ example: 1, description: 'Código del nivel de instrucción', required: false })
  instr_cod_instr?: number;

  @Type(() => String)
  @IsStringField({ message: 'El nombre del nivel de instrucción' })
  @ApiProperty({ example: 'PRIMARIA', description: 'Nombre del nivel de instrucción' })
  instr_nom_instr: string;

  @Type(() => String)
  @IsStringField({ message: 'El código SEPS' })
  @LengthField({ message: 'El código SEPS' }, 1, 2)
  @ApiProperty({ example: '2', description: 'Código SEPS del nivel de instrucción' })
  instr_cod_seps: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBooleanField({ message: 'El estado' })
  @ApiProperty({ example: true, description: 'Estado activo/inactivo', required: false, default: true })
  instr_est_instr?: boolean;
}

