import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configModuleOptions } from '../config/configuration';

/**
 * The root module of the composition root (`ARCHITECTURE.md` §6.3).
 *
 * It holds no business logic and declares no controller of its own: its job is
 * to import one composition module per bounded context, each binding that
 * context's port tokens to concrete adapters (ADR-003). No context library
 * exists yet, so the only import today is the global configuration.
 */
@Module({
  imports: [ConfigModule.forRoot(configModuleOptions)],
})
export class AppModule {}
