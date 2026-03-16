import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Documentation } from './entities/documentation.entity';
import { DocumentationVersion } from './entities/documentation-version.entity';
import { DocumentationService } from './services/documentation.service';
import { DocumentationController } from './documentation.controller';
import { DocumentationGateway } from './documentation.gateway';
import { Surgery } from '../planning/entities/surgery.entity';
import { MonitoringModule } from '../monitoring/monitoring.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Documentation, DocumentationVersion, Surgery]),
    MonitoringModule,
  ],
  controllers: [DocumentationController],
  providers: [DocumentationService, DocumentationGateway],
  exports: [DocumentationService, DocumentationGateway],
})
export class DocumentationModule {}
