import { IsString, IsNotEmpty } from 'class-validator';

export class AddWatchlistDto {
  @IsString()
  @IsNotEmpty()
  id_obra: string;
}
