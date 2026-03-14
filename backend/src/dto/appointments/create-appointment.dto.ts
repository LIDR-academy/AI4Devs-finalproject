import {
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsISO8601,
  MaxLength,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsNotEmpty({ message: 'doctorId es obligatorio' })
  @IsUUID('4', { message: 'doctorId debe ser un UUID válido' })
  doctorId!: string;

  @IsNotEmpty({ message: 'slotId es obligatorio' })
  @IsUUID('4', { message: 'slotId debe ser un UUID válido' })
  slotId!: string;

  @IsNotEmpty({ message: 'appointmentDate es obligatorio' })
  @IsISO8601(
    {},
    { message: 'appointmentDate debe ser una fecha ISO 8601 válida' }
  )
  appointmentDate!: string;

  @IsOptional()
  @MaxLength(500, { message: 'notes no puede exceder 500 caracteres' })
  notes?: string;
}
