---
name: judgment-day
description: "Judgment Day, Dual Review, Adversarial Review, Juzgar, Confrontar. Validate and challenge results across the software development lifecycle."
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "2.1"
---
[ACTIVATION]

Esta skill se activa cuando la tarea o el contexto del usuario requiere realizar acciones sobre judgment-day o incluye las siguientes palabras clave/desencadenadores:
**Triggers:** judgment day, dual review, adversarial review, juzgar, confrontar

---

[RULES]

1. **Blind dual review:** Evaluar de forma independiente con dos perspectivas críticas paralelas.
2. **No soft verdicts:** Emitir aprobaciones explícitas o fallos justificados técnicamente.

---

[GATES]

| Condición | Acción | Destino / Fase |
| :--- | :--- | :--- |
| Divergencia crítica entre los evaluadores | Escalar a revisión humana y reportar contradicción | Escalar |
| Auditoría completada exitosamente | Emitir reporte unificado de juicio | Salida |


---

[STEPS]

### Solo Mode (Interactivo / Usuario)
1. Cargar el artefacto a auditar (PRD, diseño, código o pruebas).
2. Aplicar las reglas de auditoría independientes (Juez A y Juez B) según los criterios de referencia.
3. Generar el reporte consolidado de juicio indicando contradicciones y confirmaciones.
4. Actualizar el contrato de estado.

### Orchestrated Mode (Coordinado / SDD Pipeline)
1. Procesar el artefacto de entrada de forma paralela.
2. Emitir el reporte y sincronizar el contrato.

---

[OUTPUT]

Al completar su ejecución, la skill debe:
1. Generar los artefactos y archivos resultantes especificados en su modo de ejecución.
2. Escribir/Actualizar un contrato de estado en el archivo de estado de la skill (especificado por la configuración de la tarea o en Engram). El formato del contrato debe cumplir con el esquema definido en:
   - [contract.d.ts](references/contract.d.ts)

---

[REFERENCES]

- [contract.d.ts](references/contract.d.ts) — Interfaz TypeScript del contrato de datos de la skill.
- [criteria-requirements.sudolang](references/criteria-requirements.sudolang) — Criterios de evaluación de requisitos.
- [criteria-architecture.sudolang](references/criteria-architecture.sudolang) — Criterios de evaluación de arquitectura.
- [criteria-performance.sudolang](references/criteria-performance.sudolang) — Criterios de evaluación de rendimiento.
- [criteria-security.sudolang](references/criteria-security.sudolang) — Criterios de evaluación de seguridad.
- [criteria-testing.sudolang](references/criteria-testing.sudolang) — Criterios de evaluación de pruebas.
