---
name: 2-user-stories
description: Genera historias de usuario a partir del PRD del proyecto. Crea un archivo .md por cada HU en docs/user-stories/. Usar cuando el PRD ya existe y se quiere descomponer en HUs listas para desarrollo.
---

# Skill: Generación de Historias de Usuario

Genera historias de usuario (HU) a partir del PRD del proyecto y las guarda como archivos Markdown individuales en `docs/user-stories/`.

## Cuándo usar esta skill

Cuando ya existe un PRD en `docs/` y se quiere descomponer el producto en HUs concretas y accionables, listas para ser priorizadas o implementadas.

---

## Protocolo de ejecución

Delegar al subagente `product-manager` via la herramienta `Agent`. El subagente lee el PRD, genera las HUs y las persiste en disco. No ejecutes este protocolo vos mismo.

```
Agent({
  subagent_type: "product-manager",
  prompt: "<contexto del proyecto + PRD + instrucciones de esta skill>"
})
```

Pasale al agente:
1. El contenido del PRD encontrado en `docs/`
2. El contenido del CLAUDE.md del proyecto
3. Las instrucciones completas de las fases 1, 2 y 3 de esta skill

---

## Fase 1 — Leer el PRD

Buscá el PRD en `docs/PRD-*.md`. Si hay más de uno, preguntale al usuario cuál usar antes de continuar.

---

## Fase 2 — Generar las historias de usuario

Para cada funcionalidad clave del PRD, generá una HU siguiendo estas reglas:

**Formato de cada HU:**

```markdown
# HU-[NNN] — [Título corto]

## Historia
Como [rol de usuario],
quiero [acción o capacidad],
para [beneficio o resultado esperado].

## Criterios de aceptación
- [ ] [Criterio verificable 1]
- [ ] [Criterio verificable 2]
- [ ] [Criterio verificable N]

## Notas técnicas
[Restricciones, dependencias o contexto técnico relevante. Omitir si no hay nada que aclarar.]

## Prioridad
[Alta / Media / Baja]

## Estimación
[Usar escala Fibonacci: 01 - Muy Pequeño (1.5h) | 02 - Pequeño (3h) | 03 - Mediano (6h) | 05 - Grande (11h) | 08 - Muy Grande (17h) | 13 - Gigante (26h) | 21 - Extraordinario (40h)]
```

**Reglas para generar HUs:**
- Una HU por funcionalidad clave del MVP. No agrupes funcionalidades distintas en una sola HU.
- Los criterios de aceptación deben ser verificables y específicos, no vagos.
- El rol debe coincidir con los usuarios definidos en el PRD.
- La prioridad se asigna según impacto en el objetivo del MVP.
- La estimación es relativa entre HUs del mismo proyecto (no horas).
- Numerá las HUs secuencialmente: HU-001, HU-002, etc.

---

## Fase 3 — Persistir en disco

- Creá la carpeta `docs/user-stories/` si no existe.
- Guardá cada HU en un archivo separado: `docs/user-stories/HU-[NNN]-[titulo-kebab-case].md`
- Al finalizar, mostrá un resumen con la lista de HUs generadas, su título y prioridad.

---

## Reglas de conducta

- No generes HUs sin haber leído el PRD primero.
- Si el PRD tiene supuestos marcados explícitamente, reflejalos como notas técnicas en las HUs afectadas.
- No inventes funcionalidades que no estén en el PRD.
- Si una funcionalidad del PRD es ambigua, preferí una HU más pequeña y acotada antes que una grande y vaga.
- Hablá en español.
