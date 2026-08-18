---
name: 07_production_observability_agent
description: "Workflow de observabilidad Shift-Right v2.0: captura logs/stacktraces de producción, traduce incidencias a escenarios BDD Gherkin, genera pruebas de regresión automáticas y cierra el bucle de feedback convirtiendo incidencias en tickets TK-XXX del backlog."
version: "2.0.0"
category: "workflows/observability"
---

# 🛰️ Workflow de Observabilidad Shift-Right (v2.0.0)

Este workflow captura telemetría, errores y réplicas de producción para transformarlos de forma agnóstica en pruebas automatizadas de regresión **y en tickets técnicos accionables en el backlog**, cerrando el ciclo completo de mejora continua.

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

---

## 🎫 Paso 4 — Cierre del Bucle: Incidencia → Ticket TK-XXX (NUEVO v2.0)

Una vez confirmada la regresión y el fix, cerrar el ciclo de feedback convirtiendo la incidencia en un ticket formal del backlog:

### 4.1. Clasificación de la Incidencia
Determinar la categoría de la incidencia para asignarla al módulo correcto:

| Tipo de Incidencia | Módulo Afectado | Prioridad MoSCoW |
|:-------------------|:----------------|:-----------------|
| Error de autenticación / JWT | `auth/` | MUST |
| Error de cálculo de stock / decimal | `stock/` o `kitchen/` | MUST |
| Error de API / contrato HTTP | `infrastructure/http/` | SHOULD |
| Error de UI / accesibilidad | `frontend/features/` | COULD |
| Error de rendimiento / latencia | `infrastructure/` | SHOULD |

### 4.2. Generación del Ticket TK-XXX

1. **Leer el índice de tickets** en `docs/05_agile_planning/12_tickets/indice_tickets.md` para determinar el siguiente correlativo libre.
2. **Crear el archivo de ticket** en `docs/05_agile_planning/12_tickets/{modulo}/backend/TK-NNN.md` con la estructura:

```markdown
---
ticket: TK-NNN
tipo: bug-regression
origen: producción / INC-XXX
prioridad: MUST
story_points: 2
---

# 🐛 TK-NNN: [Descripción del Bug]

## Incidencia de Origen
- **ID Incidencia:** INC-XXX
- **Entorno:** Producción
- **Detectado:** [fecha UTC]
- **Stacktrace Sanitizado:** [extracto sin PII]

## Criterio de Aceptación (BDD Gherkin)
[Pegar el escenario generado en el Paso 2]

## Definition of Done (DoD)
- [ ] Prueba de regresión RED creada y ejecutada.
- [ ] Fix implementado → prueba en GREEN.
- [ ] `pnpm test` sin regresiones (51+/51+ tests).
- [ ] Smoke test del Workflow 08 confirmado en staging.
- [ ] 1 commit atómico `fix: TK-NNN [descripción]`.
```

3. **Enlazar el ticket** en `docs/05_agile_planning/12_tickets/indice_tickets.md`.
4. **Registrar la incidencia** en `docs/05_agile_planning/15_history.md`:
   ```text
   [fecha UTC] | INC-XXX | Bug: [descripción breve] | TK-NNN generado | Fix: PENDIENTE
   ```

### 4.3. Notificación al Humano

Presentar al humano el resumen de la incidencia y el ticket generado para su **aprobación y priorización** antes de iniciar el ciclo de desarrollo:

```text
🚨 INCIDENCIA DETECTADA EN PRODUCCIÓN
════════════════════════════════════════
Incidencia: INC-XXX
Categoría:  [tipo]
Módulo:     [módulo afectado]
Ticket:     TK-NNN (creado en docs/05_agile_planning/)
Prioridad sugerida: [MUST / SHOULD / COULD]

Escenario BDD generado:
  Given [estado inicial]
  When  [operación fallida]
  Then  [comportamiento esperado]

¿Aprueba el inicio del ciclo TDD para TK-NNN?
```

