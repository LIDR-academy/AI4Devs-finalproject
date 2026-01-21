import { ClientProviderOptions, Transport } from '@nestjs/microservices';
import { AuthEnum } from 'src/module/ms-auth/enum/enum';
import { envs } from '../config';

export const AuthTransportConfig: ClientProviderOptions = {
    name: AuthEnum.msService,
    transport: Transport.NATS,
    options: {
        servers: envs.ms.natsServer,
    },
};