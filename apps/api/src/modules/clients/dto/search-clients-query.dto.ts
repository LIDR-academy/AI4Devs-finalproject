import { IsOptional, IsString, MinLength } from 'class-validator';

export class SearchClientsQueryDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  q?: string;

  @IsOptional()
  @IsString()
  nationalId?: string;
}
