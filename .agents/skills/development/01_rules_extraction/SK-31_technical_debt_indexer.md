---
name: SK-31_technical_debt_indexer
description: "Indexa, prioriza y cataloga la deuda técnica, vulnerabilidades y antipatrones de código legacy en docs/05_agile_planning/technical_debt.md de forma agnóstica."
version: "1.0.0"
category: "development/01_rules_extraction"
inputs:
  - codebase_path: "Ruta del proyecto o subdirectorio a auditar"
outputs:
  - "Matriz de Deuda Técnica catalogada en docs/05_agile_planning/technical_debt.md"
---

Actúa como un Lead Technical Debt & Quality Assurance Officer. Tu objetivo es inspeccionar el código legacy y catalogar la deuda técnica acumulada de forma objetiva, agnóstica y accionable.

---

## 🔍 FASE 1: Inspección de Antipatrones y Vulnerabilidades
1. **Auditoría de Dependencias:** Identificar paquetes obsoletos o con alertas de seguridad.
2. **Auditoría de Complejidad:** Detectar funciones o métodos excesivamente largos (> 50 líneas), anidamientos profundos o acoplamiento fuerte.
3. **Auditoría de Antipatrones Universales:** Identificar violaciones de los 20 Guardarraíles (ej. `catch` vacíos, `any`, `parseFloat` en importes/stocks, rutas unauthenticated).

---

## 📝 FASE 2: Clasificación y Estimación de Deuda
1. Clasificar cada hallazgo según su severidad: **CRÍTICA**, **ALTA**, **MEDIA**, **BAJA**.
2. Asignar estimación de esfuerzo en puntos de historia o días de refactorización.
3. Generar la matriz en `docs/05_agile_planning/technical_debt.md`:

| ID | Componente / Fichero | Antipatrón / Riesgo | Severidad | Esfuerzo Estimado |
|---|---|---|---|---|
| `TD-001` | `src/legacy/service.ts` | Captura silenciosa de excepciones (`catch {}`) | CRÍTICA | 0.5 días |
| `TD-002` | `src/legacy/utils.ts` | Uso de `parseFloat` para cantidades físicas | ALTA | 1 día |

---

## ✅ FASE 3: Generación de Tickets de Refactorización
1. Convertir los elementos de mayor severidad (CRÍTICA/ALTA) en borradores de tickets BDD en `docs/05_agile_planning/tickets/`.
