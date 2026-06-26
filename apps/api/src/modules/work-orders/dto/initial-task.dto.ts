import { IsString, Length } from 'class-validator';

export class InitialTaskDto {
  @IsString()
  @Length(3, 300)
  description!: string;
}
