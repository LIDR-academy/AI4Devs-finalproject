---
name: 07_production_observability_agent
description: "Workflow de observabilidad Shift-Right: captura logs/stacktraces de producción, traduce incidencias a escenarios BDD Gherkin y genera pruebas de regresión automáticas."
version: "1.0.0"
category: "workflows/observability"
---

# 🛰️ Workflow de Observabilidad Shift-Right (v1.0.0)

Este workflow captura telemetría, errores y réplicas de producción (Sentry, Datadog, Synthetics) para transformarlos de forma agnóstica en pruebas automatizadas de regresión.

---

## ⚡ Paso 1 — Ingesta y Diagnóstico de Incidencia (Shift-Right)
1. **Captura de Evidencias:** Leer el stacktrace, payload o log de la incidencia registrada en producción o prueba sintética.
2. **Extracción de Variables:** Identificar parámetros de entrada, estado inicial del sistema y la excepción o fallo de aserción producido.
3. **Anonimización GDPR (Guard 6):** Sanitizar cualquier PII (nombres, correos, IPs, credenciales) reemplazándola con identificadores sintéticos (`USER_SYNTHETIC_001`).

---

## 📝 Paso 2 — Formulación de Escenario de Regresión BDD
1. Traducir la incidencia técnica a un escenario en formato **BDD Gherkin** (`.feature`):
   ```gherkin
   Feature: Reproducción de Incidencia de Producción #INC-XXX

     Scenario: Reproducción determinista del error detectado en telemetría
       Given que el sistema se encuentra en el estado inicial anotado en el log
       When se ejecuta la operación con los parámetros sanitizados de la incidencia
       Then el sistema responde respetando la especificación y evitando la regresión
   ```

---

## 🔄 Paso 3 — Integración en la Suite de Tests & Reparación TDD
1. Crear la prueba de regresión fallida (RED) en la suite del proyecto (`apps/` o `tests/`).
2. Invocar [05_test_runner_agent.md](05_test_runner_agent.md) para ejecutar la reparación autónoma mediante el ciclo RED-GREEN-REFACTOR.
3. Validar con [06_full_qa_pipeline.md](06_full_qa_pipeline.md) que `0` regresiones hayan sido introducidas.
