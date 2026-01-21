import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs } from 'src/common/config/environment/env.config';
import { TidenEnum } from 'src/module/ms-perso/parameter/tiden/enum/enum';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: TidenEnum.msService,
                transport: Transport.NATS,
                options: {
                    servers: envs.ms.natsServer
                }
            },
        ]),
    ],
    providers: [],
})
export class TidenModule { }