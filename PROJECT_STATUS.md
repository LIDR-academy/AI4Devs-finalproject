# PROJECT_STATUS — INK·LINK

> Estado actual del proyecto. **Este documento debe actualizarse al cerrar cada Historia de Usuario o hito.**
> Última actualización: 2026-07-17 — 🏷️ **[v1.0.0](https://github.com/rchamycruz/AI4Devs-finalproject/releases/tag/v1.0.0) publicada: primera versión estable del MVP** (backlog completo 13 US / 80 SP · 235 tests en verde · Flow validado e2e contra sandbox · documentación de entrega consolidada — PRs #21 y #22)
> **Traspaso entre sesiones/IAs**: ver `HANDOFF.md` (prompt de continuación + protocolo de registro de avance)

## Resumen

| Aspecto | Estado |
|---|---|
| Versión estable | 🏷️ **v1.0.0** (tag + release en GitHub, 2026-07-17) |
| Entrega 1 (documentación) | ✅ Completa (inconsistencias de `fixs/issue-004.md` resueltas; notas de vigencia en `docs/documentacion.md` — PR #22) |
| Entrega 2 (implementación) | ✅ **Backlog completo** — Fase 0 + las 13 US (9 Must-Have 52 SP + 4 Should-Have 28 SP) mergeadas a main |
| Backlog vigente | 13 US · 80 SP · 9 Must-Have (52 SP) + 4 Should-Have (28 SP) — `docs/us/all-us.md` |
| Backend (`backend/`) | ✅ US0001 + US0003–US0006 + US0008–US0014 implementados (109 tests en verde) |
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
| US0009 | Pagar depósito vía Flow | Must | 13 | ✅ Done (PR #13; integración Flow real validada e2e contra sandbox — PR #19, `docs/flow-sandbox-testing.md`) |
| US0010 | Historial + confirmar asistencia | Must | 5 | ✅ Done (PR #14 mergeado a main) |
| US0011 | Cotizar con chatbot | Should | 13 | ✅ Done (PR #18 mergeado a main; depósito según cotización — `fixs/issue-007.md`) |
| US0012 | Explorar artistas en mapa | Should | 8 | ✅ Done (PR #16 mergeado a main) |
| US0013 | Calificar artista post-sesión | Should | 5 | ✅ Done (PR #15 mergeado a main) |
| US0014 | Mostrar auspicios de marcas | Should | 2 | ✅ Done (PR #17 mergeado a main) |

Estados posibles: ⬜ Pendiente · 🔵 En desarrollo · 🟣 En revisión · ✅ Done (según Definition of Done de `CONTRIBUTING.md`)

## Bloqueos actuales

1. ~~Decisiones pendientes en `fixs/issue-004.md` §E~~ — ✅ resueltas el 2026-07-14 (ver issue-004 §G). `api-spec.yml` v2.0.0 sincronizada.
2. ~~Cuenta sandbox de Flow~~ — ✅ cuenta Flow creada el 2026-07-14 (rubro declarado: reserva/depósitos de servicios de tatuaje). Falta obtener credenciales sandbox (apiKey/secretKey) al llegar a US0009; hasta entonces se usa mock.
3. ~~Integración Flow real con cuenta sandbox~~ — ✅ **validada e2e el 2026-07-16** (PR #19): orden firmada → checkout Webpay real → confirm firmado → reserva confirmada. Guía de configuración de credenciales y pruebas: `docs/flow-sandbox-testing.md`. En local el webhook de Flow no alcanza localhost — confirm manual o túnel (documentado).

**Sin bloqueos activos.**

## Inventario de documentación

| Documento | Rol |
|---|---|
| `readme.md` | Ficha del proyecto, descripción del producto y secciones 2–7 de la entrega (incluye tarjetas de prueba del sandbox en §2.6) |
| `docs/flow-sandbox-testing.md` | Guía de pruebas del sandbox de Flow: levantar proyecto, credenciales, flujo e2e |
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

1. **Preparación de la entrega final**: revisar y consolidar la documentación (`readme.md` §2–7, diagramas, PRs enumerados en §7) y grabar/preparar la demo
2. **Mejoras opcionales (post-backlog)**: `fix-search-dropdown` (dropdown sugerencias se superpone con `Resultados`) · `fixs/issue-005.md` (foto de reseña no se persiste) · upload de imágenes de referencia del chatbot a Object Storage (misma limitación que issue-005)
