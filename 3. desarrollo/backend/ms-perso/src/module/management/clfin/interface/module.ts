import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/database/database.module';
import { ClfinController } from './controller/controller';
import { ClfinContext } from './context/context';
import { ClfinService } from '../infrastructure/service/service';
import { ClfinDBRepository } from '../infrastructure/repository/repository';
import { ClfinUseCase } from '../application/usecase';
import { CLFIN_REPOSITORY } from '../domain/port';

@Module({
  imports: [DatabaseModule],
  controllers: [ClfinController, ClfinContext],
  providers: [
    ClfinDBRepository,
    {
      provide: CLFIN_REPOSITORY,
      useClass: ClfinDBRepository,
    },
    ClfinUseCase,
    ClfinService,
  ],
})
export class ClfinModule {}

