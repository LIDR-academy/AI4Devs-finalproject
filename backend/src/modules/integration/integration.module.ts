import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationService } from './integration.service';
import { IntegrationController } from './integration.controller';
import { OrthancService } from './services/orthanc.service';
import { HL7Service } from './services/hl7.service';
import { Patient } from '../hce/entities/patient.entity';
import { MedicalRecord } from '../hce/entities/medical-record.entity';
import { LabResult } from '../hce/entities/lab-result.entity';
import { Image } from '../hce/entities/image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Patient, MedicalRecord, LabResult, Image]),
  ],
  controllers: [IntegrationController],
  providers: [IntegrationService, OrthancService, HL7Service],
  exports: [IntegrationService, OrthancService, HL7Service],
})
export class IntegrationModule {}
