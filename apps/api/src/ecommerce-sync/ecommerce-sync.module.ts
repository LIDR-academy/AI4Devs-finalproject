import { Module } from '@nestjs/common';
import { EcommerceSyncService } from './ecommerce-sync.service';

@Module({
  providers: [EcommerceSyncService],
  exports: [EcommerceSyncService],
})
export class EcommerceSyncModule {}
