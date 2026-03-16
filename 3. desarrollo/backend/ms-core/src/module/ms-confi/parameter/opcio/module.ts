import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs } from 'src/common';
import { OpcioController } from '../../parameter/opcio/controller';
import { AuthTransportConfig } from 'src/common/transports/auth.module';
import { OpcioEnum } from './enum/enum';
import { MetricsModule } from 'src/common/monitoring/metrics/metrics.module';

@Module({
    imports: [
        MetricsModule,
        ClientsModule.register([
            AuthTransportConfig,
            {
                name: OpcioEnum.msService,
                transport: Transport.NATS,
                options: {
                    servers: envs.ms.natsServer
                }
            },
        ]),
    ],
    controllers: [OpcioController],
    providers: [],
})
export class OpcioModule { }
