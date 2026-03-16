import { Module } from '@nestjs/common';
import { ClienController } from './controller/controller';
import { ClienService } from '../infrastructure/service/service';
import { ClienDBRepository } from '../infrastructure/repository/repository';
import { ClienContext } from './context/context';
import { DatabaseModule } from 'src/common/database/database.module';
import { ClienUseCase } from '../application/usecase';
import { CLIEN_REPOSITORY } from '../domain/port';

@Module({
  imports: [DatabaseModule],  // Importa PgService
  controllers: [ClienController, ClienContext],
  providers: [
    ClienDBRepository,
    {
      provide: CLIEN_REPOSITORY,
      useClass: ClienDBRepository,
    },
    ClienUseCase,
    ClienService,
  ],
})
export class ClienModule { }

