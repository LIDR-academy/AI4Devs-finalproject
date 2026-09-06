import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateClientDto {
  @IsString()
  @Length(2, 150)
  fullName!: string;

  @IsString()
  @Length(5, 20)
  @Matches(/^[a-zA-Z0-9-]+$/)
  nationalId!: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{8,15}$/)
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
