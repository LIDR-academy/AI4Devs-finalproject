import { Injectable, OnModuleInit } from '@nestjs/common';
import * as promClient from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly register: promClient.Registry;
  
  // Contadores
  public readonly httpRequestsTotal: promClient.Counter<string>;
  public readonly httpRequestDuration: promClient.Histogram<string>;
  public readonly httpErrorsTotal: promClient.Counter<string>;
  
  // Métricas de negocio
  public readonly patientsCreated: promClient.Counter<string>;
  public readonly surgeriesCreated: promClient.Counter<string>;
  public readonly auditLogsTotal: promClient.Counter<string>;
  
  // Métricas de base de datos
  public readonly dbQueryDuration: promClient.Histogram<string>;
  public readonly dbConnectionsActive: promClient.Gauge<string>;
  
  // Métricas de autenticación
  public readonly authAttemptsTotal: promClient.Counter<string>;
  public readonly authFailuresTotal: promClient.Counter<string>;
  
  constructor() {
    this.register = new promClient.Registry();
    
    // Configurar métricas por defecto de Node.js
    promClient.collectDefaultMetrics({ register: this.register });
    
    // HTTP Requests
    this.httpRequestsTotal = new promClient.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.register],
    });
    
    this.httpRequestDuration = new promClient.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
      registers: [this.register],
    });
    
    this.httpErrorsTotal = new promClient.Counter({
      name: 'http_errors_total',
      help: 'Total number of HTTP errors',
      labelNames: ['method', 'route', 'status_code', 'error_type'],
      registers: [this.register],
    });
    
    // Métricas de negocio
    this.patientsCreated = new promClient.Counter({
      name: 'patients_created_total',
      help: 'Total number of patients created',
      registers: [this.register],
    });
    
    this.surgeriesCreated = new promClient.Counter({
      name: 'surgeries_created_total',
      help: 'Total number of surgeries created',
      labelNames: ['type', 'status'],
      registers: [this.register],
    });
    
    this.auditLogsTotal = new promClient.Counter({
      name: 'audit_logs_total',
      help: 'Total number of audit logs created',
      labelNames: ['action', 'entity_type'],
      registers: [this.register],
    });
    
    // Métricas de base de datos
    this.dbQueryDuration = new promClient.Histogram({
      name: 'db_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation', 'table'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
      registers: [this.register],
    });
    
    this.dbConnectionsActive = new promClient.Gauge({
      name: 'db_connections_active',
      help: 'Number of active database connections',
      registers: [this.register],
    });
    
    // Métricas de autenticación
    this.authAttemptsTotal = new promClient.Counter({
      name: 'auth_attempts_total',
      help: 'Total number of authentication attempts',
      labelNames: ['result'],
      registers: [this.register],
    });
    
    this.authFailuresTotal = new promClient.Counter({
      name: 'auth_failures_total',
      help: 'Total number of authentication failures',
      labelNames: ['reason'],
      registers: [this.register],
    });
  }
  
  onModuleInit() {
    // Métricas ya están inicializadas en el constructor
  }
  
  /**
   * Obtiene las métricas en formato Prometheus
   */
  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }
  
  /**
   * Registra una solicitud HTTP
   */
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number): void {
    this.httpRequestsTotal.inc({ method, route, status_code: statusCode.toString() });
    this.httpRequestDuration.observe({ method, route, status_code: statusCode.toString() }, duration / 1000);
  }
  
  /**
   * Registra un error HTTP
   */
  recordHttpError(method: string, route: string, statusCode: number, errorType: string): void {
    this.httpErrorsTotal.inc({ method, route, status_code: statusCode.toString(), error_type: errorType });
  }
  
  /**
   * Registra creación de paciente
   */
  recordPatientCreated(): void {
    this.patientsCreated.inc();
  }
  
  /**
   * Registra creación de cirugía
   */
  recordSurgeryCreated(type?: string, status?: string): void {
    this.surgeriesCreated.inc({ type: type || 'unknown', status: status || 'unknown' });
  }
  
  /**
   * Registra log de auditoría
   */
  recordAuditLog(action: string, entityType: string): void {
    this.auditLogsTotal.inc({ action, entity_type: entityType || 'unknown' });
  }
  
  /**
   * Registra duración de query de base de datos
   */
  recordDbQuery(operation: string, table: string, duration: number): void {
    this.dbQueryDuration.observe({ operation, table }, duration / 1000);
  }
  
  /**
   * Actualiza conexiones activas de base de datos
   */
  setDbConnectionsActive(count: number): void {
    this.dbConnectionsActive.set(count);
  }
  
  /**
   * Registra intento de autenticación
   */
  recordAuthAttempt(success: boolean): void {
    this.authAttemptsTotal.inc({ result: success ? 'success' : 'failure' });
    if (!success) {
      this.authFailuresTotal.inc({ reason: 'invalid_credentials' });
    }
  }
}
