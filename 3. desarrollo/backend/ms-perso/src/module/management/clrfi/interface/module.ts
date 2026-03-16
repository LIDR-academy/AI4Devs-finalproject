import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/database/database.module';
import { ClrfiController } from './controller/controller';
import { ClrfiContext } from './context/context';
import { ClrfiService } from '../infrastructure/service/service';
import { ClrfiDBRepository } from '../infrastructure/repository/repository';
import { ClrfiUseCase } from '../application/usecase';
import { CLRFI_REPOSITORY } from '../domain/port';

@Module({
  imports: [DatabaseModule],
  controllers: [ClrfiController, ClrfiContext],
  providers: [
    ClrfiDBRepository,
    {
      provide: CLRFI_REPOSITORY,
      useClass: ClrfiDBRepository,
    },
    ClrfiUseCase,
    ClrfiService,
  ],
})
export class ClrfiModule {}

