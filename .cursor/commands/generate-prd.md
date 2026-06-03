---
name: /generate-prd
id: generate-prd
category: Documentation
description: Genera un PRD completo en español (Lean Canvas, casos de uso, modelo de datos, diseño, C4). Requiere bloque Context obligatorio.
---

Genera un **Product Requirements Document (PRD)** siguiendo la skill del proyecto **`generate-prd`**.

---

## Parámetro obligatorio: Context

**No generar el PRD sin un bloque `Context` aportado por el usuario** en el mismo mensaje (o pegado tras el comando).

El Context debe describir al menos: **qué producto**, **para qué**, **restricciones / alcance** y **audiencia o problema**. Puede incluir UI, tecnología del repo, capturas (`@ruta`) y ruta de salida del markdown.

### Ejemplo de invocación

```markdown
/generate-prd

## Context

ConRutina será una aplicación web para calendarios semanales de hábitos con gamificación…
[resto de visión, principios, UI, stack, etc.]

## Goal (opcional)

Escribir el PRD en `./docs/ConRutina-PRD.md`.
```

Si Context falta o está vacío: **pedir solo el bloque Context** (ver skill `.cursor/skills/generate-prd/SKILL.md`) y no crear el archivo hasta tenerlo.

---

## Pasos para el agente

1. Leer la skill **[`.cursor/skills/generate-prd/SKILL.md`](../skills/generate-prd/SKILL.md)** y aplicarla.
2. Comprobar que existe **Context** válido; si no → parar y solicitarlo.
3. Generar el PRD completo; consultar **[`reference-prd-structure.md`](../skills/generate-prd/reference-prd-structure.md)** si hace falta detalle de secciones.
4. Guardar el markdown en la ruta indicada en Context/Goal o por defecto `./docs/<Producto>-PRD.md`.
