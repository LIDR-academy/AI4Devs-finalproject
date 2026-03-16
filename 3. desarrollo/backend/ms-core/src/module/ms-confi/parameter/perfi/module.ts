import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs } from 'src/common';
import { MetricsModule } from 'src/common/monitoring/metrics/metrics.module';
import { AuthTransportConfig } from 'src/common/transports/auth.module';
import { PerfiController } from './controller';
import { PerfiEnum } from './enum/enum';

@Module({
    imports: [
        MetricsModule,
        ClientsModule.register([
            AuthTransportConfig,
            {
                name: PerfiEnum.msService,
                transport: Transport.NATS,
                options: {
                    servers: envs.ms.natsServer
                }
            },
        ]),
    ],
    controllers: [PerfiController],

})
export class PerfiModule { }
