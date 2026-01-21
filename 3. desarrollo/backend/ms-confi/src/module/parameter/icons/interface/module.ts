import { Module } from '@nestjs/common';
import { IconsController } from './controller/controller';
import { IconsService } from '../infrastructure/service/service';
import { IconsDBRepository } from '../infrastructure/repository/repository';
import { IconsContext } from './context/context';
import { DatabaseModule } from 'src/common/database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [IconsController, IconsContext],
    providers: [IconsDBRepository, IconsService],
})
export class IconsModule { }
