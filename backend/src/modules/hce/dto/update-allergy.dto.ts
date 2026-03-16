import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAllergyDto {
  @ApiProperty({ description: 'Alérgeno', required: false })
  @IsString()
  @IsOptional()
  allergen?: string;

  @ApiProperty({
    description: 'Severidad',
    enum: ['Low', 'Medium', 'High', 'Critical'],
    required: false,
  })
  @IsEnum(['Low', 'Medium', 'High', 'Critical'])
  @IsOptional()
  severity?: string;

  @ApiProperty({ description: 'Notas', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
