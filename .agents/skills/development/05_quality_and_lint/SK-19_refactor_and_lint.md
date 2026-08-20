---
name: SK-19_refactor_and_lint
description: "Guía el proceso de refactorización de código, resolución de advertencias de compilación, alineación con SOLID y limpieza de errores del linter."
version: "2.3.0"
category: "development/05_quality_and_lint"
inputs:
  - target_files: "Lista de archivos o directorios a refactorizar/limpiar"
outputs:
  - "Código refactorizado sin romper la lógica existente"
  - "Cero errores de compilación o análisis estático de tipos"
  - "Linter y formateador ejecutados con éxito y con 0 advertencias/errores"
  - "Gate de duplicación de código (jscpd) en verde; métricas de complejidad/longitud reportadas"
---

Actúa como un Senior Software Engineer y QA Specialist en refactorización y análisis estático de código. Tu objetivo es limpiar y optimizar los archivos especificados en `target_files`, garantizando el cumplimiento de los **Principios SOLID**, **Clean Code** y las **Reglas de Gobernanza** del proyecto sin alterar su comportamiento de negocio.

Sigue estrictamente este flujo de trabajo secuencial:

---

## 🔍 FASE 1: Descubrimiento de Herramientas de Calidad y Reglas
1. **Identificar Linters & Typecheck:** Verifica los comandos y herramientas de análisis estático, linter y compilación declarados en `AGENTS.md` y en los manifest del proyecto.
2. **Verificar que el Linter sea Real (obligatorio):** Confirma que el comando `lint` declarado invoque una herramienta de análisis estático genuina para el lenguaje declarado en `docs/00_stack_manifest.md` sección "Calidad de Código y Linting" (ej. ESLint/Biome para JS-TS, Ruff/Pylint para Python, golangci-lint para Go, Clippy para Rust) — nunca un alias o superset trivial del compilador/type-checker (ej. `tsc --noEmit` a secas no es un linter). Un gate de "0 errores/0 advertencias" contra una herramienta que no analiza estilo ni calidad es un gate que siempre pasa sin verificar nada. Si el comando declarado resulta ser un alias del type-checker, DETENTE y repórtalo al humano antes de continuar — no lo declares completado en silencio.
3. **Descubrir Reglas de Gobernanza:** Lee `docs/04_governance_and_quality/rules/` (`backend_rules.md`, `frontend_rules.md`, `domain_rules.md`, etc.).

---

## 🧪 FASE 2: Verificación de Estado Base (Línea Base)
1. **Ejecutar Pruebas Base (TDD):** Corre la suite de pruebas unitarias/integración para comprobar que la línea base está en VERDE.
2. **Correr Linter Inicial:** Captura la lista inicial de advertencias o errores.

---

## 💻 FASE 3: Refactorización SOLID & Clean Code
1. **Refactorización SOLID:**
   - **SRP:** Extraer funciones o clases con múltiples responsabilidades.
   - **DIP:** Reemplazar instancias concretas por inyecciones de dependencias vía interfaz.
2. **Eliminar Tipos Inseguros y Código Muerto:** Reemplazar tipos dinámicos o inseguros (ej. `any`, `Object`, unvalidated casting) por tipos o estructuras explícitas y estrictas, eliminar imports o módulos no usados y funciones obsoletas.
3. **Formateo Estricto:** Ejecutar el linter y formateador oficial declarado en `AGENTS.md` para unificar la sintaxis.

---

## 🚨 FASE 4: Verificación Final (Quality Gate: 0 Errors / 0 Warnings & Mutation Score $\ge 70\%$)
1. **Verificar Tipos y Compilación:** Ejecuta el comando de compilación o verificación de tipos declarado en `AGENTS.md` para asegurar 0 errores de compilación/análisis estático.
2. **Asegurar Cero Advertencias:** Ejecuta el comando de linter oficial declarado en `AGENTS.md`. La refactorización sólo se da por completada con **0 errores y 0 advertencias**.
3. **Mutation Testing Anti-Tautología:** Ejecutar el runner de Mutation Testing del proyecto (ej. Stryker, Mutmut, PITest, cargo-mutants) sobre los módulos de dominio/casos de uso. Exigir un **Mutation Score $\ge 70\%$** (matar mutantes). Pruebas sin aserciones reales rebotan la Quality Gate.
4. **Tests de Regresión:** Vuelve a correr la suite de pruebas mediante el comando de test declarado en `AGENTS.md` para asegurar 100% de regresión exitosa.
5. **Métricas de Calidad de Código:** Ejecuta el comando de duplicación declarado en `docs/00_stack_manifest.md` (ej. `pnpm run duplication`) — **gate bloqueante**, sin excepciones. Revisa además las advertencias de complejidad ciclomática/longitud de función (`complexity`, `max-lines-per-function`, `max-depth`) que reporte el linter sobre `target_files` — son informativas mientras el proyecto pague la deuda preexistente declarada en `docs/00_stack_manifest.md`, pero cualquier función nueva o modificada en `target_files` que las dispare debe refactorizarse antes de cerrar el ticket.
6. **Reporte al Humano:** Presentar los archivos refactorizados y las métricas de mutación y duplicación estructurados estrictamente según la plantilla universal en `.agents/rules/00_output_reporting_standard.md`.
