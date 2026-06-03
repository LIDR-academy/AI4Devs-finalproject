---
name: /opsx-propose-ticket
id: opsx-propose-ticket
category: Workflow
description: Crea un change OpenSpec completo a partir de un ticket T-XX-YY del product backlog
---

Crea un **change OpenSpec** (proposal, specs, design, tasks) a partir de un ticket de desarrollo en `docs/product-backlog.md`.

**Input:** ID del ticket `T-[US]-[SEQ]` (p. ej. `T-01-01`). Opcionalmente un nombre corto en kebab-case para el change.

---

## Pasos para el agente

1. Leer y aplicar la skill **[`.cursor/skills/propose-from-ticket/SKILL.md`](../skills/propose-from-ticket/SKILL.md)** completa.
2. Leer también **`openspec/config.yaml`** y la skill **`openspec-propose`** si hace falta el detalle del CLI.
3. Ejecutar el flujo: extraer ticket + US → `openspec new change` → generar artefactos en orden → verificar.
4. Confirmar al usuario: change name, rama `feature/T-XX-YY-...`, y siguiente paso `/opsx:apply <change-name>`.

---

## Ejemplos

```
/opsx-propose-ticket T-01-01
```

```
/opsx-propose-ticket T-13-01 habit-domain-types
```

---

## Flujo completo (referencia)

| Fase | Comando |
|------|---------|
| Especificar desde ticket | `/opsx-propose-ticket T-XX-YY` |
| Implementar | `/opsx:apply t-xx-yy-nombre` |
| Archivar | `/opsx:archive t-xx-yy-nombre` |

Procesar **un ticket a la vez**, en orden de sprint según `docs/product-backlog.md`.
