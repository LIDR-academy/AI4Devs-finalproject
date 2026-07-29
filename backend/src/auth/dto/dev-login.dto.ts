import { IsEmail } from 'class-validator';

export class DevLoginDto {
  @IsEmail()
  email: string;
}
