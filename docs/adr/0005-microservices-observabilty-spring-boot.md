# ADR-001: Observabilidad sencilla para microservicios Spring Boot

## Estado

Aceptado

## Contexto

El proyecto está compuesto por microservicios desarrollados con Spring Boot. Es necesario disponer de una solución de observabilidad sencilla, profesional y mantenible que permita conocer el estado de los servicios, analizar errores, revisar métricas técnicas básicas y facilitar el diagnóstico en entornos de desarrollo, integración y producción.

La solución debe evitar complejidad innecesaria en una primera fase y permitir evolución futura hacia trazas distribuidas y centralización avanzada de logs.

## Decisión

Se implementará una solución inicial basada en:

- Spring Boot Actuator
- Micrometer
- Prometheus
- Grafana
- Logs estructurados en JSON por consola

Cada microservicio expondrá endpoints de salud y métricas mediante Actuator. Prometheus recolectará las métricas desde los endpoints `/actuator/prometheus`. Grafana se usará para visualizar dashboards y configurar alertas básicas. Los logs se emitirán en formato JSON por consola para facilitar su posterior integración con sistemas centralizados como Loki, Elastic o similares.

## Diagrama de la solución elegida

```text
┌────────────────────┐
│  Microservicio A   │
│  Spring Boot       │
│  Actuator          │
│  Micrometer        │
│  Logs JSON         │
└─────────┬──────────┘
          │
          │ /actuator/prometheus
          ▼
┌────────────────────┐
│ Prometheus         │
│ Métricas           │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Grafana            │
│ Dashboards         │
│ Alertas            │
└────────────────────┘
```

## Configuración base recomendada

```yaml
spring:
  application:
    name: pedidos-service

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: always
      probes:
        enabled: true
  metrics:
    tags:
      application: ${spring.application.name}
      environment: ${APP_ENV:local}
```

## Endpoints expuestos

```text
/actuator/health
/actuator/info
/actuator/metrics
/actuator/prometheus
```

## Consecuencias positivas

- Solución sencilla de implantar y mantener.
- Bajo acoplamiento con herramientas externas.
- Uso de componentes estándar del ecosistema Spring Boot.
- Permite crear dashboards técnicos desde el inicio.
- Facilita la detección temprana de errores, degradación de rendimiento y caída de servicios.
- Puede evolucionar posteriormente hacia trazas distribuidas, OpenTelemetry Collector y logs centralizados.

## Consecuencias negativas

- No incluye trazas distribuidas en esta primera fase.
- La correlación completa entre microservicios será limitada inicialmente.
- Los logs no estarán centralizados salvo que la plataforma de ejecución ya los recoja.
- El diagnóstico de flujos complejos entre servicios requerirá una fase posterior de evolución.

## Alternativas consideradas

### Alternativa 1: Solo logs por consola

```text
┌────────────────────┐
│  Microservicio A   │
│  Spring Boot       │
│  Logs texto/JSON   │
└─────────┬──────────┘
          │
          │ stdout
          ▼
┌────────────────────┐
│ Plataforma         │
│ Docker/Kubernetes  │
│ Logs básicos       │
└────────────────────┘
```

**Motivo de descarte:** es demasiado limitada. Permite revisar errores puntuales, pero no ofrece métricas, dashboards, alertas ni visión agregada del sistema.

### Alternativa 2: Observabilidad completa desde el inicio

```text
┌────────────────────┐
│  Microservicio A   │
│  Spring Boot       │
│  Actuator          │
│  Micrometer        │
│  OpenTelemetry     │
│  Logs JSON         │
└─────────┬──────────┘
          │
          │ OTLP / Prometheus / Logs
          ▼
┌────────────────────┐
│ OpenTelemetry      │
│ Collector          │
└──────┬─────┬───────┘
       │     │
       │     └─────────────────┐
       │                       │
       ▼                       ▼
┌──────────────┐        ┌──────────────┐
│ Prometheus   │        │ Loki         │
│ Métricas     │        │ Logs         │
└──────┬───────┘        └──────┬───────┘
       │                       │
       ▼                       ▼
┌──────────────┐        ┌──────────────┐
│ Grafana      │◄──────►│ Tempo        │
│ Dashboards   │        │ Trazas       │
│ Alertas      │        │ distribuidas │
└──────────────┘        └──────────────┘
```

**Motivo de descarte:** aunque es una arquitectura más completa, introduce más componentes, configuración, operación y curva de aprendizaje de la necesaria para la fase inicial del proyecto.

### Alternativa 3: Solución comercial APM

```text
┌────────────────────┐
│  Microservicio A   │
│  Spring Boot       │
│  Agente APM        │
│  Logs/Métricas     │
│  Trazas            │
└─────────┬──────────┘
          │
          │ Agent / API
          ▼
┌────────────────────┐
│ Plataforma APM     │
│ Datadog/New Relic  │
│ Dynatrace/etc.     │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Dashboards         │
│ Alertas            │
│ Análisis avanzado  │
└────────────────────┘
```

**Motivo de descarte:** puede ser potente, pero implica coste adicional, dependencia de proveedor y posible sobredimensionamiento para las necesidades iniciales.

## Decisión final

Se adopta la solución sencilla con Actuator, Micrometer, Prometheus, Grafana y logs JSON por consola.

Esta opción ofrece un equilibrio adecuado entre simplicidad, utilidad operativa y capacidad de evolución futura.

## Evolución futura

En fases posteriores se podrá incorporar:

- Loki para centralización de logs.
- Tempo para trazas distribuidas.
- OpenTelemetry Collector para desacoplar los microservicios del backend de observabilidad.
- Alertas avanzadas basadas en SLOs.
- Métricas funcionales o de negocio.

## Criterios de aceptación

- Cada microservicio expone `/actuator/health` y `/actuator/prometheus`.
- Prometheus recolecta métricas de todos los microservicios.
- Grafana muestra al menos un dashboard técnico por servicio.
- Los logs se emiten en formato estructurado JSON.
- Las métricas incluyen etiquetas mínimas de aplicación y entorno.
