import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanningService } from './planning.service';
import { ChecklistService } from './services/checklist.service';
import { OperatingRoomService } from './services/operating-room.service';
import { PlanningController } from './planning.controller';
import { OperatingRoomController } from './controllers/operating-room.controller';
import { Surgery } from './entities/surgery.entity';
import { SurgicalPlanning } from './entities/surgical-planning.entity';
import { DicomImage } from './entities/dicom-image.entity';
import { Checklist } from './entities/checklist.entity';
import { OperatingRoom } from './entities/operating-room.entity';
import { Patient } from '../hce/entities/patient.entity';
import { IntegrationModule } from '../integration/integration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Surgery,
      SurgicalPlanning,
      DicomImage,
      Checklist,
      OperatingRoom,
      Patient,
    ]),
    IntegrationModule,
  ],
  controllers: [PlanningController, OperatingRoomController],
  providers: [PlanningService, ChecklistService, OperatingRoomService],
  exports: [PlanningService, ChecklistService, OperatingRoomService],
})
export class PlanningModule {}
