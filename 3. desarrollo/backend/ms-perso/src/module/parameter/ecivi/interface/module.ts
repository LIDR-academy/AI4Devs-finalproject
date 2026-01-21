import { Module } from '@nestjs/common';
import { EciviController } from './controller/controller';
import { EciviService } from '../infrastructure/service/service';
import { EciviDBRepository } from '../infrastructure/repository/repository';
import { EciviContext } from './context/context';
import { DatabaseModule } from 'src/common/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [EciviController, EciviContext],
  providers: [EciviDBRepository, EciviService],
})
export class EciviModule { }

