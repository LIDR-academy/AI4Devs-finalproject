# CONTRIBUTING — INK·LINK

> Flujo de trabajo Git, convenciones y Definition of Done. Aplica a humanos y agentes IA.
> Estándares generales: `docs/base-standards.md`. Última actualización: 2026-07-14.

## Idiomas

- **Español**: documentación, tickets, mensajes de commit, PRs.
- **Inglés**: código, esquemas de datos, configuración, nombres de tests (ver `docs/base-standards.md` §2).

## Ramas

| Tipo | Convención | Ejemplo |
|---|---|---|
| Historia de usuario | `feature/usXXXX-descripcion-corta` | `feature/us0001-login` |
| Corrección | `fix/descripcion-corta` | `fix/booking-hold-ttl` |
| Documentación | `docs/descripcion-corta` | `docs/sync-api-spec` |
| Infraestructura | `chore/descripcion-corta` | `chore/docker-compose` |

Reglas:
- Nunca commitear directamente a `main`.
- Una rama = una US (o un ticket). **Nunca desarrollar dos US simultáneamente.**
- Rama de vida corta: merge al completar la Definition of Done.

## Commits

- Mensaje en español, formato conventional commits: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`.
- Referenciar la US o el ticket cuando aplique: `feat(us0001): agregar endpoint de login`.
- Commits pequeños y enfocados; no mezclar refactor con feature.
- Nunca commitear secretos, `.env`, `appsettings.Development.json` ni artefactos generados.

## Flujo por Historia de Usuario

1. **Analizar** la US (`docs/us/usXXXX/`) y sus tickets.
2. **Planificar** y preguntar si hay dudas — nunca asumir requisitos (regla anti-alucinación).
3. **Crear rama** desde `main` actualizado.
4. **Implementar un ticket a la vez** con TDD (test que falla → código → verde).
5. **Tests**: unitarios + integración pasando (`dotnet test`, `ng test`).
6. **Refactor** con tests en verde.
7. **Actualizar documentación** afectada (incluido `PROJECT_STATUS.md`).
8. **Actualizar `docs/api-spec.yml`** si se tocó el contrato REST.
9. **Registrar prompts** (skill `prompt-registry` → `prompts/00-all-prompts.md`).
10. **PR y merge** (usar `gh`; la skill `commit` automatiza commit + PR).

## Pull Requests

- Título: `[USXXXX] Descripción` (o el ticket).
- Descripción: qué cambió, por qué, cómo probarlo, US/tickets relacionados.
- CI en verde obligatorio antes de merge.
- Documentar los PRs relevantes en `readme.md` §7 (requisito de la entrega).

## Definition of Done

Una US está terminada únicamente cuando:

- [ ] Cumple todos sus criterios de aceptación
- [ ] Compila sin errores ni warnings nuevos
- [ ] Pruebas unitarias y de integración pasan
- [ ] Documentación actualizada (US, `PROJECT_STATUS.md`, guías afectadas)
- [ ] Prompts registrados en `prompts/00-all-prompts.md`
- [ ] `docs/api-spec.yml` sincronizada (si aplica)
- [ ] PR lista para revisión

## Reglas anti-alucinación (para agentes IA)

- Nunca inventar endpoints, tablas, entidades, campos, historias, requisitos o reglas de negocio.
- Fuentes de verdad: `docs/api-spec.yml` (API), `docs/data-model.md` (datos), `docs/us/all-us.md` (backlog).
- Ante ambigüedad o información faltante: **detenerse y preguntar** antes de implementar.
- No usar `openspec/` como fuente de verdad; no eliminarla ni mover documentación allí sin autorización.
