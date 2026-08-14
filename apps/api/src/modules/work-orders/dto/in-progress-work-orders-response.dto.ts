import { InProgressWorkOrderItemDto } from './in-progress-work-order-item.dto';

export class InProgressWorkOrdersResponseDto {
  items!: InProgressWorkOrderItemDto[];
  total!: number;
  limit!: number;
  offset!: number;
}
