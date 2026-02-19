import { Module } from '@nestjs/common';
import { MockOrdersController } from './mock-orders.controller';
import { MockOrdersService } from './mock-orders.service';
import { StoresModule } from '../stores/stores.module';
import { UsersModule } from '../users/users.module';
import { OrdersModule } from '../orders/orders.module';
import { ConversationsModule } from '../conversations/conversations.module';
import { EcommerceSyncModule } from '../ecommerce-sync/ecommerce-sync.module';

@Module({
  imports: [
    StoresModule,
    UsersModule,
    OrdersModule,
    ConversationsModule,
    EcommerceSyncModule,
  ],
  controllers: [MockOrdersController],
  providers: [MockOrdersService],
})
export class MockModule {}
