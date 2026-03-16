import { Module } from '@nestjs/common';
import { CiiuController } from './controller/controller';
import { CiiuService } from '../infrastructure/service/service';
import { CiiuDBRepository } from '../infrastructure/repository/repository';
import { CiiuContext } from './context/context';
import { DatabaseModule } from 'src/common/database/database.module';
import { CiiuUseCase } from '../application/usecase';
import { CIIU_REPOSITORY } from '../domain/port';

@Module({
  imports: [DatabaseModule],
  controllers: [CiiuController, CiiuContext],
  providers: [
    CiiuDBRepository,
    {
      provide: CIIU_REPOSITORY,
      useClass: CiiuDBRepository,
    },
    CiiuUseCase,
    CiiuService,
  ],
})
export class CiiuModule { }

