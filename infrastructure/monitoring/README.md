# Sistema de Monitoreo SIGQ

Este directorio contiene la configuración completa del sistema de monitoreo para SIGQ, incluyendo Prometheus, Grafana y Loki.

## Componentes

### Prometheus
- **Puerto**: 9090
- **Configuración**: `prometheus/prometheus.yml`
- **Alertas**: `prometheus/alerts.yml`
- **Función**: Recolección y almacenamiento de métricas

### Grafana
- **Puerto**: 3001
- **Usuario**: admin
- **Contraseña**: admin_change_in_prod (cambiar en producción)
- **Dashboards**: `grafana/dashboards/`
- **Datasources**: `grafana/provisioning/datasources/`
- **Función**: Visualización de métricas y logs

### Loki
- **Puerto**: 3100
- **Configuración**: `loki/loki-config.yml`
- **Función**: Almacenamiento de logs estructurados

### Promtail
- **Configuración**: `promtail/promtail-config.yml`
- **Función**: Recolección y envío de logs a Loki

## Métricas Disponibles

### HTTP Metrics
- `http_requests_total`: Total de solicitudes HTTP
- `http_request_duration_seconds`: Duración de solicitudes HTTP
- `http_errors_total`: Total de errores HTTP

### Business Metrics
- `patients_created_total`: Total de pacientes creados
- `surgeries_created_total`: Total de cirugías creadas
- `audit_logs_total`: Total de logs de auditoría

### Database Metrics
- `db_query_duration_seconds`: Duración de queries de base de datos
- `db_connections_active`: Conexiones activas de base de datos

### Authentication Metrics
- `auth_attempts_total`: Total de intentos de autenticación
- `auth_failures_total`: Total de fallos de autenticación

## Alertas Configuradas

1. **HighErrorRate**: Tasa de errores alta (>0.1 errores/seg)
2. **HighResponseTime**: Tiempo de respuesta alto (p95 > 2s)
3. **ServiceDown**: Servicio backend caído
4. **HighDatabaseConnections**: Conexiones de BD altas (>80)
5. **AuthenticationFailures**: Fallos de autenticación altos (>10 fallos/seg)

## Acceso

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001
- **Loki**: http://localhost:3100
- **Métricas del Backend**: http://localhost:3000/metrics

## Iniciar Servicios de Monitoreo

### Opción 1: Script automatizado
```bash
cd docker
./start-monitoring.sh
```

### Opción 2: Docker Compose manual
```bash
cd docker
docker compose up -d prometheus loki promtail grafana
```

### Verificar que Loki está corriendo
```bash
# Verificar estado
docker compose ps | grep loki

# Ver logs
docker compose logs loki

# Probar endpoint
curl http://localhost:3100/ready
```

### Solución de Problemas

Si Loki no inicia:
1. Verificar que el puerto 3100 no esté ocupado:
   ```bash
   lsof -i :3100
   ```

2. Verificar los logs de Loki:
   ```bash
   docker compose logs loki
   ```

3. Verificar la configuración:
   ```bash
   docker compose exec loki cat /etc/loki/local-config.yaml
   ```

4. Reiniciar el servicio:
   ```bash
   docker compose restart loki
   ```

## Dashboards

Los dashboards se cargan automáticamente desde `grafana/dashboards/`:
- **Backend API Metrics**: Métricas generales del backend

## Configuración de Logging

El backend está configurado para enviar logs estructurados en formato JSON que pueden ser recolectados por Promtail y enviados a Loki.

### Formato de Logs

```json
{
  "timestamp": "2024-01-20T10:30:00.000Z",
  "level": "info",
  "message": "Paciente creado",
  "context": "HceService",
  "userId": "uuid",
  "patientId": "uuid"
}
```

## Retención de Datos

- **Prometheus**: 15 días (configurable)
- **Loki**: 30 días (configurable en `loki-config.yml`)

## Desarrollo

Para desarrollo local, los servicios se inician con Docker Compose:

```bash
cd docker
docker-compose up -d prometheus grafana loki promtail
```

## Producción

En producción, asegúrese de:
1. Cambiar las contraseñas por defecto
2. Configurar TLS/HTTPS
3. Ajustar la retención de datos según políticas
4. Configurar alertas adicionales según necesidades
5. Monitorear el uso de recursos de los servicios
