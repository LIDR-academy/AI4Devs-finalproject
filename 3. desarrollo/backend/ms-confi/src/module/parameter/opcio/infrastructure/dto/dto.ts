import { IsOptional } from "class-validator";
import { OpcioEntity } from "../../domain/entity";
import { Type } from "class-transformer";
import { IsPositiveField, IsStringField, MinField } from "src/shared/util";
import { ApiProperty } from '@nestjs/swagger';

export class OpcioDto implements OpcioEntity {

    @IsOptional()
    @Type(() => String)
    @ApiProperty({ example: "03", description: 'El ID de la opción' })
    opcio_cod_opcio?: string;

    @Type(() => String)
    @IsStringField({ message: 'Descripción' })
    @ApiProperty({ example: 'Descripción del Opcio', description: 'La descripción del Opcio' })
    opcio_des_opcio: string;


    @Type(() => String)
    @IsStringField({ message: 'URL' })
    @ApiProperty({ example: '/cartera/home', description: 'La URL del Opcio' })
    opcio_www_opcio: string;

    @Type(() => String)
    @IsStringField({ message: 'Código del padre' })
    @ApiProperty({ example: '0301', description: 'El código del padre del Opcio' })
    opcio_cod_padre: string;


    @Type(() => String)
    @IsStringField({ message: 'Estado' })
    @ApiProperty({ example: 'A', description: 'El estado del Opcio' })
    opcio_est_opcio: string;

    @Type(() => Number)
    @IsPositiveField({ message: 'El ID del ícono' })
    @MinField({ message: 'El ID del ícono', minValue: 0 })
    @ApiProperty({ example: 1, description: 'El ID del ícono' })
    opcio_cod_icons: number;
}