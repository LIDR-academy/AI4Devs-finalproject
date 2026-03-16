import { Module } from '@nestjs/common';
import { ColorController } from './controller/controller';
import { ColorService } from '../infrastructure/service/service';
import { ColorDBRepository } from '../infrastructure/repository/repository';
import { ColorContext } from './context/context';
import { DatabaseModule } from 'src/common/database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [ColorController, ColorContext],
    providers: [ColorDBRepository, ColorService],
})
export class ColorModule { }
