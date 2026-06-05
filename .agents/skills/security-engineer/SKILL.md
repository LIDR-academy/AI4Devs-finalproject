---
name: security-engineer
description: "Seguridad, Security, Auditoría De Seguridad, Sast, Dast, Secretos, Dependencias Vulnerables, Owasp. Planifica, audita, remedia y valida la seguridad del código del proyecto."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "3.3"
---
[ACTIVATION]

Esta skill se activa cuando la tarea o el contexto del usuario requiere realizar acciones sobre security-engineer o incluye las siguientes palabras clave/desencadenadores:
**Triggers:** seguridad, security, auditoría de seguridad, SAST, DAST, secretos, dependencias vulnerables, OWASP

---

[RULES]

1. **Secrets Sanitization:** Nunca subir credenciales, tokens o llaves al repositorio. Rotar de inmediato si se detecta.
2. **Vulnerability Baseline:** Clasificar vulnerabilidades según CVSS. Rechazar builds con High/Critical.
3. Si una solución o diseño propuesto por el usuario es inseguro o carece de especificaciones, challengearlo y dar soluciones correctas.

---

[GATES]

| Condición | Acción | Destino / Fase |
| :--- | :--- | :--- |
| Solicitud de seguridad vaga o incompleta | Ejecutar ChallengeOrDeepenSecurity | Interactivo |
| Modo orquestado de auditoría | Ejecutar auditoría estática y generar reporte | Reporte de Seguridad |


---

[STEPS]

### Solo Mode (Interactivo / Usuario)
1. Revisar el diseño del sistema o código fuente del usuario en busca de vulnerabilidades.
2. Generar mitigaciones recomendadas para amenazas comunes de OWASP (ej. inyección SQL, XSS).
3. Guardar el reporte de modelo de amenazas en `docs/security/threat_model.md` y sincronizar el contrato.

### Orchestrated Mode (Coordinado / SDD Pipeline)
1. Auditar de forma estática el diseño y código usando el archivo de referencia `docs/design/DESIGN.md`.
2. Guardar los hallazgos en `docs/security/threat_model.md`.
3. Actualizar el contrato de estado.

---

[OUTPUT]

Al completar su ejecución, la skill debe:
1. Generar los artefactos y archivos resultantes especificados en su modo de ejecución.
2. Escribir/Actualizar un contrato de estado en el archivo de estado de la skill (especificado por la configuración de la tarea o en Engram). El formato del contrato debe cumplir con el esquema definido en:
   - [contract.d.ts](references/contract.d.ts)

---

[REFERENCES]

- [contract.d.ts](references/contract.d.ts) — Interfaz TypeScript del contrato de datos de la skill.
- [qa-engineer](file:///Users/develop/Workspace/Courses/LidrCo/AI4Devs/AI4Devs-finalproject/.agents/skills/qa-engineer/SKILL.md) — Coordinador de calidad.
