import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs } from 'src/common';
import { AuthEnum } from './enum/enum';
import { AuthContext } from './controller';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: AuthEnum.msService,
                transport: Transport.NATS,
                options: {
                    servers: envs.ms.natsServer,
                }
            },
        ]),
    ],
    controllers: [AuthContext],
    providers: [],
    exports: []
})
export class AuthModule { }
