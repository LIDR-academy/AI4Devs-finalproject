# .prompts | MS-PERSO

Guía rápida para Product Managers y Developers sobre prompts y documentación clave del microservicio MS-PERSO (Personas/Clientes/Socios).

## Orden sugerido (lee en este orden)
1) 01-microservice-overview.md — Qué hace el microservicio y dónde está la info clave.
2) 02-prompt-library.md — Plantillas de prompts listas para usar.
3) 03-worklog-resumen.md — Qué ya se hizo y qué falta.
4) 04-analisis.md — Propósito, problema, alcance y estado real.
5) 05-diseno.md — Arquitectura, flujos y decisiones técnicas.
6) 06-modelo-datos.md — Tablas realmente usadas y cómo se consumen.
7) 07-estado-desarrollo.md — Implementado vs. pendiente vs. deuda.
8) 08-plan-futuro.md — Plan inmediato y criterios de cierre.

## Roles y qué leer
- Product Manager: 01 + 03 + 04 + 07 + 08
- Backend Dev: 01 + 02 + 03 + 04 + 05 + 06 + 07 + 08
- QA: 01 + 03 + 04 + 06 + 07 (tests y pendientes)
- DevOps: 01 + 02 + 05 + 07 + 08 (runtime, deploy, riesgos)

## Referencias rápidas
- Código: [src/app.module.ts](3.%20desarrollo/backend/ms-perso/src/app.module.ts)
- Configuración: [.env (ejemplo en README)](3.%20desarrollo/backend/ms-perso/README.md)
- Estado funcional: [clientes.md](3.%20desarrollo/backend/ms-perso/clientes.md)
- Validación estructura: [VALIDACION_ESTRUCTURA.md](3.%20desarrollo/backend/ms-perso/VALIDACION_ESTRUCTURA.md)
- Plan catálogos: [PLAN_CATALOGOS.md](3.%20desarrollo/backend/ms-perso/PLAN_CATALOGOS.md)
- Plan pruebas: [PLAN_PRUEBAS.md](3.%20desarrollo/backend/ms-perso/PLAN_PRUEBAS.md)
- Resumen tests: [TESTS_RESUMEN.md](3.%20desarrollo/backend/ms-perso/TESTS_RESUMEN.md)
- Spec kit: [README-SPEC-KIT.md](3.%20desarrollo/backend/ms-perso/README-SPEC-KIT.md)
