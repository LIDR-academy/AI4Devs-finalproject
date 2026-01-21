import { Module } from '@nestjs/common';
import { GeoController } from './controller/controller';
import { GeoService } from '../infrastructure/service/service';
import { GeoDBRepository } from '../infrastructure/repository/repository';
import { GeoContext } from './context/context';
import { DatabaseModule } from 'src/common/database/database.module';
import { GeoUseCase } from '../application/usecase';
import { GEO_REPOSITORY } from '../domain/port';

@Module({
  imports: [DatabaseModule],
  controllers: [GeoController, GeoContext],
  providers: [
    GeoDBRepository,
    {
      provide: GEO_REPOSITORY,
      useClass: GeoDBRepository,
    },
    GeoUseCase,
    GeoService,
  ],
})
export class GeoModule { }

