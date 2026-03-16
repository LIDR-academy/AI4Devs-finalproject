import { Module } from '@nestjs/common';
import { OpcioController } from './controller/controller';
import { OpcioService } from '../infrastructure/service/service';
import { OpcioDBRepository } from '../infrastructure/repository/repository';
import { OpcioContext } from './context/context';
import { DatabaseModule } from 'src/common/database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [OpcioController, OpcioContext],
    providers: [OpcioDBRepository, OpcioService],
})
export class OpcioModule { }
