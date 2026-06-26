import { DeliveryReadyItemDto } from './delivery-ready-item.dto';

export class DeliveryReadyListResponseDto {
  items!: DeliveryReadyItemDto[];
  total!: number;
}
