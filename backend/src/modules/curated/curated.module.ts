import { Module } from '@nestjs/common';
import { CuratedController } from './curated.controller';
import { CuratedService } from './curated.service';

@Module({
  controllers: [CuratedController],
  providers: [CuratedService],
})
export class CuratedModule {}
