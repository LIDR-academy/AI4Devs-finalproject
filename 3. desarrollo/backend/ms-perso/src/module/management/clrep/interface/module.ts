import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/database/database.module';
import { ClrepController } from './controller/controller';
import { ClrepContext } from './context/context';
import { ClrepService } from '../infrastructure/service/service';
import { ClrepDBRepository } from '../infrastructure/repository/repository';
import { ClrepUseCase } from '../application/usecase';
import { CLREP_REPOSITORY } from '../domain/port';

@Module({
  imports: [DatabaseModule],
  controllers: [ClrepController, ClrepContext],
  providers: [
    ClrepDBRepository,
    {
      provide: CLREP_REPOSITORY,
      useClass: ClrepDBRepository,
    },
    ClrepUseCase,
    ClrepService,
  ],
})
export class ClrepModule {}

