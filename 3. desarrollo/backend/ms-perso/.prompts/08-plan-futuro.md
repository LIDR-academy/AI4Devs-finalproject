# 08 - Plan de Trabajo Futuro

## Pendientes inmediatos
1) Completar 12 catálogos siguiendo el patrón de `tiden` (prioridad alta para persona: `tpers`, `sexos`, `ecivi`, `nacio`).
2) Añadir validaciones de cédula/RUC y hashids en DTOs/value objects.
3) Habilitar E2E con base de datos de prueba y cablearlos a CI.
4) Revisar paridad REST/NATS al agregar cada catálogo nuevo.

## Mejoras técnicas
- Centralizar validaciones de identificación y normalización en value objects compartidos.
- Revisar políticas de password y hashing en `clbnc` (banca digital).
- Monitoreo y logging enriquecido por request/tenant/usuario.

## Ajustes de diseño previstos
- Mantener un solo módulo `clien`; cualquier funcionalidad de persona/cliente debe residir allí.
- Reforzar contratos ApiResponse/ApiResponses para catálogos y módulos auxiliares.

## Consideraciones para próximos sprints
- Automatizar seeds de catálogos y datos mínimos para E2E.
- Añadir métricas/health extendido si se despliega en K8s.
- Completar UX/validaciones frontend alineadas con validaciones backend.

## Criterios de cierre del sprint
- Todos los catálogos creados y expuestos vía REST/NATS.
- Validaciones de identificación activas.
- E2E ejecutándose en pipeline con BD de prueba.
- Cobertura ≥80% mantenida tras nuevos módulos.
