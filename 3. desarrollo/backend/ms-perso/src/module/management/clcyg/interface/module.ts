import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/database/database.module';
import { ClcygController } from './controller/controller';
import { ClcygContext } from './context/context';
import { ClcygService } from '../infrastructure/service/service';
import { ClcygDBRepository } from '../infrastructure/repository/repository';
import { ClcygUseCase } from '../application/usecase';
import { CLCYG_REPOSITORY } from '../domain/port';

@Module({
  imports: [DatabaseModule],
  controllers: [ClcygController, ClcygContext],
  providers: [
    ClcygDBRepository,
    {
      provide: CLCYG_REPOSITORY,
      useClass: ClcygDBRepository,
    },
    ClcygUseCase,
    ClcygService,
  ],
})
export class ClcygModule {}

