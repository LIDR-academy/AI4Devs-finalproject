import { registerAs } from '@nestjs/config';
import { ThrottlerModuleOptions } from '@nestjs/throttler';

export default registerAs('throttler', (): ThrottlerModuleOptions => ({
  throttlers: [
    {
      ttl: 60000, // 1 minuto
      limit: 100, // 100 solicitudes por minuto (default)
    },
  ],
}));
