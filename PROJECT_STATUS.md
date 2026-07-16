# PROJECT_STATUS — INK·LINK

> Estado actual del proyecto. **Este documento debe actualizarse al cerrar cada Historia de Usuario o hito.**
> Última actualización: 2026-07-16 (US0014 ✅ PR #17 mergeada; US0011 🟣 En revisión — PR #18)
> **Traspaso entre sesiones/IAs**: ver `HANDOFF.md` (prompt de continuación + protocolo de registro de avance)

## Resumen

| Aspecto | Estado |
|---|---|
| Entrega 1 (documentación) | ✅ Completa (con inconsistencias pendientes — `fixs/issue-004.md`) |
| Entrega 2 (implementación) | 🔵 En curso — Fase 0, US0001, US0003–US0010, US0012–US0014 completas (9/9 Must-Have ✅); US0011 en revisión — última US del backlog |
| Backlog vigente | 13 US · 80 SP · 9 Must-Have (52 SP) + 4 Should-Have (28 SP) — `docs/us/all-us.md` |
| Backend (`backend/`) | ✅ US0001 + US0003–US0006 + US0008–US0014 implementados (108 tests en verde) |
| Frontend (`frontend/`) | ✅ US0001 + US0003–US0014 implementados (126 tests en verde) |
| Docker / infraestructura local | ✅ `docker-compose.yml` (PostgreSQL16+PostGIS, MinIO; perfil `full` con api+web; perfil `seed-images` para imágenes de muestra) |
| CI/CD | ✅ `.github/workflows/ci.yml` (build + tests backend y frontend) |
| API oficial | ✅ `docs/api-spec.yml` v2.0.0 sincronizada con backlog y modelo |

## Estado por Historia de Usuario

| US | Historia | MoSCoW | SP | Estado |
|---|---|---|---|---|
| US0001 | Inicio de sesión de usuarios | Must | 3 | ✅ Done (PR #3 mergeado a main) |
| US0003 | Ver vitrina principal de tatuajes | Must | 8 | ✅ Done (PRs #4 y #5 mergeados a main) |
| US0004 | Filtrar artistas | Must | 8 | ✅ Done (PR #8 mergeado a main) |
| US0005 | Buscar artistas por texto | Must | 3 | ✅ Done (PR #9 mergeado a main) |
| US0006 | Ver perfil de artista completo | Must | 5 | ✅ Done (PR #10 mergeado a main) |
| US0007 | Badge de certificación sanitaria | Must | 2 | ✅ Done (PR #11 mergeado a main) |
| US0008 | Seleccionar slot y ver resumen | Must | 5 | ✅ Done (PR #12 mergeado a main) |
| US0009 | Pagar depósito vía Flow | Must | 13 | ✅ Done (PR #13 mergeado a main; Flow real deferred — ver Bloqueos §3) |
| US0010 | Historial + confirmar asistencia | Must | 5 | ✅ Done (PR #14 mergeado a main) |
| US0011 | Cotizar con chatbot | Should | 13 | 🟣 En revisión (feature/us0011-chatbot-cotizador, PR #18) |
| US0012 | Explorar artistas en mapa | Should | 8 | ✅ Done (PR #16 mergeado a main) |
| US0013 | Calificar artista post-sesión | Should | 5 | ✅ Done (PR #15 mergeado a main) |
| US0014 | Mostrar auspicios de marcas | Should | 2 | ✅ Done (PR #17 mergeado a main) |

Estados posibles: ⬜ Pendiente · 🔵 En desarrollo · 🟣 En revisión · ✅ Done (según Definition of Done de `CONTRIBUTING.md`)

## Bloqueos actuales

1. ~~Decisiones pendientes en `fixs/issue-004.md` §E~~ — ✅ resueltas el 2026-07-14 (ver issue-004 §G). `api-spec.yml` v2.0.0 sincronizada.
2. ~~Cuenta sandbox de Flow~~ — ✅ cuenta Flow creada el 2026-07-14 (rubro declarado: reserva/depósitos de servicios de tatuaje). Falta obtener credenciales sandbox (apiKey/secretKey) al llegar a US0009; hasta entonces se usa mock.
3. **Integración Flow real con cuenta sandbox** — ⏸️ pendiente (decisión 2026-07-15). US0009 quedó implementada mock-first: el `FlowClient` real (firma HMAC) ya existe en `backend/Infrastructure/External/FlowClient.cs`; cuando se obtengan las credenciales, configurar `Flow:ApiKey`, `Flow:SecretKey` y `Flow:UseMock=false`, y probar el flujo end-to-end contra sandbox.flow.cl. No bloquea el resto del backlog.

## Inventario de documentación

| Documento | Rol |
|---|---|
| `readme.md` | Ficha del proyecto y descripción del producto (⚠️ secciones 2–7 pendientes) |
| `docs/documentacion.md` | Documentación técnica v1: Lean Canvas, casos de uso, modelo, C4 |
| `docs/data-model.md` | Modelo de datos vigente (13 entidades) |
| `docs/api-spec.yml` | **Especificación oficial de la API** (OpenAPI 3.0) |
| `docs/us/all-us.md` | Backlog vigente consolidado (13 US) |
| `docs/us/usXXXX/` | US individuales + tickets de trabajo (25 tasks) |
| `docs/development_guide.md` | Guía de entorno de desarrollo (estado objetivo) |
| `docs/base-standards.md` + `backend/frontend/documentation-standards.md` | Estándares para agentes IA |
| `ARCHITECTURE.md` | Resumen de arquitectura |
| `DEVELOPMENT_PLAN.md` | Roadmap y orden de implementación |
| `CONTRIBUTING.md` | Flujo Git, ramas, commits, PRs, Definition of Done |
| `PROMPT_REGISTRY.md` | Especificación del registro de prompts |
| `fixs/issue-00X.md` | Registro de análisis de coherencia y decisiones |

## Próximos pasos

1. **US0011** — revisar y mergear PR #18 (`feature/us0011-chatbot-cotizador`). Con eso queda **todo el backlog (13 US / 80 SP) completo**
2. **Pendiente deferred**: integración Flow real con sandbox (ver Bloqueos §3) · `fix-search-dropdown` (dropdown sugerencias se superpone con `Resultados`) · `fixs/issue-005.md` (foto de reseña no se persiste) · upload de imágenes de referencia del chatbot a Object Storage (misma limitación que issue-005)
3. Preparación de la entrega final: revisar `readme.md` secciones 2–7 y consolidar documentación
