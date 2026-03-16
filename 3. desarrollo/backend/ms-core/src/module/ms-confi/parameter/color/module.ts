import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs } from 'src/common';
import { MetricsModule } from 'src/common/monitoring/metrics/metrics.module';
import { AuthTransportConfig } from 'src/common/transports/auth.module';
import { ColorController } from './controller';
import { ColorEnum } from './enum/enum';

@Module({
    imports: [
        MetricsModule,
        ClientsModule.register([
            AuthTransportConfig,
            {
                name: ColorEnum.msService,
                transport: Transport.NATS,
                options: {
                    servers: envs.ms.natsServer
                }
            },
        ]),
    ],
    controllers: [ColorController],

})
export class ColorModule { }
