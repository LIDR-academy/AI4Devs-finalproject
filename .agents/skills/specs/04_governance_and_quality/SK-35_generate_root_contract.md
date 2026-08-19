---
name: root-contract-generation
description: "Genera o actualiza el contrato operativo raíz AGENTS.md siguiendo el blueprint de 6 secciones, y los archivos de entrypoint por herramienta de IA (CLAUDE.md, GEMINI.md) que garantizan que AGENTS.md se lea antes de cualquier acción."
version: "1.0.0"
category: "04_governance_and_quality"
inputs:
  - "docs/00_stack_manifest.md"
  - "docs/02_architecture_design/04_technical_design.md"
outputs:
  - "AGENTS.md"
  - "CLAUDE.md"
  - "GEMINI.md"
---

# 📜 SK-35: Generación del Contrato Operativo Raíz (v1.0.0)

Actúa como un **Principal Software Architect** y **Technical Writer** experto en contratos operativos para agentes de IA. Tu objetivo es generar (o actualizar) `AGENTS.md` en la raíz del proyecto a partir de las decisiones ya aprobadas en `docs/00_stack_manifest.md` y `docs/02_architecture_design/04_technical_design.md` — este skill **no decide tecnología ni convenciones nuevas**, solo traduce lo ya aprobado por el humano a un contrato operativo denso y accionable.

---

## 🚫 Non-Goals de Ejecución del Agente (Guards)

Durante la ejecución de este skill, el agente TIENE PROHIBIDO:
1. **No inventar comandos:** Todo comando CLI declarado en `AGENTS.md` debe existir realmente en `package.json`/manifiesto de build del proyecto (o haber sido confirmado por el humano) — nunca un comando plausible pero no verificado.
2. **No decidir stack ni convenciones:** Si `docs/00_stack_manifest.md` no existe todavía, este skill se detiene y remite a `SK-04` — no asume valores por defecto.
3. **No sobrescribir sin diff:** Si `AGENTS.md` ya existe, muestra el diff exacto de los cambios propuestos y espera confirmación antes de guardar — es el contrato que todo el resto de `.agents/` obedece, un cambio silencioso ahí tiene efecto cascada sobre cada skill.

---

## 🔄 Pipeline de Ejecución Secuencial en 2 Fases

### 📍 Fase 1: Generación de `AGENTS.md` (Blueprint de 6 Secciones)
Siguiendo estrictamente el estándar ya definido en [`.agents/rules/README.md`](../../../rules/README.md#-root-contract-generation-standard-agentsmd-blueprint):
1. **⚡ Quick Agent Execution Commands:** Extrae de `package.json`/manifiesto de build los comandos reales de `test`, `build`, `lint` y validación de contrato/schema — cópialos literalmente, no los parafrasees.
2. **🧭 Project Context & Tech Stack:** Resume la tabla de `docs/00_stack_manifest.md` (Backend, Frontend, DB/ORM, Librería de Validación, Librería de Precisión, Test Runner, Workspace Tooling) — referencia el manifiesto como fuente, no dupliques la tabla completa.
3. **💡 Few-Shot Pattern Standards:** Si `.agents/examples/00_few_shot_patterns.md` tiene contenido aplicable al stack recién confirmado, referencia esos patrones; si el stack es nuevo para el catálogo de ejemplos, genera 1-2 snippets cortos `Avoided` vs `Preferred` específicos de ese stack.
4. **🛡️ Security Boundaries & Restricted Zones:** Reglas contra secretos reales en el repo, contra modificar migraciones ya aplicadas, y el **Test Protection Guard** (prohibido saltar/eliminar/deshabilitar tests en rojo para forzar un build verde).
5. **💬 Communication & Anti-Verbosity Policy:** Copia la política estándar de alta densidad y cero preámbulo conversacional (igual en todo proyecto gobernado por `.agents/`, no varía por stack).
6. **🧪 Quality Gates & Cascading Integration:** TDD Red-Green-Refactor, sanitización activa con la librería declarada en el stack manifest (nunca asumas Zod si el stack no lo declara), 0 errores de lint/build, commits atómicos y auditoría por Reviewer independiente.

### 📍 Fase 2: Entrypoints por Herramienta de IA
Genera (si no existen) los archivos raíz que fuerzan a cada asistente a leer `AGENTS.md` primero — son idénticos en contenido entre sí, solo cambia el nombre de archivo según la herramienta:
```markdown
# 🤖 AI Assistant Entrypoint

> All operational rules, architectural guidelines, quality gates, and workflows for this repository are defined in the Single Source of Truth (SSoT):
> **Read [`AGENTS.md`](./AGENTS.md) first before performing any action.**
```
Genera como mínimo `CLAUDE.md` y `GEMINI.md`. Si el humano confirma el uso de otra herramienta con convención de entrypoint propia, añade el archivo correspondiente con el mismo contenido.

---

## 📌 Reporte al Humano
Presenta el `AGENTS.md` generado (o el diff, si ya existía) y espera confirmación antes de darlo por definitivo — es el archivo que todas las demás skills leen primero, un error aquí se propaga a cada ejecución futura.
