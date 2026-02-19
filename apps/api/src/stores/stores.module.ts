import { Module } from '@nestjs/common';
import { StoresService } from './stores.service';

@Module({
  providers: [StoresService],
  exports: [StoresService],
})
export class StoresModule {}
