import { IsString, IsUUID, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStaffAssignmentDto {
  @ApiProperty({ description: 'ID de la cirugía' })
  @IsUUID()
  surgeryId: string;

  @ApiProperty({ description: 'ID del usuario (staff)' })
  @IsUUID('4', { message: 'userId debe ser un UUID válido' })
  userId: string;

  @ApiProperty({ example: 'surgeon', description: 'Rol: surgeon, nurse, anesthetist, assistant, other' })
  @IsString()
  @MaxLength(50)
  role: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
