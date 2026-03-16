import { Module } from '@nestjs/common';
import { HealthContext } from './controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthTransportConfig } from 'src/common/transports/auth.module';
import { HealthEnum } from './enum';
import { envs } from 'src/common';

@Module({
  imports: [
    ClientsModule.register([
      AuthTransportConfig,
      {
        name: HealthEnum.msService,
        transport: Transport.NATS,
        options: {
          servers: envs.ms.natsServer,
        }
      },
    ]),
  ],
  controllers: [HealthContext],
})
export class HealthModule { }
