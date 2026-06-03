---
name: generate-prd
description: >-
  Genera un PRD (Product Requirements Document) en español con Lean Canvas, casos de uso,
  modelo de datos, diseño de sistema y diagramas C4 en Mermaid. Requiere que el usuario
  proporcione obligatoriamente un bloque Context con la visión y restricciones del producto.
  Usar cuando el usuario pida generar un PRD, documento de requisitos de producto,
  especificación de producto tipo Lean Canvas, o invoque la skill generate-prd o /generate-prd.
---

# generate-prd — Generación de PRD

## Parámetro obligatorio: Context

**Sin un bloque `Context` explícito no se genera el PRD.** El usuario debe aportarlo en el mismo mensaje o en el argumento del comando.

### Qué cuenta como Context válido

Debe existir una sección claramente delimitada (por ejemplo `# Context`, `## Context`, o el texto entre etiquetas `# PROMPT: ... # Context ...`) que incluya **como mínimo**:

- Descripción del producto o idea (qué es y para qué sirve).
- Restricciones o alcance relevantes (MVP, plataformas, normativa, etc.).
- Público o problema a resolver (aunque sea breve).

Opcional pero recomendable en Context: principios de negocio/reglas, UI esperada, stack o arquitectura del repo, capturas o referencias (`@archivos`), y **Goal** / ruta de salida si el usuario la define ahí.

### Si falta Context

1. **No** escribas el archivo PRD.
2. Responde en español pidiendo únicamente el bloque faltante, con este esqueleto sugerido:

```markdown
## Context

- **Producto:** …
- **Objetivo / problema:** …
- **Audiencia:** …
- **Restricciones (MVP, plataforma, compliance):** …
- **Tecnología / repo (si aplica):** …
- **Referencias:** …
```

3. Tras recibir Context, continúa con el flujo de generación.

---

## Rol y metodología (aplicar al redactar)

Actuar como **product manager** experimentado: análisis de ideas, casos de uso estructurados, perfiles de usuario, propuesta de valor (Jobs-to-be-Done, beneficios vs. características), riesgos y mitigación, enfoque MVP para validar supuestos, escalabilidad y modelo de negocio cuando encaje.

Equilibrio **optimista y realista**. Si falta información crítica **además** de Context, hacer **preguntas concretas** antes de asumir hechos de negocio o legales.

---

## Idioma y diagramas

- Todo el PRD en **español**.
- Todos los diagramas en **Mermaid** (Lean Canvas puede ser tabla markdown o diagrama; ER, C4, casos de uso, secuencias: Mermaid).

---

## Artefactos a entregar (en el documento)

1. Breve descripción del software, valor añadido y ventajas competitivas.
2. Funciones principales.
3. **Lean Canvas** con un **resumen narrativo breve al inicio de cada bloque** (problema, solución, propuesta de valor única, ventaja injusta, segmentos, canales, métricas clave, costes, ingresos).
4. Casos de uso principales: para cada uno — escenario, problema, cómo lo resuelve el producto, resultado esperado; y **diagrama de casos de uso** (y diagramas de secuencia o actividad Mermaid donde aporte claridad).
5. **Modelo de datos:** entidades con atributos (nombre y tipo), relaciones, **diagrama ER** Mermaid, tabla **Relationships (summary)** con columnas: From | To | Cardinality | Description.
6. **API (Alto-Nivel)** que liste los posibles EndPoints e incluya una tabla de recursos y operaciones alineada con el modelo. 
7. **Diseño de sistema** a alto nivel: texto + diagrama Mermaid.
8. **Diagramas C4** en **cuatro niveles** (contexto, contenedores, componentes, código), cada uno con una **breve descripción del Goal** de esa vista (qué muestra y para qué sirve).
9. **Out of Scope / Non-Goals** listando los aspectos o funcionalidades que quedan fuera del MVP.

Detalle de secciones y recordatorios: [reference-prd-structure.md](reference-prd-structure.md).

---

## Salida en archivo

- Por defecto: `./docs/prd.md`.
- Si el usuario indica otra ruta o nombre en Context o Goal, respetarla.
- Markdown legible: encabezados, tablas, bloques de código para diagramas y tablas de relaciones.

---

## Flujo de trabajo recomendado (agente)

1. Verificar **Context obligatorio** (arriba). Si no hay → pedirlo y parar.
2. Revisar el repositorio si Context menciona stack o rutas (`docs/`, `frontend/`, `backend/`) para alinear tecnología y arquitectura descrita.
3. Generar el PRD completo según artefactos y [reference-prd-structure.md](reference-prd-structure.md).
4. Escribir el fichero en la ruta acordada y confirmar la ruta al usuario.

---

## Invocación

- Mensaje natural: "Genera el PRD con la skill generate-prd" + bloque **Context** completo.
- Comando del proyecto: ver [.cursor/commands/generate-prd.md](../../commands/generate-prd.md) (`/generate-prd`).
