---
name: prd-generator
description: "Generates a highly detailed, professional-grade PRD from a user brief with section-by-section approval, incorporating mobile permissions, local storage schemas, GDPR compliance, cost tradeoffs, step-by-step UX flows, success metrics, and KPIs."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "3.0"
---
[ACTIVATION]

Esta skill se activa cuando la tarea o el contexto del usuario requiere realizar acciones sobre prd-generator o incluye las siguientes palabras clave/desencadenadores:
**Triggers:** PRD, product requirements, product definition, requisitos de producto, definición de producto, métricas, KPIs, metrics, success metrics, métricas de éxito

---

[RULES]

1. **SMART Metrics:** Enforce that all business requirements, KPIs, and non-functional requirements are defined in SMART formats with quantitative limits.
2. **Traceability:** Establish explicit maps between target user personas, jobs to be done (JTBD), and core features.
3. **Deep Product and Technical Analysis:** The PRD must address key operational realities including mobile web permission flows (cámara, ubicación, HTTPS), local browser storage limits, JSON export/import data structures (timestamps and version control), OCR processing cost-accuracy tradeoffs (heuristics vs LLM tokens), and strict privacy-by-design (GDPR separate consent, pseudonymization vs anonymization, hyper-local re-identification risk).
4. **Section-by-Section Approval:** Pause and await user verification before assembling the final PRD.

---

[GATES]

| Condición | Acción | Destino / Fase |
| :--- | :--- | :--- |
| Se genera o actualiza una sección | Pausar y esperar feedback del usuario | Interactivo |
| Se solicita actualización de documento | Editar, re-validar e incrementar versión | Modo Edición |

---

[HARNESS]

1. **Restricción de Completitud:** Queda estrictamente prohibido entregar el PRD con texto de ejemplo, plantillas genéricas, placeholders o secciones vacías (prohibido "TBD", "por definir", "Lorem Ipsum").
2. **Métricas SMART:** Todos los requisitos de negocio y KPIs deben expresarse con métricas medibles, alcanzables y con plazos de tiempo definidos.
3. **Trazabilidad de Personas y JTBD:** Toda característica propuesta en el alcance del producto debe estar explícitamente vinculada a al menos un User Persona y a su correspondiente Job to Be Done (JTBD).
4. **Requisitos de Rendimiento y RNF:** Definir al menos tres requisitos no funcionales (rendimiento/latencias, usabilidad móvil, fiabilidad) con límites cuantitativos concretos.
5. **Sección de Riesgos y Mitigaciones:** El PRD debe incluir obligatoriamente una sección con tabla de riesgos de producto (técnicos, legales, de coste) y sus planes de mitigación correspondientes.
6. **Control de Versiones y Change Log:** El encabezado del PRD debe incluir una tabla de control de cambios con fecha, versión semántica, autor y resumen de modificaciones.
7. **Alcance Excluido:** Definir de manera explícita qué características quedan fuera del alcance (Out of Scope) con justificación estratégica y mapeo a roadmap futuro.
8. **Plataforma y Permisos Móviles:** El PRD debe detallar los flujos de solicitud de permisos sensibles (cámara, ubicación) en contexto seguro HTTPS y proponer alternativas/fallbacks claros si son rechazados.
9. **Persistencia e Importación JSON:** El PRD debe detallar la estrategia de almacenamiento local sin cuenta (LocalStorage, IndexedDB) y especificar la estructura de exportación/importación JSON (control de versión de esquema y validaciones).
10. **Cumplimiento Legal (GDPR/RGPD):** Analizar explícitamente el tratamiento de datos seudonimizados vs anonimizados, detallar la minimización de datos y el consentimiento separado y revocable para fines secundarios (analíticas comerciales).
11. **Análisis de Costes de Procesamiento (OCR):** Incluir una tabla comparativa de opciones tecnológicas para la extracción (heurísticas locales vs APIs en la nube vs LLM multimodales por tokens) detallando costes, precisión y latencia.
12. **Flujos UX Detallados:** El PRD debe detallar secuencialmente (paso a paso numerado) al menos 3 flujos clave de usuario, incluyendo Happy Paths y caminos de corrección/recuperación.
13. **Métricas y Funnel de Éxito:** Organizar las métricas de éxito en North Star, Activación, Calidad (corrección de OCR) y Retención temprana.
14. **Roadmap por Fases:** Describir un roadmap de desarrollo incremental de al menos 4 fases (Validación, Retención, Cuenta opcional, Premium/SaaS).
15. **Decisiones Abiertas:** Incluir una tabla de decisiones abiertas de producto y técnicas con opciones e impacto.
16. **Criterios de Aceptación del MVP:** Definir de forma explícita y medible qué constituye un MVP completo y listo para validación.
17. **Procedimiento de Autoverificación - Check de Placeholders:** Buscar cadenas de texto del tipo "TBD", "completar" o texto genérico en todo el archivo.
18. **Procedimiento de Autoverificación - Verificación SMART:** Asegurar que cada KPI y RNF tiene un número/porcentaje y una ventana temporal de medición.
19. **Procedimiento de Autoverificación - Trazabilidad Personas:** Confirmar que no hay funcionalidades sin un usuario/JTBD de destino claro.
20. **Procedimiento de Autoverificación - Cumplimiento GDPR:** Verificar que el documento distingue claramente entre datos seudonimizados y anonimizados y define flujos de consentimiento separado.
21. **Procedimiento de Autoverificación - Estilo Markdown:** Asegurar que no hay errores sintácticos de marcado que rompan el parseo de encabezados.
22. **Límite de Seguridad:** Máximo 3 intentos de autoverificación y auto-corrección. Si tras 3 intentos no se cumplen las condiciones, detener la ejecución y escalar la alerta.

---

[STEPS]

### Solo Mode (Interactivo / Usuario)
1. Leer el brief del usuario y validar longitud/contenido.
2. Iterar sobre cada sección del PRD (Vision & Product Summary, Target Users & Market Context, MVP Scope & Constraints, RF/RNF, Core UX Flows, Platform & Storage, Business Model & Tech Tradeoffs, Legal & GDPR, Risks & Assumptions, Metrics, Roadmap, Project Management).
3. Cargar el template `assets/prd-template.md` para cada sección.
4. Validar cada sección usando las reglas en `references/validation-rules.md`.
5. Presentar la sección al usuario en su idioma y esperar aprobación/modificación/rechazo.
6. Una vez aprobadas todas las secciones, ensamblar el PRD final en `docs/prd/PRD.md`.

### Orchestrated Mode (Coordinado / SDD Pipeline)
1. Leer el path de referencia del brief desde el contrato.
2. Generar el documento completo de PRD aplicando las reglas de validación en `references/validation-rules.md` sin pausas si está pre-aprobado.
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
