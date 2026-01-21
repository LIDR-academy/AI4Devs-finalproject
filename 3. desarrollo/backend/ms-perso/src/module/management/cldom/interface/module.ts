import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/database/database.module';
import { CldomController } from './controller/controller';
import { CldomContext } from './context/context';
import { CldomService } from '../infrastructure/service/service';
import { CldomDBRepository } from '../infrastructure/repository/repository';
import { CldomUseCase } from '../application/usecase';
import { CLDOM_REPOSITORY } from '../domain/port';

@Module({
  imports: [DatabaseModule],
  controllers: [CldomController, CldomContext],
  providers: [
    CldomDBRepository,
    {
      provide: CLDOM_REPOSITORY,
      useClass: CldomDBRepository,
    },
    CldomUseCase,
    CldomService,
  ],
})
export class CldomModule {}

