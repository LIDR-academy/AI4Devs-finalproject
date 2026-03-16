import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs } from 'src/common';
import { MetricsModule } from 'src/common/monitoring/metrics/metrics.module';
import { AuthTransportConfig } from 'src/common/transports/auth.module';
import { ToficController } from './controller';
import { ToficEnum } from './enum/enum';

@Module({
    imports: [
        MetricsModule,
        ClientsModule.register([
            AuthTransportConfig,
            {
                name: ToficEnum.msService,
                transport: Transport.NATS,
                options: {
                    servers: envs.ms.natsServer
                }
            },
        ]),
    ],
    controllers: [ToficController],

})
export class ToficModule { }
