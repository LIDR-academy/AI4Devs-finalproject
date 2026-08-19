# 📜 Changelog — `.agents/` Framework

Formato basado en [Keep a Changelog](https://keepachangelog.com/). Las versiones siguen el número declarado en el frontmatter de [README.md](README.md).

---

## [Unreleased]
### Added
- `workflows/00_greenfield_bootstrap_workflow.md`: cierra el gap de que `.agents/` no podía arrancar un proyecto genuinamente vacío (sin `docs/00_stack_manifest.md` ni scaffolding de repo). Delega en `SK-01`/`SK-02` para el PRD inicial, exige decisión de stack humana explícita antes de escribir el manifiesto, y scaffoldea repo + esqueleto de `docs/` para que `01_cascading_spec_workflow.md` pueda operar. Documentado el criterio de numeración `00` = una sola vez/meta-nivel vs `01`-`08` = ciclo repetible en `CONTRIBUTING.md`.
- `workflows/00_brownfield_adoption_workflow.md`: equivalente al bootstrap greenfield para proyectos con código existente sin `docs/` previo. Orquesta `SK-30`/`SK-33` (extracción técnica) → `SK-01` Modo C nuevo/`SK-02` (reconstrucción de producto vía entrevista humana obligatoria, nunca inferencia silenciosa) → `SK-04` en modo descubrimiento (nuevo: detecta el stack real por inspección de manifiestos en vez de proponer alternativas) → `SK-27`/`SK-31` (reglas + deuda técnica). `SK-04` ahora soporta ambos modos (Greenfield: propone y decide con el humano; Brownfield: descubre y confirma con el humano).
- `SK-01_discover_product_vision.md`: nuevo MODO C (Reconstrucción Retroactiva desde Código Legacy) además de los Modos A/B existentes — exige entrevista humana antes de escribir cualquier artefacto y documenta explícitamente cualquier discrepancia entre lo que el código hace y lo que el humano describe como intención.
- `SK-35_generate_root_contract.md` (nuevo): cierra otro gap de la misma clase que `docs/00_stack_manifest.md` — el "Root Contract Generation Standard (AGENTS.md Blueprint)" estaba documentado en `rules/README.md` desde antes, pero ninguna skill lo generaba. Ahora genera `AGENTS.md` + entrypoints `CLAUDE.md`/`GEMINI.md`, wireado como paso obligatorio en ambos workflows de bootstrap (greenfield FASE 3, brownfield FASE 4) antes de invocar cualquier skill que lea comandos de `AGENTS.md`. De paso, corregido el propio blueprint en `rules/README.md` (mencionaba "Zod sanitization" hardcodeado).
- `scripts/install.sh` (nuevo) + sección "0. Instalación" en `README.md`: primer mecanismo real de distribución — antes no había forma documentada de llevar `.agents/` a otro proyecto. Resuelve la paradoja de arranque (los entrypoints dicen "lee AGENTS.md primero" pero ese archivo no existe hasta el bootstrap) con un `AGENTS.md` stub que redirige al workflow correcto.
### Fixed
- **`check_links.py` fallaba en cualquier proyecto recién instalado, sin bootstrapear.** Probado con `install.sh` contra un directorio vacío real: `required_rules` y enlaces markdown que apuntan a `docs/` (artefactos que `.agents/` genera en tiempo de ejecución, no que deban preexistir) se reportaban como rotos. Primer fix: se omiten mientras `docs/00_stack_manifest.md` no exista (fase pre-bootstrap).
- **Ese primer fix era insuficiente** — descubierto ejecutando `00_greenfield_bootstrap_workflow.md` de punta a punta contra un proyecto de prueba real ("TaskFlow"): tras completar el bootstrap, `docs/01_product_definition/` ya tiene contenido pero `docs/04_governance_and_quality/rules/` todavía no (`SK-27` corre después, en el ciclo normal) — el flag global "bootstrapeado o no" daba falsos positivos en ese estado intermedio legítimo. Reemplazado por un criterio **por-carpeta**: una referencia hacia `docs/` se omite solo si su carpeta contenedora específica todavía no tiene ningún `.md` real; si ya tiene contenido, se valida en serio. Verificado en 3 escenarios: proyecto vacío, proyecto recién bootstrapeado (el caso que rompía), y este mismo repo maduro con una regresión inyectada a mano. 3 tests nuevos en `test_check_links.py` (9 en total).
- **Cuarto hallazgo, ejecutando `00_brownfield_adoption_workflow.md` de punta a punta contra un proyecto real ("readtrack-api", backend-only sin frontend):** `SK-27` genera `docs/04_governance_and_quality/rules/` dinámicamente según lo que el proyecto necesita — un proyecto sin frontend legítimamente nunca genera `frontend_rules.md`, y `SK-17` (que lo declara en `required_rules`) tampoco se invoca nunca ahí. El criterio por-carpeta no distinguía esto: una vez que `rules/` tiene contenido, exigía TODOS los archivos con nombre fijo que cualquier skill pudiera declarar. Como no hay forma estática de distinguir "nunca aplicó a este proyecto" de "se rompió por accidente" dentro de esa carpeta específica, se degrada a advertencia visible (⚠️, no bloqueante) — mismo tratamiento que los huecos de numeración de skills. 1 test nuevo (10 en total). Probado explícitamente: RestoStock (con frontend real) sigue exigiendo `frontend_rules.md` en serio; un proyecto backend-only no.
- Diagrama superior del README (§1, "Arquitectura del Arnés") desactualizado desde antes de esta sesión ("Workflows 00..06", "SK-01..27") — actualizado a 11 workflows / 35 skills reales, incluyendo las nuevas capas de bootstrap y `AGENTS.md`/`docs/00_stack_manifest.md` como artefactos generados, no estáticos.
- Tests unitarios (`unittest`) para `check_links.py`, wireados en `validate_agents.sh`.
- `LICENSE` (MIT) real en `.agents/`, enlazado desde el README.
- Validación de `required_rules` del frontmatter YAML y detección de IDs `SK-XX` duplicados/huecos en `check_links.py`.
- `check_contract_drift.sh` y `profile_test_suite.sh` wireados en `.github/workflows/ci.yml` (antes documentados pero nunca ejecutados en CI).
- `check_contract_drift.sh`: mapeo de drift por módulo de dominio (heurístico ruta OpenAPI → controller/schema Zod), en vez de un conteo global. Detectó un drift real: `/api/catalog/recipes` documentado sin implementación, y mismatch de prefijo `/v1` entre el contrato y las rutas montadas — corregido en `docs/03_persistence_and_api/openapi.yaml` y `07_api_specification.md`.
- `check_rules_freshness.sh` (nuevo, informativo en CI): detecta cuándo un doc fuente de `docs/0N.../` cambió después que su regla dinámica derivada en `docs/04_governance_and_quality/rules/`.
- `CONTRIBUTING.md`, `CHANGELOG.md`, `VERSIONING.md` en `.agents/`.
- `rules/03_untrusted_content_standard.md`: modelo de amenaza y mitigaciones de prompt injection vía `docs/`.
- Mutation testing (Stryker 8, ya declarado en `docs/00_stack_manifest.md` pero nunca instalado) wireado en `apps/backend/stryker.conf.json`, escopeado a `domain/`+`application/` (sin DB). Score real medido: 63.84%, bajo el umbral 70% — wireado como paso **informativo** en CI (`continue-on-error`), no bloqueante, hasta que se escriban los tests que faltan.
- Git hook `commit-msg` (`.husky/`, instalado vía `pnpm install`): exige referenciar `TK-XXX` en cada commit, con bypass explícito `[skip-tk]` y excepción automática para `Merge`/`Revert`.
### Changed
- `set -o pipefail` en los 3 scripts bash de `.agents/scripts/` para evitar que fallos dentro de un pipeline queden enmascarados.
- `docs/03_persistence_and_api/openapi.yaml`: todas las rutas ahora documentan el prefijo real `/api/v1/...`; se eliminó `/api/catalog/recipes` (sin implementación) y sus schemas huérfanos `CreateRecipeRequest`/`CreateRecipeResponse`.

## [2.3.0] — SOTA Enterprise 2026 Edition
- `TK-027`: estandarización de nomenclatura, sufijos de workflow y jerarquía del árbol de skills.
- `TK-026`: Workflow 08 (Smoke Test + Deploy Validation) y Workflow 07 v2.0 (bucle de feedback incidente→ticket).
- `TK-025`: Guard 24 Anti-Stack-Hardcoding + `docs/00_stack_manifest.md` como SSoT + Fase 0 obligatoria.
- `TK-024`: fix y mejora de M-01 (contract drift), M-02 (test profiler), catálogo M-03 (SK-29..34), M-04 (Guard OIDC + OpenTofu).
- `TK-023`: formalización del rol DevSecOps en el catálogo del README.
- `TK-021`: README actualizado a 34 skills y 8 workflows.

## [2.2.0] y anteriores
- `TK-022`: registro de PRs #1-#3 en el README raíz.
- `TK-020`: Guard 22 (IaC OpenTofu) y Guard 23 (CI/CD SOTA Node 24).
- Historial anterior a `TK-020` no reconstruido — ver `git log` para detalle completo.
