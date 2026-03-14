import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RejectActionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  notes!: string;
}
