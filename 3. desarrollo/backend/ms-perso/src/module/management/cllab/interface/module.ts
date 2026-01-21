import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/database/database.module';
import { CllabController } from './controller/controller';
import { CllabContext } from './context/context';
import { CllabService } from '../infrastructure/service/service';
import { CllabDBRepository } from '../infrastructure/repository/repository';
import { CllabUseCase } from '../application/usecase';
import { CLLAB_REPOSITORY } from '../domain/port';

@Module({
  imports: [DatabaseModule],
  controllers: [CllabController, CllabContext],
  providers: [
    CllabDBRepository,
    {
      provide: CLLAB_REPOSITORY,
      useClass: CllabDBRepository,
    },
    CllabUseCase,
    CllabService,
  ],
})
export class CllabModule {}

