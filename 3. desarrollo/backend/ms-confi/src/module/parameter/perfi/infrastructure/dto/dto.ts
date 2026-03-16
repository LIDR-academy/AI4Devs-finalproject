import { IsOptional } from "class-validator";
import { PerfiEntity } from "../../domain/entity";
import { Type } from "class-transformer";
import { IsPositiveField, IsStringField, MinField } from "src/shared/util";
import { ApiProperty } from '@nestjs/swagger';

export class PerfiDto implements PerfiEntity {

    @IsOptional()
    @Type(() => Number)
    @IsPositiveField({ message: 'El ID' })
    @MinField({ message: 'El ID del estado', minValue: 0 })
    @ApiProperty({ example: 1, description: 'El ID del Perfil' })
    perfi_cod_perfi?: number;

    @Type(() => String)
    @IsStringField({ message: 'Descripción' })
    @ApiProperty({ example: 'Descripción del Perfil', description: 'La descripción del Perfil' })
    perfi_des_perfi: string;
}