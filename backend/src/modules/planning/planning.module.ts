import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanningService } from './planning.service';
import { ChecklistService } from './services/checklist.service';
import { OperatingRoomService } from './services/operating-room.service';
import { DicomAnalysisService } from './services/dicom-analysis.service';
import { PlanningController } from './planning.controller';
import { OperatingRoomController } from './controllers/operating-room.controller';
import { Surgery } from './entities/surgery.entity';
import { SurgicalPlanning } from './entities/surgical-planning.entity';
import { DicomImage } from './entities/dicom-image.entity';
import { Checklist } from './entities/checklist.entity';
import { ChecklistVersion } from './entities/checklist-version.entity';
import { OperatingRoom } from './entities/operating-room.entity';
import { Patient } from '../hce/entities/patient.entity';
import { IntegrationModule } from '../integration/integration.module';
import { MonitoringModule } from '../monitoring/monitoring.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Surgery,
      SurgicalPlanning,
      DicomImage,
      Checklist,
      ChecklistVersion,
      OperatingRoom,
      Patient,
    ]),
    IntegrationModule,
    MonitoringModule,
  ],
  controllers: [PlanningController, OperatingRoomController],
  providers: [PlanningService, ChecklistService, OperatingRoomService, DicomAnalysisService],
  exports: [PlanningService, ChecklistService, OperatingRoomService, DicomAnalysisService],
})
export class PlanningModule {}
