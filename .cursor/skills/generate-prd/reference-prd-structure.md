# Referencia — Estructura del PRD (generate-prd)

Documento de apoyo para la skill `generate-prd`. No sustituye al bloque **Context** obligatorio del usuario.

## Esqueleto sugerido del documento generado

1. **Título y metadatos** — Nombre del producto, versión, fecha, estado (p. ej. MVP).
2. **Tabla de contenidos** — Enlaces a secciones principales.
3. **Descripción del software** — Propósito de la sección en blockquote; texto; tablas de propuesta de valor y ventajas competitivas si aplica.
4. **Funciones principales** — Agrupadas por área; propósito de la sección.
5. **Lean Canvas** — Tabla o representación visual + párrafo narrativo por bloque del canvas.
6. **Casos de uso** — Tabla resumen (ID, nombre, actor, prioridad); diagrama general; por cada caso: descripción estructurada + diagrama Mermaid (casos de uso, secuencia, actividad según convenga).
7. **Modelo de datos** — Lista de entidades/atributos/tipos; ER Mermaid; tabla Relationships (summary).
§7.1 — tabla índice de métodos y rutas.
8. **API (Alto-Nivel)** listado EndPoints. Incluye tabla de recursos y operaciones alineada con el modelo. 
9. **Diseño de sistema a alto nivel** — Principios, capas, flujos; diagrama Mermaid (flowchart u otro apropiado).
10. **Diagramas C4** — Cuatro subsecciones (C1–C4), cada una con:
   - **Goal:** qué muestra la vista y con qué propósito (obligatorio).
   - Diagrama Mermaid.
   - Si el visor no soporta `C4Context` / `C4Container`, incluir alternativa en `flowchart`.
11. **Out of Scope / Non-Goals** listado.

## Diagramas Mermaid — recordatorios

- Casos de uso: `graph` / `flowchart` con actores y casos; secuencias con `sequenceDiagram`.
- ER: `erDiagram` con entidades y relaciones.
- C4: si se usan primitivas C4 de Mermaid, añadir nota de compatibilidad; siempre ofrecer **alternativa flowchart** para entornos restrictivos.

## Calidad

- Cada sección larga puede empezar con un **blockquote** de una línea explicando el propósito de la sección (como en el PRD de referencia del proyecto).
- No inventar datos de mercado concretos sin Context; usar formulaciones condicionales o pedir aclaración.
