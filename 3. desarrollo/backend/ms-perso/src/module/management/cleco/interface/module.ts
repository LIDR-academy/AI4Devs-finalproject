import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/database/database.module';
import { ClecoController } from './controller/controller';
import { ClecoContext } from './context/context';
import { ClecoService } from '../infrastructure/service/service';
import { ClecoDBRepository } from '../infrastructure/repository/repository';
import { ClecoUseCase } from '../application/usecase';
import { CLECO_REPOSITORY } from '../domain/port';

@Module({
  imports: [DatabaseModule],
  controllers: [ClecoController, ClecoContext],
  providers: [
    ClecoDBRepository,
    {
      provide: CLECO_REPOSITORY,
      useClass: ClecoDBRepository,
    },
    ClecoUseCase,
    ClecoService,
  ],
})
export class ClecoModule {}

