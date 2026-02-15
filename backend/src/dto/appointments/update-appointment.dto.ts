import {
  IsISO8601,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class UpdateAppointmentDto {
  @IsOptional()
  @IsIn(['cancelled'], { message: "status solo puede ser 'cancelled'" })
  status?: 'cancelled';

  @ValidateIf((o: UpdateAppointmentDto) => o.status !== 'cancelled')
  @IsUUID('4', { message: 'slotId debe ser un UUID válido' })
  @IsOptional()
  slotId?: string;

  @ValidateIf((o: UpdateAppointmentDto) => o.status !== 'cancelled')
  @IsISO8601(
    {},
    { message: 'appointmentDate debe ser una fecha ISO 8601 válida' }
  )
  @IsOptional()
  appointmentDate?: string;

  @ValidateIf((o: UpdateAppointmentDto) => o.status === 'cancelled')
  @IsString({ message: 'cancellationReason debe ser un texto' })
  @MaxLength(500, {
    message: 'cancellationReason no puede exceder 500 caracteres',
  })
  @IsOptional()
  cancellationReason?: string;
}
