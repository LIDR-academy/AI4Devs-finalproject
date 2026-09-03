import { Module } from '@nestjs/common';
import { AiGenerationModule } from '../ai-generation/ai-generation.module';
import { BusinessProfileModule } from '../business-profile/business-profile.module';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';

@Module({
  imports: [BusinessProfileModule, AiGenerationModule],
  controllers: [AssetsController],
  providers: [AssetsService],
})
export class AssetsModule {}
