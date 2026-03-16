import { IsOptional } from "class-validator";
import { TidenEntity } from "../../domain/entity";
import { Type } from "class-transformer";
import { IsPositiveField, IsStringField, MinField } from "src/shared/util";
import { IsBoolean } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class TidenDto implements TidenEntity {

    @IsOptional()
    @Type(() => Number)
    @IsPositiveField({ message: 'El ID' })
    @MinField({ message: 'El ID del tipo de identificación', minValue: 1 })
    @ApiProperty({ example: 1, description: 'Código del tipo de identificación', required: false })
    tiden_cod_tiden?: number;

    @Type(() => String)
    @IsStringField({ message: 'El nombre del tipo de identificación' })
    @ApiProperty({ example: 'CÉDULA', description: 'Nombre del tipo de identificación' })
    tiden_nom_tiden: string;

    @Type(() => Number)
    @IsPositiveField({ message: 'La longitud mínima' })
    @MinField({ message: 'La longitud mínima', minValue: 1 })
    @ApiProperty({ example: 10, description: 'Longitud mínima del número de identificación' })
    tiden_lon_minim: number;

    @Type(() => Number)
    @IsPositiveField({ message: 'La longitud máxima' })
    @MinField({ message: 'La longitud máxima', minValue: 1 })
    @ApiProperty({ example: 10, description: 'Longitud máxima del número de identificación' })
    tiden_lon_maxim: number;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean({ message: 'El estado debe ser un valor booleano' })
    @ApiProperty({ example: true, description: 'Estado activo/inactivo', required: false, default: true })
    tiden_est_tiden?: boolean;
}