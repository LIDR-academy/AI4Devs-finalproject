---
name: 06_full_qa_pipeline
description: "Pipeline QA completo SOTA v2.1: (0) Pre-Flight Check proactivo, (1) Análisis Anti-N+1, Mass-Assignment y contratos, (2) Diseño de tests Few-Shot RAG, (3) Auto-Loop TDD & Mutación Stryker >= 70% con veredicto en JSON Schema estricto."
version: "2.1.0"
category: "workflows/quality"
---

# 🧪 Full QA Pipeline SOTA (v2.1.0)

Este workflow ejecuta el pipeline de aseguramiento de calidad de forma interactiva, segura y determinista sobre el proyecto.

---

## ⚡ Paso 0 — Pre-Flight Proactive Health Check
1. Ejecutar la verificación de tipos y linters oficiales declarados en `AGENTS.md` antes de modificar cualquier archivo.
2. Si se detecta desincronización de tipos o compilación corrupta, invocar `SK-22_agent_troubleshooting` para corregir de forma preventiva antes de continuar.

---

## 🎯 Paso 1 — Análisis de Riesgo RBT (6 Dimensiones), Anti-N+1, Mass-Assignment & Contratos
1. Escanear los cambios en el código (`git diff` o archivo objetivo).
2. **Evaluación de Riesgos en 6 Dimensiones (Prompt 8 RBT Standard):**
   - **UI:** Renderizado, feedback visual, micro-animaciones, ergonomic targets $\ge 48\text{px}$.
   - **Estado:** Invariantes de modelo, máquinas de estado y transiciones no permitidas.
   - **Persistencia:** Guardado en BD, transacciones atómicas y rollback ante fallos.
   - **Integración Backend:** Contratos OpenAPI, serialización/deserialización, sanitización Zod.
   - **Experiencia de Usuario (UX):** Latencia, estados defensivos (Loading/Error/Empty), idempotencia táctil.
   - **Regresión:** Efectos colaterales en módulos adyacentes.
3. **Estructura de Evaluación por Riesgo:**
   - Descripción del riesgo | Impacto | Probabilidad (Alta/Media/Baja) | Severidad | Método de Detección (Oráculo) | Tipo de Prueba Recomendada.
4. **Auditorías Específicas de Backend:** Anti-N+1 en ORM, Anti-Mass-Assignment y Validación de Contrato OpenAPI.
5. Entregar la Matriz RBT estructurada sin generar código todavía.
6. 🛑 **PAUSA OBLIGATORIA (Gate 1):** Esperar confirmación del usuario para avanzar al Paso 2.

---

## 🧪 Paso 2 — Modelado MBT (`SK-34`), Fixture Builders (`SK-32`) & Few-Shot RAG (`SK-26`)
1. Invocar `SK-34_model_based_testing_designer` para construir el modelo de máquina de estados (Estados, Transiciones, Guards, Invariantes).
2. Invocar `SK-26_few_shot_retriever` para recuperar los 2 mejores patrones de tests/código existentes en la base de código actual.
3. Invocar `SK-32_test_fixture_builder` para generar constructores de datos de prueba deterministas (Object Mother / Builder Pattern) para la fase *Arrange*.
4. Diseñar la suite de prueba determinista especificando los 3 Oráculos con etiquetas explícitas (`// ORACULO UI:`, `// ORACULO RED:`, `// ORACULO ESTADO:`):
   - Happy path (Camino feliz).
   - Cobertura simétrica Sad Path (al menos 1 test de excepción RFC 7807 por cada flujo feliz).
   - Casos borde (Unicode, nulos, rangos extremales).
   - Snapshots de regresión visual (`toHaveScreenshot()`) en componentes UI táctiles/móviles si aplica.
5. 🛑 **PAUSA OBLIGATORIA (Gate 2):** Esperar confirmación del usuario sobre el modelo MBT para avanzar al Paso 3 (Generación de Código).

---

## 🔄 Paso 3 — Bucle TDD, Performance & Auto-Loop de Pruebas de Mutación (`05_test_runner_workflow`)
1. **DELEGACIÓN A SUBAGENTE DE TESTING:** Invocar el subagente especializado [05_test_runner_workflow.md](05_test_runner_workflow.md) para ejecutar el ciclo RED-GREEN-REFACTOR.
2. **VERIFICACIÓN DE SLAS DE RENDIMIENTO:** Invocar `SK-29_load_and_performance_testing` para validar que los percentiles de latencia cumplan los criterios (p95 < 200ms).
3. **MUTATION AUTO-LOOP:** Ejecutar el runner de Mutation Testing del proyecto especificado en `AGENTS.md`. Si el **Mutation Score es menor al umbral de `testing_rules.md` (default: 70%)**, el subagente ejecutará iteraciones autónomas (hasta 3 ciclos) agregando casos borde adicionales hasta matar a todos los mutantes sintéticos.
4. **VEREDICTO ESTRUCTURADO (JSON SCHEMA ENFORCEMENT):** El Reviewer Adversarial emitirá su veredicto estrictamente bajo este formato JSON:

```json
{
  "verdict": "APPROVED",
  "mutation_score": 84.2,
  "required_mutation_score": 70.0,
  "preflight_status": "PASSED",
  "contract_compliance": "100%",
  "anti_n_plus_one_status": "PASSED",
  "mass_assignment_protection": "PASSED",
  "visual_regression_status": "PASSED",
  "latency_p95_ms": 142.5,
  "violations": []
}
```
