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
