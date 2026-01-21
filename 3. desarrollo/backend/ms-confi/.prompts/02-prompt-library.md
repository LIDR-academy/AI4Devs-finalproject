# 02 · Prompt Library

Prompts listos para usar o adaptar al trabajar con MS-CONFI.

## 1) Contexto rápido
- "Explica el alcance actual de MS-CONFI (GEO y CIIU) y los endpoints disponibles, usando IMPLEMENTACION-GEO-RESUMEN.md y SWAGGER-CIIU-VERIFICACION.md como fuente."

## 2) Explorar catálogos GEO
- "Enumera los endpoints del módulo GEO y sus parámetros, con ejemplos de request y respuesta breves; fuente: TEST-GEO-ENDPOINTS.md."
- "Resume las tablas rrfprovi, rrfcanto, rrfparro y sus claves según IMPLEMENTACION-GEO-RESUMEN.md."

## 3) Swagger y DTOs CIIU
- "Verifica en SWAGGER-CIIU-VERIFICACION.md que todos los endpoints CIIU tengan ApiTags, ApiOperation y ApiResponse; lista cualquier brecha."
- "Genera ejemplos de payload para CreateSeccionRequestDto y UpdateSeccionRequestDto basados en SWAGGER-CIIU-VERIFICACION.md."

## 4) Testing
- "Qué tests existen para CIIU y qué cubren (usecase, repository, service); resume desde TEST-CIIU-RESUMEN.md y propone el siguiente test faltante."

## 5) Planificación
- "Lista pendientes del módulo GEO y CIIU y ordénalos por impacto/tiempo; usa IMPLEMENTACION-GEO-RESUMEN.md y TEST-CIIU-RESUMEN.md."

## 6) Onboarding dev
- "Dame los pasos para levantar MS-CONFI en local, con comandos npm y ruta de Swagger, según la doc existente."