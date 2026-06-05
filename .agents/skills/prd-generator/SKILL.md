---
name: prd-generator
description: "Prd, Product Requirements, Product Definition, Requisitos De Producto, Definición De Producto. Generates a PRD from a user brief with section-by-section approval."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "2.1"
---
[ACTIVATION]

Esta skill se activa cuando la tarea o el contexto del usuario requiere realizar acciones sobre prd-generator o incluye las siguientes palabras clave/desencadenadores:
**Triggers:** PRD, product requirements, product definition, requisitos de producto, definición de producto

---

[RULES]

1. **SMART Metrics:** Enforce that all business requirements are defined in SMART formats.
2. **Traceability:** Establish explicit maps between target user personas and core features.
3. **Section-by-Section Approval:** Pause and await user verification before assembling the final PRD.

---

[GATES]

| Condición | Acción | Destino / Fase |
| :--- | :--- | :--- |
| Se genera o actualiza una sección | Pausar y esperar feedback del usuario | Interactivo |
| Se solicita actualización de documento | Editar, re-validar e incrementar versión | Modo Edición |


---

[HARNESS]

1. **Restricción de Completitud:** Queda estrictamente prohibido entregar el PRD con texto de ejemplo, plantillas genéricas o secciones vacías.
2. **Métricas SMART:** Todos los requisitos de negocio y KPIs deben expresarse con métricas medibles, alcanzables y con plazos de tiempo definidos.
3. **Trazabilidad de Personas:** Toda característica propuesta en el alcance del producto debe estar explícitamente vinculada a al menos un User Persona definido.
4. **No Placeholders:** Queda prohibido el uso de términos como "TBD", "por definir", "Lorem Ipsum" o equivalentes en el documento final.
5. **Requisitos de Rendimiento:** Definir al menos tres requisitos no funcionales (rendimiento, seguridad, escalabilidad) con límites cuantitativos concretos.
6. **Sección de Riesgos:** El PRD debe incluir obligatoriamente una sección de análisis de riesgos y sus planes de mitigación correspondientes.
7. **Control de Versiones:** El encabezado del PRD debe incluir una tabla de control de cambios con fecha, autor y resumen de modificaciones.
8. **Alcance Excluido:** Definir de manera explícita qué características quedan fuera del alcance (Out of Scope) para evitar la corrupción del alcance.
9. **Criterios de Aceptación de Alto Nivel:** Cada funcionalidad clave descrita debe contar con al menos un criterio de éxito medible para el negocio.
10. **Alineación de Objetivos:** Los objetivos del producto deben mapear y justificar el beneficio de negocio o retorno de inversión esperado.
11. **Glosario Obligatorio:** Si el dominio del proyecto tiene términos específicos, incluir un glosario explicativo al inicio del documento.
12. **Dependencias del Sistema:** Listar las dependencias tecnológicas o integraciones de terceros requeridas para la viabilidad técnica.
13. **Procedimiento de Autoverificación - Check de Placeholders:** Buscar cadenas de texto del tipo "TBD", "completar" o texto genérico en todo el archivo.
14. **Procedimiento de Autoverificación - Verificación SMART:** Asegurar que cada KPI tiene un número/porcentaje y una ventana temporal de medición.
15. **Procedimiento de Autoverificación - Trazabilidad Personas:** Confirmar que no hay funcionalidades sin un usuario de destino claro.
16. **Procedimiento de Autoverificación - Mapeo de Referencias:** Validar que los enlaces internos de documentación en `docs/` apuntan a archivos existentes.
17. **Procedimiento de Autoverificación - Estilo Markdown:** Asegurar que no hay errores sintácticos de marcado que rompan el parseo de encabezados.
18. **Procedimiento de Autoverificación - Sección de Exclusiones:** Comprobar la presencia de la lista de características fuera de alcance.
19. **Procedimiento de Autoverificación - Plantilla:** Verificar que el documento final hereda correctamente todas las secciones de `prd-template.md`.
20. **Límite de Seguridad:** Máximo 3 intentos de autoverificación y auto-corrección. Si tras 3 intentos no se cumplen las condiciones, detener la ejecución y escalar la alerta.

---

[STEPS]

### Solo Mode (Interactivo / Usuario)
1. Leer el brief del usuario y validar longitud/contenido.
2. Iterar sobre cada sección del PRD (Vision, TargetUsers, ProductScope, BusinessRequirements, CompetitiveContext, Constraints).
3. Cargar el template `assets/prd-template.md` para cada sección.
4. Validar cada sección usando las reglas en `references/validation-rules.md`.
5. Presentar la sección al usuario en su idioma y esperar aprobación/modificación/rechazo.
6. Una vez aprobadas todas las secciones, ensamblar el PRD final en `docs/prd/PRD.md`.

### Orchestrated Mode (Coordinado / SDD Pipeline)
1. Leer el path de referencia del brief desde el contrato.
2. Generar el documento completo de PRD aplicando las reglas de validación sin pausas si está pre-aprobado.
3. Guardar el archivo PRD final en `docs/prd/PRD.md` y actualizar el contrato.

---

[OUTPUT]

Al completar su ejecución, la skill debe:
1. Generar los artefactos y archivos resultantes especificados en su modo de ejecución.
2. Escribir/Actualizar un contrato de estado en el archivo de estado de la skill (especificado por la configuración de la tarea o en Engram). El formato del contrato debe cumplir con el esquema definido en:
   - [contract.d.ts](references/contract.d.ts)

---

[REFERENCES]

- [contract.d.ts](references/contract.d.ts) — Interfaz TypeScript del contrato de datos de la skill.
- [validation-rules.md](references/validation-rules.md) — Reglas de validación y criterios de aceptación.
- [prd-template.md](assets/prd-template.md) — Plantilla base para las secciones del PRD.
