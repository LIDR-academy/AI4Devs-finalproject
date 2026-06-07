# Guía de Estilo: Estructura de Skills y Arneses de Reglas

Esta guía de estilo define la estructura que deben seguir todas las `SKILL.md` del repositorio, enfocándose especialmente en la implementación de la sección de **Arneses (`[HARNESS]`)**.

El objetivo de un arnés de skill es actuar como una red de seguridad y validador de calidad en tiempo de ejecución para el agente.

---

## 1. Estructura Estándar de una Skill

Toda skill en este proyecto debe estructurarse con las siguientes secciones en el orden indicado:

1. **Frontmatter (YAML):** Metadatos (`name`, `description`, `license`, `metadata`).
2. **`[ACTIVATION]`:** Criterios y triggers que activan la skill.
3. **`[RULES]`:** Reglas globales del agente.
4. **`[GATES]`:** Puertas de decisión iniciales antes de ejecutar la tarea.
5. **`[HARNESS]` (Arnés):** Restricciones específicas de dominio y autoverificaciones obligatorias.
6. **`[STEPS]`:** Pasos ordenados para el modo solo y el modo orquestado.
7. **`[OUTPUT]`:** Formato de salida y contratos a cumplir.
8. **`[REFERENCES]`:** Enlaces y dependencias locales de documentación.

---

## 2. Anatomía de la sección `[HARNESS]`

El arnés se divide en tres componentes principales:

### A. Restricciones de Dominio (Domain Constraints)
Reglas inflexibles y de cumplimiento estricto asociadas al contexto del agente.
*Ejemplo:*
- **No-destructive changes:** Jamás generar una migración de base de datos que borre tablas o columnas existentes sin un plan de transición.

### B. Aserciones de Calidad (Quality Assertions)
Criterios medibles que debe cumplir el entregable antes de ser entregado.
*Ejemplo:*
- **Idempotencia:** Todo script SQL debe poder ejecutarse múltiples veces sin lanzar errores.

### C. Procedimiento de Autoverificación (Self-Verification Loop)
Una lista de pasos obligatorios de comprobación que el agente debe ejecutar internamente sobre su propio trabajo antes de completar la tarea.

### D. Límite de Seguridad (Safety Iteration Guard)
Toda skill que requiera ciclos o auto-correcciones iterativas debe incluir un límite estricto de seguridad (máximo 3 intentos). Si al tercer intento la validación sigue fallando, la skill debe abortar, guardar el estado actual y escalar la ambigüedad/error al usuario o log.

---

## 3. Ejemplo Práctico de `[HARNESS]`

```markdown
---
name: sample-skill
description: "Ejemplo de uso de arneses"
---
...
[HARNESS]

1. **Restricción de Seguridad:** No incluir contraseñas ni claves API expuestas en texto plano.
2. **Aserción de Calidad:** Todo archivo generado debe terminar con una línea en blanco.
3. **Bucle de Autoverificación:**
   - [ ] Inspeccionar los archivos creados buscando credenciales de prueba.
   - [ ] Validar que la sintaxis sea correcta usando el compilador respectivo.
```
