import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HceService } from './hce.service';
import { HceController } from './hce.controller';
import { Patient } from './entities/patient.entity';
import { MedicalRecord } from './entities/medical-record.entity';
import { Allergy } from './entities/allergy.entity';
import { Medication } from './entities/medication.entity';
import { LabResult } from './entities/lab-result.entity';
import { Image } from './entities/image.entity';
import { EncryptionService } from './services/encryption.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Patient,
      MedicalRecord,
      Allergy,
      Medication,
      LabResult,
      Image,
    ]),
  ],
  controllers: [HceController],
  providers: [HceService, EncryptionService],
  exports: [HceService],
})
export class HceModule {}
