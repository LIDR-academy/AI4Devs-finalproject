import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class UpdateDoctorProfileDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  @MinLength(1, { message: 'El nombre no puede estar vacío' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'El apellido debe ser un texto' })
  @MinLength(1, { message: 'El apellido no puede estar vacío' })
  lastName?: string;

  @IsOptional()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'El teléfono debe usar formato E.164 (ej: +521234567890)',
  })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'La bio debe ser un texto' })
  @MaxLength(1000, { message: 'La bio no puede exceder 1000 caracteres' })
  bio?: string;

  @ValidateIf((o: UpdateDoctorProfileDto) => o.postalCode !== undefined)
  @IsString({ message: 'La dirección debe ser un texto' })
  @MinLength(1, { message: 'La dirección es obligatoria cuando se actualiza el código postal' })
  address?: string;

  @ValidateIf((o: UpdateDoctorProfileDto) => o.address !== undefined)
  @IsString({ message: 'El código postal debe ser un texto' })
  @MinLength(1, {
    message: 'El código postal es obligatorio cuando se actualiza la dirección',
  })
  postalCode?: string;
}
