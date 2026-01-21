import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Counter, Histogram, Gauge, Registry, collectDefaultMetrics } from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly logger = new Logger(MetricsService.name);

  private readonly httpRequestDuration: Histogram<string>;
  private readonly httpRequestsTotal: Counter<string>;
  private readonly circuitBreakerOpen: Counter<string>;
  private readonly dbPoolInUse: Gauge<string>;
  private readonly dbPoolWaiting: Gauge<string>;
  private readonly msDependencyLatency: Histogram<string>;
  private readonly businessEventsTotal: Counter<string>;

  // Flag estático para controlar si las métricas por defecto ya fueron inicializadas
  private static defaultMetricsInitialized = false;
  private static initializationLock = false;

  constructor() {
    // Inicializar métricas personalizadas
    this.httpRequestDuration = new Histogram({
      name: 'core_nest_http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
    });

    this.httpRequestsTotal = new Counter({
      name: 'core_nest_http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    });

    this.circuitBreakerOpen = new Counter({
      name: 'core_nest_circuit_breaker_open_total',
      help: 'Total number of circuit breaker openings',
      labelNames: ['service', 'target'],
    });

    this.dbPoolInUse = new Gauge({
      name: 'core_nest_db_pool_in_use',
      help: 'Number of database connections in use',
    });

    this.dbPoolWaiting = new Gauge({
      name: 'core_nest_db_pool_waiting',
      help: 'Number of database connections waiting',
    });

    this.msDependencyLatency = new Histogram({
      name: 'core_nest_ms_dependency_latency_seconds',
      help: 'Latency of microservice dependencies in seconds',
      labelNames: ['target', 'method'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
    });

    this.businessEventsTotal = new Counter({
      name: 'core_nest_business_events_total',
      help: 'Total number of business events',
      labelNames: ['event_type', 'status'],
    });
  }

  onModuleInit() {
    this.initializeDefaultMetrics();
  }

  /**
   * Inicializa las métricas por defecto de manera idempotente
   */
  private initializeDefaultMetrics(): void {
    // Verificar si ya están inicializadas
    if (MetricsService.defaultMetricsInitialized) {
      this.logger.log('ℹ️ Métricas por defecto ya inicializadas, saltando...');
      return;
    }

    // Prevenir inicialización concurrente
    if (MetricsService.initializationLock) {
      this.logger.log('⏳ Inicialización de métricas en progreso, esperando...');
      return;
    }

    MetricsService.initializationLock = true;

    try {
      // Intentar inicializar métricas por defecto
      collectDefaultMetrics({
        prefix: 'core_nest_',
      });

      MetricsService.defaultMetricsInitialized = true;
      this.logger.log('✅ Métricas por defecto inicializadas correctamente');

    } catch (error) {
      // Manejar el caso donde las métricas ya están registradas
      if (error.message && error.message.includes('has already been registered')) {
        this.logger.warn('⚠️ Métricas por defecto ya estaban inicializadas (probablemente por PrometheusModule)');
        MetricsService.defaultMetricsInitialized = true;
      } else {
        this.logger.error('❌ Error al inicializar métricas por defecto:', error.message);
        // No relanzar el error para evitar que falle el módulo
      }
    } finally {
      MetricsService.initializationLock = false;
    }
  }

  /**
   * Registra duración de request HTTP (PII-safe)
   */
  recordHttpRequestDuration(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
  ): void {
    // Sanitizar route para evitar PII
    const sanitizedRoute = this.sanitizeRoute(route);

    this.httpRequestDuration
      .labels(method, sanitizedRoute, statusCode.toString())
      .observe(duration / 1000); // Convertir a segundos
  }

  /**
   * Incrementa contador de requests HTTP (PII-safe)
   */
  incrementHttpRequests(
    method: string,
    route: string,
    statusCode: number,
  ): void {
    // Sanitizar route para evitar PII
    const sanitizedRoute = this.sanitizeRoute(route);

    this.httpRequestsTotal
      .labels(method, sanitizedRoute, statusCode.toString())
      .inc();
  }

  /**
   * Registra apertura de circuit breaker
   */
  recordCircuitBreakerOpen(service: string, target: string): void {
    this.circuitBreakerOpen.labels(service, target).inc();
  }

  /**
   * Actualiza métricas del pool de base de datos
   */
  updateDbPoolMetrics(inUse: number, waiting: number): void {
    this.dbPoolInUse.set(inUse);
    this.dbPoolWaiting.set(waiting);
  }

  /**
   * Registra latencia de dependencias entre microservicios
   */
  recordDependencyLatency(
    target: string,
    method: string,
    duration: number,
  ): void {
    this.msDependencyLatency
      .labels(target, method)
      .observe(duration / 1000); // Convertir a segundos
  }

  /**
   * Registra eventos de negocio (PII-safe)
   */
  recordBusinessEvent(eventType: string, status: string): void {
    this.businessEventsTotal.labels(eventType, status).inc();
  }

  /**
   * Obtiene métricas personalizadas
   */
  getCustomMetrics(): Record<string, any> {
    return {
      circuitBreakerStats: this.getCircuitBreakerStats(),
      dbPoolStats: this.getDbPoolStats(),
      dependencyStats: this.getDependencyStats(),
    };
  }

  /**
   * Sanitiza rutas para evitar PII en métricas
   */
  private sanitizeRoute(route: string): string {
    if (!route || typeof route !== 'string') {
      this.logger.warn('sanitizeRoute recibió una ruta inválida:', route);
      return '/unknown';
    }
    // Remover IDs numéricos y UUIDs de las rutas
    let sanitized = route
      .replace(/\/\d+/g, '/:id') // Reemplazar números con :id
      .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:uuid') // UUIDs
      .replace(/\/[0-9a-f]{24}/gi, '/:objectId'); // MongoDB ObjectIds

    // Limitar longitud para evitar métricas demasiado largas
    if (sanitized.length > 100) {
      sanitized = sanitized.substring(0, 100) + '...';
    }

    return sanitized;
  }

  private getCircuitBreakerStats(): Record<string, any> {
    // Implementar lógica para obtener estadísticas de circuit breakers
    return {};
  }

  private getDbPoolStats(): Record<string, any> {
    return {
      inUse: this.dbPoolInUse.get(),
      waiting: this.dbPoolWaiting.get(),
    };
  }

  private getDependencyStats(): Record<string, any> {
    // Implementar lógica para obtener estadísticas de dependencias
    return {};
  }
}
