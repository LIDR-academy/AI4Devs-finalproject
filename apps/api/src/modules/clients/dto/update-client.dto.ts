import { IsEmail, IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateClientDto {
  @IsString()
  @Length(2, 150)
  fullName!: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{8,15}$/)
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
