import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/database/database.module';
import { ClasmController } from './controller/controller';
import { ClasmContext } from './context/context';
import { ClasmService } from '../infrastructure/service/service';
import { ClasmDBRepository } from '../infrastructure/repository/repository';
import { ClasmUseCase } from '../application/usecase';
import { CLASM_REPOSITORY } from '../domain/port';

@Module({
  imports: [DatabaseModule],
  controllers: [ClasmController, ClasmContext],
  providers: [
    ClasmDBRepository,
    {
      provide: CLASM_REPOSITORY,
      useClass: ClasmDBRepository,
    },
    ClasmUseCase,
    ClasmService,
  ],
})
export class ClasmModule {}

