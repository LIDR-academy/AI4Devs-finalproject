import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/database/database.module';
import { ClrefController } from './controller/controller';
import { ClrefContext } from './context/context';
import { ClrefService } from '../infrastructure/service/service';
import { ClrefDBRepository } from '../infrastructure/repository/repository';
import { ClrefUseCase } from '../application/usecase';
import { CLREF_REPOSITORY } from '../domain/port';

@Module({
  imports: [DatabaseModule],
  controllers: [ClrefController, ClrefContext],
  providers: [
    ClrefDBRepository,
    {
      provide: CLREF_REPOSITORY,
      useClass: ClrefDBRepository,
    },
    ClrefUseCase,
    ClrefService,
  ],
})
export class ClrefModule {}

