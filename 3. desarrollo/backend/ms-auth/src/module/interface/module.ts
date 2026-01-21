import { Module } from '@nestjs/common';
import { AuthController } from './controller/controller';
import { AuthService } from '../infrastructure/service/service';
import { AuthDBRepository } from '../infrastructure/repository/repository';
import { AuthContext } from './context/context';
import { DatabaseModule } from 'src/common/database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [AuthController, AuthContext],
    providers: [AuthDBRepository, AuthService],
})
export class AuthModule { }
