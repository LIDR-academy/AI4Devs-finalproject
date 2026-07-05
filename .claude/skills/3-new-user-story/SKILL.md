---
name: 3-new-user-story
description: Crea una nueva historia de usuario para un proyecto en marcha. Valida si encaja en el PRD existente, actualiza el PRD si el requerimiento amplía el scope (con confirmación del usuario), y genera el archivo HU-NNN en docs/user-stories/. Usar cuando el proyecto ya tiene PRD y HUs previas.
---

# Skill: Nueva Historia de Usuario

Agrega una HU individual a un proyecto en marcha. No relanza el discovery — asume que el PRD ya existe y el proyecto tiene contexto acumulado.

## Cuándo usar esta skill

Cuando llega un nuevo requerimiento durante el desarrollo: del PO, de un usuario, de una retrospectiva, o de una decisión técnica que genera trabajo de producto.

---

## Protocolo de ejecución

Delegar al subagente `product-manager` via la herramienta `Agent`. Pasale:
1. El contenido del PRD (`docs/PRD-*.md`)
2. La lista de HUs existentes (`docs/user-stories/`)
3. La descripción del nuevo requerimiento dada por el usuario
4. Las instrucciones completas de las fases 1, 2 y 3 de esta skill

---

## Fase 1 — Leer contexto existente

Antes de hacer cualquier pregunta:
- Leer el PRD en `docs/PRD-*.md`
- Listar las HUs existentes en `docs/user-stories/` para determinar el próximo número correlativo
- Si no existe PRD, detener y decirle al usuario que primero debe correr `/1-project-discovery`

---

## Fase 2 — Entender el nuevo requerimiento

**REGLA CRÍTICA: Hacé UNA SOLA pregunta por turno. Esperá la respuesta antes de continuar.**

Si el usuario ya describió el requerimiento con suficiente detalle, saltá las preguntas que ya están respondidas.

Preguntas en orden (solo las necesarias):

1. ¿Qué necesita poder hacer el usuario que hoy no puede?
2. ¿Quién lo pidió y por qué ahora?
3. ¿Hay criterios claros para saber cuándo está lista?

Luego, antes de escribir la HU, hacé esta validación explícita:

**¿Encaja en el PRD existente?**

- Si encaja → continuá a la Fase 3 sin avisar nada especial
- Si amplía el scope → avisale al usuario: *"Este requerimiento amplía el scope del PRD. Voy a actualizar el PRD y luego crear la HU. ¿Confirmás?"* — si confirma, ejecutá la Fase 2b antes de continuar a la Fase 3
- Si contradice algo del PRD → avisale: *"Este requerimiento contradice [sección del PRD]. Necesitamos resolver eso antes de crear la HU."* — no continúes hasta resolverlo

---

## Fase 2b — Actualizar el PRD (solo si el requerimiento amplía el scope)

Con la confirmación del usuario, actualizá el archivo `docs/PRD-*.md`:

1. Agregá la nueva funcionalidad en la sección **Funcionalidades clave (MVP)** con su justificación
2. Si el requerimiento introduce nuevos supuestos, agregarlos en **Supuestos**
3. Si introduce nuevos riesgos, agregarlos en **Riesgos**
4. No toques ninguna otra sección del PRD salvo que sea estrictamente necesario

Después de actualizar el PRD, continuá a la Fase 3.

---

## Fase 3 — Crear la HU

Determiná el próximo número correlativo leyendo los archivos existentes en `docs/user-stories/`.

Formato obligatorio:

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

Guardá el archivo en: `docs/user-stories/HU-[NNN]-[titulo-kebab-case].md`

Confirmá al usuario con: número de HU creada, título, archivo generado, y si se actualizó el PRD (indicar qué secciones cambiaron).

---

## Reglas de conducta

- No crear la HU si contradice el PRD sin confirmación explícita del usuario.
- No renumerar HUs existentes bajo ninguna circunstancia.
- Si el usuario da el requerimiento completo desde el principio, no hacer preguntas innecesarias.
- La estimación es relativa al conjunto de HUs existentes — no en horas.
- Hablá en español.
