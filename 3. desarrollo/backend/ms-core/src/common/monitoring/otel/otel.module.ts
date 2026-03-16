import { Module, OnModuleInit } from '@nestjs/common';
import { startOpenTelemetry } from './otel';

@Module({})
export class OtelModule implements OnModuleInit {
  onModuleInit() {
    const serviceName = process.env.OTEL_SERVICE_NAME || 'core-nest';
    const serviceVersion = process.env.npm_package_version || '1.0.0';
    
    startOpenTelemetry(serviceName, serviceVersion);
  }
}
