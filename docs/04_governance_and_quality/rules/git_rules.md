# 🔀 Reglas de Git y Workflow - Deducción de Especificaciones

Esta directiva rige el control de versiones y flujo de trabajo.

---

## 🛠️ Pila Tecnológica Detectada
* **Sistema de Control de Versiones:** Git
* **Estándar de Commits:** Conventional Commits (`feat`, `fix`, `docs`, `refactor`)
* **Manejo de Monorepo:** `pnpm` workspace atomic commits per ticket (`[TK-XXX]`)

---

## 📌 1. Commits Atómicos
* **Un Commit por Ticket:** Exactamente un commit por ticket técnico (`TK-XXX`).
* **Conventional Commits:** Formato obligatorio `feat(modulo): ...`, `fix(modulo): ...`, `docs: ...`.
* **Clean History:** Prohibido mezclar múltiples tickets técnicos en un único commit para preservar la matriz de trazabilidad de VSDD.

---

## 📌 2. Verificaciones Pre-Commit Obligatorias (Quality Gatekeeper)
Antes de realizar el commit de cualquier ticket, el agente debe ejecutar de forma determinista:
1. **Tests Unitarios e Integración:** `pnpm test` (0 fallos permitidos).
2. **Linting & Compilación Estática:** `pnpm run lint` && `pnpm run build` (0 errores / 0 advertencias).
3. **Validación OpenAPI (Spectral):** `npx -y @stoplight/spectral-cli lint docs/03_persistence_and_api/openapi.yaml` (0 violaciones de esquema).
4. **Validación DB Prisma:** `npx prisma validate --schema=apps/backend/prisma/schema.prisma` (Esquema sincronizado).

---

## 📌 3. Estructuración y Organización de Tickets por Subcarpetas
* **Ubicación Estructurada:** Todo ticket técnico debe guardarse en `docs/05_agile_planning/12_tickets/{modulo}/backend/TK-XXX.md` o `docs/05_agile_planning/12_tickets/{modulo}/frontend/TK-XXX-FE.md`.
* **Metadatos YAML Frontmatter:** Todo ticket debe declarar `ticket_id`, `us_id`, `points`, `type`, `layer` (`domain|application|infrastructure|frontend`) y `status` para permitir análisis de velocidad automatizado.
