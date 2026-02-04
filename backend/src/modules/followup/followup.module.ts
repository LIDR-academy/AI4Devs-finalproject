import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostopEvolution } from './entities/postop-evolution.entity';
import { DischargePlan } from './entities/discharge-plan.entity';
import { Surgery } from '../planning/entities/surgery.entity';
import { FollowupService } from './followup.service';
import { FollowupController } from './followup.controller';
import { PdfGeneratorService } from './services/pdf-generator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostopEvolution, DischargePlan, Surgery]),
  ],
  controllers: [FollowupController],
  providers: [FollowupService, PdfGeneratorService],
  exports: [FollowupService],
})
export class FollowupModule {}
