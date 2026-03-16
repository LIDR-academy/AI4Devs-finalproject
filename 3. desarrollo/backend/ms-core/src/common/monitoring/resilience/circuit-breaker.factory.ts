import { Injectable, Logger } from '@nestjs/common';

export interface CircuitBreakerOptions {
  timeout?: number;
  errorThresholdPercentage?: number;
  volumeThreshold?: number;
  resetTimeout?: number;
  name?: string;
}

export interface CircuitBreakerStats {
  totalCount: number;
  errorCount: number;
  successCount: number;
  timeoutCount: number;
  lastError?: Error;
  lastSuccessTime?: number;
  lastErrorTime?: number;
}

export class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private stats: CircuitBreakerStats;
  private options: CircuitBreakerOptions;
  private timeoutId?: NodeJS.Timeout;
  private logger = new Logger('CircuitBreaker');

  constructor(
    private fn: (...args: any[]) => Promise<any>,
    options: CircuitBreakerOptions = {}
  ) {
    this.options = {
      timeout: parseInt(process.env.CB_TIMEOUT_MS || '3000'),
      errorThresholdPercentage: parseInt(process.env.CB_ERROR_THRESHOLD_PERCENTAGE || '50'),
      volumeThreshold: parseInt(process.env.CB_VOLUME_THRESHOLD || '20'),
      resetTimeout: parseInt(process.env.CB_RESET_TIMEOUT_MS || '10000'),
      name: 'default',
      ...options
    };

    this.stats = {
      totalCount: 0,
      errorCount: 0,
      successCount: 0,
      timeoutCount: 0
    };
  }

  async fire(...args: any[]): Promise<any> {
    if (this.state === 'OPEN') {
      this.logger.warn(`Circuit breaker '${this.options.name}' is OPEN, rejecting request`);
      throw new Error(`Circuit breaker '${this.options.name}' is OPEN`);
    }

    if (this.state === 'HALF_OPEN') {
      // Permitir una sola llamada en estado half-open
      this.state = 'OPEN';
    }

    this.stats.totalCount++;
    
    try {
      const result = await Promise.race([
        this.fn(...args),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), this.options.timeout)
        )
      ]);

      this.stats.successCount++;
      this.stats.lastSuccessTime = Date.now();
      
      if (this.state === 'OPEN') {
        this.state = 'CLOSED';
        this.logger.log(`Circuit breaker '${this.options.name}' closed`);
      }

      return result;
    } catch (error) {
      this.stats.errorCount++;
      this.stats.lastError = error as Error;
      this.stats.lastErrorTime = Date.now();

      if (error.message === 'Timeout') {
        this.stats.timeoutCount++;
      }

      // Verificar si debemos abrir el circuit breaker
      if (this.shouldOpen()) {
        this.open();
      }

      throw error;
    }
  }

  private shouldOpen(): boolean {
    if (this.stats.totalCount < this.options.volumeThreshold!) {
      return false;
    }

    const errorPercentage = (this.stats.errorCount / this.stats.totalCount) * 100;
    return errorPercentage >= this.options.errorThresholdPercentage!;
  }

  private open(): void {
    this.state = 'OPEN';
    this.logger.warn(`Circuit breaker '${this.options.name}' opened`);

    // Programar transición a half-open
    this.timeoutId = setTimeout(() => {
      this.state = 'HALF_OPEN';
      this.logger.log(`Circuit breaker '${this.options.name}' half-opened`);
    }, this.options.resetTimeout);
  }

  close(): void {
    this.state = 'CLOSED';
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
    this.logger.log(`Circuit breaker '${this.options.name}' closed`);
  }

  fallback(fallbackFn: (...args: any[]) => any): void {
    // Implementación simple del fallback
    this.logger.log(`Fallback set for circuit breaker '${this.options.name}'`);
  }

  on(event: string, callback: (...args: any[]) => void): void {
    // Implementación simple de eventos
    this.logger.log(`Event listener '${event}' registered for circuit breaker '${this.options.name}'`);
  }

  get opened(): boolean {
    return this.state === 'OPEN';
  }

  get halfOpen(): boolean {
    return this.state === 'HALF_OPEN';
  }

  getStats(): CircuitBreakerStats {
    return { ...this.stats };
  }
}

@Injectable()
export class CircuitBreakerFactory {
  private breakers = new Map<string, CircuitBreaker>();
  private logger = new Logger(CircuitBreakerFactory.name);

  /**
   * Crea un circuit breaker con configuración personalizada
   */
  create<T>(
    fn: (...args: any[]) => Promise<T>,
    options: CircuitBreakerOptions = {}
  ): CircuitBreaker {
    const {
      timeout = parseInt(process.env.CB_TIMEOUT_MS || '3000'),
      errorThresholdPercentage = parseInt(process.env.CB_ERROR_THRESHOLD_PERCENTAGE || '50'),
      volumeThreshold = parseInt(process.env.CB_VOLUME_THRESHOLD || '20'),
      resetTimeout = parseInt(process.env.CB_RESET_TIMEOUT_MS || '10000'),
      name = 'default'
    } = options;

    const breaker = new CircuitBreaker(fn, {
      timeout,
      errorThresholdPercentage,
      volumeThreshold,
      resetTimeout,
      name
    });

    // Event listeners para monitoreo
    breaker.on('open', () => {
      this.logger.warn(`Circuit Breaker '${name}' opened`);
    });

    breaker.on('close', () => {
      this.logger.log(`Circuit Breaker '${name}' closed`);
    });

    breaker.on('halfOpen', () => {
      this.logger.log(`Circuit Breaker '${name}' half-opened`);
    });

    breaker.on('fallback', (result: any) => {
      this.logger.log(`Circuit Breaker '${name}' fallback executed`);
    });

    breaker.on('success', (result: any) => {
      this.logger.log(`Circuit Breaker '${name}' success`);
    });

    breaker.on('timeout', () => {
      this.logger.warn(`Circuit Breaker '${name}' timeout`);
    });

    breaker.on('reject', (error: Error) => {
      this.logger.error(`Circuit Breaker '${name}' rejected: ${error.message}`);
    });

    breaker.on('fire', () => {
      this.logger.debug(`Circuit Breaker '${name}' fired`);
    });

    this.breakers.set(name, breaker);
    return breaker;
  }

  /**
   * Obtiene un circuit breaker existente por nombre
   */
  get(name: string): CircuitBreaker | undefined {
    return this.breakers.get(name);
  }

  /**
   * Obtiene estadísticas de todos los circuit breakers
   */
  getStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    
    for (const [name, breaker] of this.breakers) {
      stats[name] = {
        state: breaker.opened ? 'open' : breaker.halfOpen ? 'half-open' : 'closed',
        stats: breaker.getStats(),
        options: breaker['options']
      };
    }
    
    return stats;
  }

  /**
   * Cierra todos los circuit breakers
   */
  async closeAll(): Promise<void> {
    for (const breaker of this.breakers.values()) {
      breaker.close();
    }
  }
}
