# ADR-0003: Refinamiento de reglas Cursor, mapa canónico y lista de ficheros tocados

## Estado

Aceptada (trabajo completado; este ADR conserva el registro por si se reabre el hilo de redacción).

## Contexto

Se buscaba **menos texto duplicado** entre `.cursor/rules/*.mdc`, `AGENTS.md` y `docs/`, con **una fuente preferente por tema** y reglas cortas que enlazaran al detalle. Se definió un plan por prioridades y una lista concreta de ficheros a revisar. Esa lista vivía temporalmente en [canonical-sources.md](../engineering/canonical-sources.md) y generaba ruido una vez aplicado el plan.

## Decisión

1. Mantener el **mapa tema → canónico** en [docs/engineering/canonical-sources.md](../engineering/canonical-sources.md) como guía estable de navegación.
2. **Trasladar** la lista ordenada de ficheros y prioridades del plan de redacción a este **ADR**, como registro histórico y trazabilidad, no como trabajo pendiente.
3. El [readme.md](../../readme.md) de la raíz quedó **fuera** de ese barrido por decisión de equipo.

## Lista aplicada (referencia)

Orden del refuerzo “menos verbose, más enlaces”:

1. **Prioridad 1:** `.cursor/rules/spring-boot-4-backend.mdc`, `data-model-design.mdc`, `api-design.mdc`, `api-security.mdc`, `logging.mdc`
2. **Prioridad 2:** `AGENTS.md`, `docs/README.md`, `docs/engineering/testing-java.md` §3
3. **Prioridad 3:** `.cursor/rules/microservices-patterns.mdc`, `mongo-hybrid.mdc`, `backend-generation-standard.mdc` (anclas a **## Persistencia** en `spring-boot-4-backend`, checklist acortado)

## Consecuencias

- **Positivas:** `canonical-sources.md` se centra en el mapa y el criterio regla corta vs canónico; el ADR acumula el “qué se hizo y sobre qué ficheros” sin mezclar normativa operativa con histórico de proyecto.
- **Negativas:** quien busque solo la lista debe abrir este ADR además del mapa en ingeniería.
