import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/database/database.module';
import { ClbenController } from './controller/controller';
import { ClbenContext } from './context/context';
import { ClbenService } from '../infrastructure/service/service';
import { ClbenDBRepository } from '../infrastructure/repository/repository';
import { ClbenUseCase } from '../application/usecase';
import { CLBEN_REPOSITORY } from '../domain/port';

@Module({
  imports: [DatabaseModule],
  controllers: [ClbenController, ClbenContext],
  providers: [
    ClbenDBRepository,
    {
      provide: CLBEN_REPOSITORY,
      useClass: ClbenDBRepository,
    },
    ClbenUseCase,
    ClbenService,
  ],
})
export class ClbenModule {}

