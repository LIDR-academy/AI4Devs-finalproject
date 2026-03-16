import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TidenEnum } from './enum/enum';
import { TidenContext } from './controller';
import { envs } from 'src/common/config/environment/env.config';
import { AuthTransportConfig } from 'src/common/transports/auth.module';
import { MetricsModule } from 'src/common/monitoring/metrics/metrics.module';

@Module({
    imports: [
        MetricsModule,
        ClientsModule.register([
            AuthTransportConfig,
            {
                name: TidenEnum.msService,
                transport: Transport.NATS,
                options: {
                    servers: envs.ms.natsServer
                }
            },
        ]),

    ],
    controllers: [TidenContext],
    providers: [],
})
export class TidenModule { }