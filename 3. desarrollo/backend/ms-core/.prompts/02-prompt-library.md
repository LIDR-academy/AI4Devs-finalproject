# 02 · Prompt Library

Prompts listos para usar o adaptar al trabajar con MS-CORE.

## 1) Contexto de gateway
- "Explica el rol de MS-CORE como gateway central y cómo orquesta ms-auth, ms-perso y ms-confi."
- "¿Cómo se integran los módulos de ms-auth, ms-confi y ms-perso en MS-CORE y qué exponen al exterior?"

## 2) Observabilidad y métricas
- "Lista todas las métricas Prometheus configuradas en MetricsService y explica qué mide cada una."
- "Resume la configuración OTEL (OpenTelemetry) y cómo se integra con el auto-instrumentador de Node."
- "¿Qué alertas están definidas en prometheus.yml y cuál es el threshold de cada una?"

## 3) Resiliencia
- "Explica el patrón de circuit-breaker implementado: estados, transiciones, y casos de uso."
- "¿Cómo funciona el throttler global y qué límites tiene por defecto?"

## 4) Seguridad y guards
- "Enumera los guards (AuthGuard) y decoradores (@Token, @User) disponibles en ms-auth; proporciona ejemplos de uso."
- "¿Qué políticas de seguridad aplica Helmet y cómo se configura?"

## 5) Testing y debugging
- "Propón una estrategia de testing para MS-CORE: unitarios para métricas, integración para gateway."
- "¿Cómo configurar debug en MS-CORE con NODE_DEBUG y OTEL?"

## 6) Extensión y escalado
- "¿Cómo añadir un nuevo microservicio (ms-X) al gateway MS-CORE?"
- "¿Qué cambios requeriría MS-CORE para soportar múltiples instancias y load balancing?"
