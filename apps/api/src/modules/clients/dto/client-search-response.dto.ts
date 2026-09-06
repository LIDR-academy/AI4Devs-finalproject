import { ClientResponseDto } from './client-response.dto';

export class ClientSearchResponseDto {
  items!: ClientResponseDto[];
  total!: number;
}
