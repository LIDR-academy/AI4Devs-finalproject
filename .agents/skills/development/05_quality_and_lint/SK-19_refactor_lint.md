---
name: SK-19_refactor_lint
description: "Guía el proceso de refactorización de código, resolución de advertencias de compilación, alineación con SOLID y limpieza de errores del linter."
version: "2.1.0"
category: "development/05_quality_and_lint"
inputs:
  - target_files: "Lista de archivos o directorios a refactorizar/limpiar"
outputs:
  - "Código refactorizado sin romper la lógica existente"
  - "Cero errores de compilación o análisis estático de tipos"
  - "Linter y formateador ejecutados con éxito y con 0 advertencias/errores"
---

Actúa como un Senior Software Engineer y QA Specialist en refactorización y análisis estático de código. Tu objetivo es limpiar y optimizar los archivos especificados en `target_files`, garantizando el cumplimiento de los **Principios SOLID**, **Clean Code** y las **Reglas de Gobernanza** del proyecto sin alterar su comportamiento de negocio.

Sigue estrictamente este flujo de trabajo secuencial:

---

## 🔍 FASE 1: Descubrimiento de Herramientas de Calidad y Reglas
1. **Identificar Linters & Typecheck:** Verifica `tsconfig.json`, `.eslintrc`, `oxlint` o scripts de `package.json` (`pnpm run lint`, `pnpm run build`).
2. **Descubrir Reglas de Gobernanza:** Lee `docs/04_governance_and_quality/rules/` (`backend_rules.md`, `frontend_rules.md`, `domain_rules.md`, etc.).

---

## 🧪 FASE 2: Verificación de Estado Base (Línea Base)
1. **Ejecutar Pruebas Base (TDD):** Corre la suite de pruebas unitarias/integración para comprobar que la línea base está en VERDE.
2. **Correr Linter Inicial:** Captura la lista inicial de advertencias o errores.

---

## 💻 FASE 3: Refactorización SOLID & Clean Code
1. **Refactorización SOLID:**
   - **SRP:** Extraer funciones o clases con múltiples responsabilidades.
   - **DIP:** Reemplazar instancias concretas por inyecciones de dependencias vía interfaz.
2. **Eliminar `any` y Código Muerto:** Reemplazar tipos `any` por tipos explícitos o `import type`, eliminar imports no usados y funciones obsoletas.
3. **Formateo Estricto:** Ejecutar el linter y formateador oficial para unificar la sintaxis.

---

## 🚨 FASE 4: Verificación Final (Quality Gate: 0 Errors / 0 Warnings & Mutation Score $\ge 70\%$)
1. **Verificar Tipos y Compilación:** Ejecuta `pnpm run build` para asegurar 0 errores TypeScript.
2. **Asegurar Cero Advertencias:** Ejecuta `pnpm run lint`. La refactorización sólo se da por completada con **0 errores y 0 advertencias**.
3. **Mutation Testing Anti-Tautología:** Ejecutar `@stryker-mutator/core` sobre los módulos de dominio/casos de uso. Exigir un **Mutation Score $\ge 70\%$** (matar mutantes). Pruebas sin aserciones reales rebotan la Quality Gate.
4. **Tests de Regresión:** Vuelve a correr la suite de pruebas para asegurar 100% de regresión exitosa.
5. **Reporte al Humano:** Presentar los archivos refactorizados y las métricas de mutación estructurados estrictamente según la plantilla universal en `.agents/rules/00_output_reporting_standard.md`.
