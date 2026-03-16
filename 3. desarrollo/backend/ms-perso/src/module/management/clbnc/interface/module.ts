import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/database/database.module';
import { ClbncController } from './controller/controller';
import { ClbncContext } from './context/context';
import { ClbncService } from '../infrastructure/service/service';
import { ClbncDBRepository } from '../infrastructure/repository/repository';
import { ClbncUseCase } from '../application/usecase';
import { CLBNC_REPOSITORY } from '../domain/port';

@Module({
  imports: [DatabaseModule],
  controllers: [ClbncController, ClbncContext],
  providers: [
    ClbncDBRepository,
    {
      provide: CLBNC_REPOSITORY,
      useClass: ClbncDBRepository,
    },
    ClbncUseCase,
    ClbncService,
  ],
})
export class ClbncModule {}

