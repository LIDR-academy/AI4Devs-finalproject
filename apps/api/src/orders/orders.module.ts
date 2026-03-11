import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Module({
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
