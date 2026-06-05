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

[HARNESS]

1. **Sanitización de Secretos:** Queda terminantemente prohibido incluir tokens de API, contraseñas, certificados o claves privadas en el código o configuración del repositorio.
2. **Uso de Variables de Entorno:** Toda credencial requerida en tiempo de ejecución debe leerse exclusivamente de variables de entorno seguras.
3. **Escaneo de Secretos:** Configurar herramientas de escaneo de secretos (ej. GitGuardian, Trufflehog) en los pre-commits y pipelines de CI.
4. **Rotación ante Exposición:** Si se detecta un secreto expuesto en el historial de git, invalidar y rotar el secreto inmediatamente de forma obligatoria.
5. **Baseline de Vulnerabilidades:** Clasificar vulnerabilidades usando el estándar CVSSv3. Detener la pipeline ante fallos críticos o altos (CVSS >= 7.0).
6. **OWASP Top 10:** Validar que los diseños e implementaciones mitigan de manera explícita vulnerabilidades comunes como inyección SQL y XSS.
7. **Principio de Mínimo Privilegio:** Comprobar que los roles de bases de datos y accesos de red conceden únicamente los permisos mínimos indispensables.
8. **Sanitización de Entradas:** Toda entrada proveniente del cliente debe pasar por un middleware de escape y sanitización antes de procesarse.
9. **Cifrado de Datos en Tránsito:** Validar que todas las conexiones externas y servicios HTTP requieren el protocolo HTTPS (TLS 1.2 o superior).
10. **Cifrado de Datos en Reposo:** Asegurar que los datos sensibles (contraseñas, datos personales) se encriptan con algoritmos seguros (ej. bcrypt, AES-256).
11. **Manejo de Sesiones Seguras:** Comprobar que las cookies de sesión poseen las flags `HttpOnly`, `Secure` y `SameSite=Strict` o `Lax`.
12. **Actualización de Dependencias:** Validar que no se importan librerías con vulnerabilidades de seguridad conocidas mediante escaneos automáticos (`npm audit`).
13. **Procedimiento de Autoverificación - Escaneo de Código:** Ejecutar una herramienta de análisis estático (SAST) buscando fallos de seguridad comunes.
14. **Procedimiento de Autoverificación - Secret Check:** Escanear la base de código actual para descartar credenciales hardcodeadas.
15. **Procedimiento de Autoverificación - Check de Dependencias:** Analizar el árbol de dependencias buscando paquetes vulnerables.
16. **Procedimiento de Autoverificación - Validación de Entradas:** Comprobar que no hay uso de funciones peligrosas (ej. `eval()` o interpolación directa en SQL).
17. **Procedimiento de Autoverificación - CORS:** Verificar que las políticas de CORS no permiten el acceso indiscriminado.
18. **Procedimiento de Autoverificación - Control de Errores:** Validar que los errores expuestos externamente no filtran información sensible del sistema.
19. **Procedimiento de Autoverificación - Reporte:** Confirmar la generación física del reporte de amenazas en `docs/security/threat_model.md`.
20. **Límite de Seguridad:** Máximo 3 intentos de autoverificación y auto-corrección. Si tras 3 intentos no se cumplen las condiciones, detener la ejecución y escalar la alerta.

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
