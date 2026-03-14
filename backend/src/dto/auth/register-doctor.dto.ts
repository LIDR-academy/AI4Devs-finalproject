import { IsString, MinLength, IsOptional, MaxLength, IsNumber } from 'class-validator';
import { RegisterDto } from './register.dto';

export class RegisterDoctorDto extends RegisterDto {
  @IsString({ message: 'La dirección debe ser un texto' })
  @MinLength(1, { message: 'La dirección es obligatoria' })
  address!: string;

  @IsString({ message: 'El código postal debe ser un texto' })
  @MinLength(1, { message: 'El código postal es obligatorio' })
  postalCode!: string;

  @IsOptional()
  @IsString({ message: 'La bio debe ser un texto' })
  @MaxLength(1000, { message: 'La bio no puede exceder 1000 caracteres' })
  bio?: string;

  @IsOptional()
  @IsNumber({}, { message: 'La latitud debe ser un número' })
  latitude?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La longitud debe ser un número' })
  longitude?: number;
}
