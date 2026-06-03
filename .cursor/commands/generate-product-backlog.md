---
name: /generate-product-backlog
id: generate-product-backlog
category: Documentation
description: Genera docs/ConRutina-Product-Backlog.md desde el PRD y el código (US, MoSCoW, BDD, roadmap, tickets).
---

Genera el **Product Backlog** del proyecto **ConRutina** siguiendo la skill del proyecto **`generate-product-backlog`**.

---

## Entradas

- **PRD por defecto:** `docs/ConRutina-PRD.md`. Si el usuario adjunta otro fichero con `@`, usarlo como fuente de requisitos.
- **Código:** el agente debe revisar el repositorio actual (frontend, backend, prisma, infra) para el estado implementado / parcial / pendiente de cada historia.

**Salida:** `docs/ConRutina-Product-Backlog.md` (crear `docs/` si no existe), salvo que el usuario indique **explícitamente** otra ruta en el mismo mensaje.

---

## Pasos para el agente

1. Leer la skill **[`.cursor/skills/generate-product-backlog/SKILL.md`](../skills/generate-product-backlog/SKILL.md)** y aplicarla **completa** (no sustituir reglas por resúmenes).
2. Leer el PRD (`docs/ConRutina-PRD.md` o el indicado con `@`).
3. Explorar el código para alinear historias con la implementación real y detectar huecos del MVP.
4. Generar el markdown del backlog (User Stories, consistencia, backlog priorizado, matriz, roadmap Mermaid, tickets).
5. Escribir el fichero en la ruta de salida acordada y confirmar la ruta al usuario con un breve resumen ejecutivo.

---

## Ejemplo de invocación

```text
/generate-product-backlog
```

Opcional: citar el PRD si no es el de `docs/`:

```text
/generate-product-backlog

@docs/mi-borrador-PRD.md
```

Si no existe el PRD en la ruta esperada: **buscar** `ConRutina-PRD.md` en el repo o **preguntar una vez** por la ruta correcta antes de generar el archivo.
