import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateReviewDto {
  @IsInt({ message: 'rating debe ser un número entero' })
  @Min(1, { message: 'rating debe ser mínimo 1' })
  @Max(5, { message: 'rating debe ser máximo 5' })
  rating!: number;

  @IsString({ message: 'comment debe ser string' })
  @IsNotEmpty({ message: 'comment es requerido' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @MinLength(10, { message: 'comment debe tener al menos 10 caracteres' })
  @MaxLength(1000, { message: 'comment no puede exceder 1000 caracteres' })
  comment!: string;
}
