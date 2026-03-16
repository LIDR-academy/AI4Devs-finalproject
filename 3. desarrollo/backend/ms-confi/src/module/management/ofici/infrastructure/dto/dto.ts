import { OficiEntity } from "../../domain/entity";
import { Type } from "class-transformer";
import { IsNumberField, IsStringField } from "src/shared/util";
import { ApiProperty } from '@nestjs/swagger';
import { OficiEnum } from "../enum/enum";

export class OficiDto implements OficiEntity {

    // Atributos
    @Type(() => String)
    @IsStringField({ message: `Nombre de la ${OficiEnum.title}` })
    @ApiProperty({ example: 'Matriz', description: `Nombre de la ${OficiEnum.title}` })
    ofici_nom_ofici: string;

    @Type(() => String)
    @IsStringField({ message: `Dirección de la ${OficiEnum.title}` })
    @ApiProperty({ example: 'Av. Principal ', description: `Dirección de la ${OficiEnum.title}` })
    ofici_dir_ofici: string;

    // Relaciones
    @Type(() => Number)
    @IsNumberField({ message: `Código de la Empresa` })
    @ApiProperty({ example: 1, description: `Código de la Empresa` })
    ofici_cod_empre: number;

    @Type(() => Number)
    @IsNumberField({ message: `Código del Tipo del oficina` })
    @ApiProperty({ example: 1, description: `El código del Tipo del oficina` })
    ofici_cod_tofic: number;

}