import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ExternalOrderIdService } from './external-order-id.service';

@Module({
  providers: [OrdersService, ExternalOrderIdService],
  exports: [OrdersService, ExternalOrderIdService],
})
export class OrdersModule {}
