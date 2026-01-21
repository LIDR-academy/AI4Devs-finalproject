import { Type } from "class-transformer";
import { IsPositiveField, IsRequiredField, MinField} from "src/shared/util";

export class IdDto {
    @Type(() => Number)
    @IsRequiredField({ message: 'El ID es requerido' })
    @IsPositiveField({ message: 'El ID debe ser un número positivo' })
    @MinField({ message: 'El ID', minValue: 1 })
    id: number;

}