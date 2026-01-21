import { Module } from '@nestjs/common';
import { CircuitBreakerFactory } from './circuit-breaker.factory';
import { CircuitBreakerInterceptor } from './circuit-breaker.interceptor';

@Module({
  providers: [CircuitBreakerFactory, CircuitBreakerInterceptor],
  exports: [CircuitBreakerFactory, CircuitBreakerInterceptor],
})
export class ResilienceModule {}
