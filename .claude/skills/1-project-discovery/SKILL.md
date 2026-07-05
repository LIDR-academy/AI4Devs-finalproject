# Skill: Project Discovery — PRD

Guía al usuario para elaborar un PRD (Product Requirements Document) completo y accionable mediante preguntas estructuradas y síntesis progresiva.

## Cuándo usar esta skill

Cuando el usuario quiere definir qué construir antes de diseñar o implementar: proyectos nuevos, features grandes, o iniciativas sin spec clara.

---

## Protocolo de ejecución

Esta skill se ejecuta delegando a una sesión nueva del subagente `product-manager` via la herramienta `Agent`. El subagente conduce todo el proceso de descubrimiento y genera el PRD final. No ejecutes este protocolo tú mismo — lanzá el agente con el contexto necesario.

**Cómo lanzar el agente:**
```
Agent({
  subagent_type: "product-manager",
  prompt: "<contexto del proyecto + instrucciones de esta skill>"
})
```

Pasale al agente como prompt:
1. El contenido relevante del CLAUDE.md del proyecto
2. Cualquier contexto que el usuario haya dado en la conversación actual
3. Las instrucciones completas de las fases 1, 2 y 3 de esta skill

---

### Fase 1 — Contexto inicial

Antes de hacer preguntas, revisá lo que ya existe:
- Archivos en `openspec/` o documentos de contexto abiertos
- CLAUDE.md del proyecto
- Conversación actual

Si ya hay contexto suficiente, saltá directamente a las preguntas que faltan.

---

### Fase 2 — Preguntas de descubrimiento

**REGLA CRÍTICA: Hacé UNA SOLA pregunta por turno. Esperá la respuesta antes de hacer la siguiente. Nunca hagas dos preguntas en el mismo mensaje.**

Orden de preguntas:

1. ¿Qué problema concreto resuelve esto? ¿A quién le duele hoy?
2. ¿Qué pasa si no se construye? ¿Cuál es el costo de no hacer nada?
3. ¿Hay soluciones actuales (manuales o sistemas)? ¿Por qué no alcanzan?
4. ¿Quiénes son los usuarios principales? ¿Tienen roles distintos?
5. ¿Cuál es el resultado concreto que el usuario debe poder lograr con esto?
6. ¿Cómo se mide el éxito desde el punto de vista del usuario?
7. ¿Qué debe estar sí o sí en la primera versión?
8. ¿Qué está explícitamente fuera del alcance?
9. ¿Hay integraciones o dependencias con otros sistemas?
10. ¿Hay restricciones técnicas conocidas (plataforma, seguridad, rendimiento)?
11. ¿Hay fecha límite o hito relevante?
12. ¿Quién toma las decisiones de producto en este proyecto?

---

### Fase 3 — Síntesis del PRD

Con las respuestas obtenidas, generá el PRD y guardalo en `docs/PRD-[nombre-kebab-case].md`. Creá la carpeta `docs/` si no existe. Omitir secciones sin información es válido — mejor un PRD corto y honesto que uno relleno.

```markdown
# PRD — [Nombre del producto o feature]

## Problema
[Qué duele, a quién, por qué importa ahora]

## Objetivo
[Resultado concreto que se busca lograr]

## Usuarios
| Rol | Necesidad principal |
|-----|-------------------|
| ... | ...               |

## Funcionalidades clave (MVP)
1. [Funcionalidad]  — Por qué es esencial
2. ...

## Fuera de alcance
- [Qué no se construye en esta versión y por qué]

## Métricas de éxito
- [Cómo sabemos que funcionó]

## Restricciones
- [Técnicas, de tiempo, de equipo]

## Supuestos
- [Lo que se asume como verdadero sin confirmación]

## Riesgos
- [Qué puede salir mal y su impacto]

## Próximos pasos sugeridos
- [Qué sigue: OpenSpec change, diseño técnico, etc.]
```

---

## Reglas de conducta

- No generes el PRD hasta tener respuestas de al menos los bloques A y B.
- Si el usuario da contexto parcial, inferí lo razonable y marcá los supuestos explícitamente.
- Preferí claridad sobre completitud: un PRD corto y claro vale más que uno largo y vago.
- No propongas arquitectura técnica ni stacks — eso es rol del backend-expert o frontend-expert.
- Si detectás contradicciones en las respuestas, señalalas antes de sintetizar.

