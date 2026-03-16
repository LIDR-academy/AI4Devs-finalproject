import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs } from 'src/common';
import { MetricsModule } from 'src/common/monitoring/metrics/metrics.module';
import { AuthTransportConfig } from 'src/common/transports/auth.module';
import { IconsController } from './controller';
import { IconsEnum } from './enum/enum';

@Module({
    imports: [
        MetricsModule,
        ClientsModule.register([
            AuthTransportConfig,
            {
                name: IconsEnum.msService,
                transport: Transport.NATS,
                options: {
                    servers: envs.ms.natsServer
                }
            },
        ]),
    ],
    controllers: [IconsController],

})
export class IconsModule { }
