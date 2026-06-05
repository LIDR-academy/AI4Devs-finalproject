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

[HARNESS]

1. **Restricción de Objetividad:** No emitir un veredicto de "Aprobado" (Pass) si existen riesgos de seguridad o rendimiento sin mitigar en los criterios correspondientes.
2. **Evaluación Ciego:** Juez A y Juez B no deben compartir variables ni contexto intermedio durante la fase de análisis inicial.
3. **No Verdicts Ambiguos:** Queda estrictamente prohibido usar términos vagos como "casi listo" o "correcto con matices" en el veredicto final.
4. **Veredicto Explícito:** El reporte final debe concluir explícitamente con uno de estos dos veredictos: APROBADO (PASS) o RECHAZADO (FAIL).
5. **Mitigaciones Obligatorias:** Cada punto fallado o marcado como vulnerabilidad técnica debe incluir una propuesta de mitigación aplicable.
6. **Mapeo de Criterios:** Toda observación en el reporte de juicio debe enlazar directamente a uno de los criterios definidos en `references/`.
7. **Trazabilidad de Código:** Las observaciones técnicas de Juez B deben incluir enlaces a líneas de código específicas del archivo auditado.
8. **Validación de Negocio:** Juez A debe confrontar que cada funcionalidad auditada cumple con la propuesta de valor del PRD original.
9. **Sin Sesgo de Confirmación:** Juez B no debe validar el código usando las mismas pruebas creadas por el desarrollador original.
10. **Impacto de Rendimiento:** Analizar y estimar el impacto en CPU/memoria de la arquitectura propuesta antes de emitir aprobación.
11. **Análisis de Regresión:** Evaluar el riesgo de que el cambio propuesto introduzca regresiones en componentes adyacentes no modificados.
12. **Chequeo de Accesibilidad:** Juez A debe auditar que las modificaciones visuales cumplen estrictamente el estándar de accesibilidad del proyecto.
13. **Procedimiento de Autoverificación - Cobertura Criterios:** Validar que se han evaluado todos los archivos de criterios definidos en `[REFERENCES]`.
14. **Procedimiento de Autoverificación - Vulnerabilidades:** Verificar que cada vulnerabilidad técnica reportada tiene asociada una solución sugerida.
15. **Procedimiento de Autoverificación - Consistencia:** Comprobar que no hay contradicciones lógicas sin resolver en las conclusiones de Juez A y Juez B.
16. **Procedimiento de Autoverificación - Enlaces:** Comprobar que todos los enlaces a archivos y líneas de código son válidos y accesibles.
17. **Procedimiento de Autoverificación - Markdown:** Asegurar que el reporte de juicio generado compila a Markdown sintácticamente limpio.
18. **Procedimiento de Autoverificación - Firmas:** Confirmar la presencia de la firma o identificador de ambos jueces en el documento final.
19. **Procedimiento de Autoverificación - Contratos:** Validar que el formato de salida cumple con la especificación `contract.d.ts`.
20. **Límite de Seguridad:** Máximo 3 intentos de autoverificación y auto-corrección. Si tras 3 intentos no se cumplen las condiciones, detener la ejecución y escalar la alerta.

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
