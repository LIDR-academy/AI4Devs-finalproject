# Skill: Project Discovery — PRD

Guía al usuario para elaborar un PRD (Product Requirements Document) completo y accionable mediante preguntas estructuradas y síntesis progresiva.

## Cuándo usar esta skill

Cuando el usuario quiere definir qué construir antes de diseñar o implementar: proyectos nuevos, features grandes, o iniciativas sin spec clara.

---

## Protocolo de ejecución

Esta skill se ejecuta delegando a una sesión nueva del subagente `product-manager` mediante la herramienta `Agent`. El subagente conduce todo el proceso de descubrimiento y genera el PRD final. No ejecutes este protocolo tú mismo — lanza el agente con el contexto necesario.

**Cómo lanzar el agente:**
```
Agent({
  subagent_type: "product-manager",
  prompt: "<contexto del proyecto + instrucciones de esta skill>"
})
```

Pásale al agente como prompt:
1. El contenido relevante del CLAUDE.md del proyecto
2. Cualquier contexto que el usuario haya dado en la conversación actual
3. Las instrucciones completas de las fases 1, 2 y 3 de esta skill

---

### Fase 1 — Contexto inicial

Antes de hacer preguntas, revisa lo que ya existe:
- Archivos en `openspec/` o documentos de contexto abiertos
- CLAUDE.md del proyecto
- Conversación actual

Para cada pregunta de la Fase 2, si el contexto ya la responde con claridad, no la repitas: márcala como inferida y sigue con la siguiente.

---

### Fase 2 — Preguntas de descubrimiento

**REGLA CRÍTICA: Haz UNA SOLA pregunta por turno. Espera la respuesta antes de hacer la siguiente. Nunca hagas dos preguntas en el mismo mensaje.**

**Pregunta de bifurcación (siempre primero, antes del bloque esencial):**

0. ¿Este PRD define una primera versión/MVP que luego se va a iterar, o el alcance completo de un producto?

La respuesta determina cómo se formulan la pregunta 5 y la sección "Funcionalidades clave" del PRD (ver Fase 3):
- **MVP / primera iteración**: se corta alcance a propósito; lo que queda afuera es candidato a versiones futuras.
- **Producto completo**: no hay corte de alcance por versión; las funcionalidades se organizan por prioridad (imprescindible / importante / deseable), no por MVP.

Si el contexto ya deja claro cuál de los dos es, no la repitas: márcala como inferida.

Las preguntas del resto de la fase están agrupadas en tres bloques según su criticidad. No es un checklist fijo: el número real de preguntas depende del proyecto — a veces bastan 4, a veces hacen falta las 15.

**Bloque esencial (obligatorio — sin esto no se puede sintetizar el PRD):**
1. ¿Qué problema concreto resuelve esto? ¿A quién le duele hoy?
2. ¿Qué evidencia hay de que este problema es real? (datos, tickets, entrevistas, frecuencia)
3. ¿Qué pasa si no se construye? ¿Cuál es el costo de no hacer nada?
4. ¿Cuál es el resultado concreto que el usuario debe poder lograr con esto?
5. Según la respuesta a la pregunta de bifurcación:
   - Si es MVP: ¿Qué debe estar sí o sí en la primera versión?
   - Si es producto completo: ¿Cuáles son todas las funcionalidades clave que debe tener el producto, y cuál es la prioridad relativa de cada una (imprescindible / importante / deseable)?

**Bloque importante (pregunta salvo que el contexto ya lo deje claro):**
6. ¿Quiénes son los usuarios principales? ¿Tienen roles distintos?
7. ¿Cómo se mide el éxito desde el punto de vista del usuario?
8. ¿Cómo se mide el éxito desde el punto de vista del negocio? (revenue, retención, costo evitado, adopción, etc.)
9. Según la respuesta a la pregunta de bifurcación:
   - Si es MVP: ¿Qué queda explícitamente fuera de esta primera versión (pero podría entrar después)?
   - Si es producto completo: ¿Qué queda explícitamente fuera del producto (no se va a construir, ni ahora ni después)?

**Bloque contextual (opcional — pregunta solo lo que aplique al proyecto; lo que no aplique se marca como supuesto y se sigue):**
10. ¿Hay soluciones actuales (manuales o sistemas)? ¿Por qué no alcanzan?
11. ¿Hay integraciones o dependencias con otros sistemas?
12. ¿Hay restricciones técnicas conocidas (plataforma, seguridad, rendimiento)?
13. ¿Hay fecha límite o hito relevante?
14. ¿Quién toma las decisiones de producto en este proyecto?
15. ¿Quién podría resistirse al cambio o qué fricción de adopción es esperable?

Antes de pasar a la Fase 3, confirma que el bloque esencial y el bloque importante están cubiertos (respondidos o inferidos con claridad del contexto). El bloque contextual puede quedar parcialmente sin cubrir si no aplica o el usuario prefiere avanzar.

---

### Fase 3 — Síntesis del PRD

Con las respuestas obtenidas, genera el PRD y guárdalo en `docs/PRD-[nombre-kebab-case].md`. Crea la carpeta `docs/` si no existe. Omitir secciones sin información es válido — mejor un PRD corto y honesto que uno relleno.

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

## Funcionalidades clave
[Si es MVP, titular "Funcionalidades clave (MVP)" y listar solo lo que va en la primera versión. Si es producto completo, titular "Funcionalidades clave (por prioridad)" y agrupar en Imprescindible / Importante / Deseable.]
1. [Funcionalidad]  — Por qué es esencial / prioridad asignada
2. ...

## Fuera de alcance
[Si es MVP: qué no se construye en esta versión y por qué, con nota de si es candidato a versión futura. Si es producto completo: qué no se construye nunca y por qué.]

## Métricas de éxito
- **Usuario**: [Cómo sabe el usuario que funcionó]
- **Negocio**: [Qué indicador de negocio se mueve — revenue, retención, costo evitado, adopción, etc.]

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

- No generes el PRD hasta tener respuestas (propias o inferidas del contexto) de todo el bloque esencial y el bloque importante.
- Si el usuario da contexto parcial, infiere lo razonable y marca los supuestos explícitamente.
- Prefiere claridad sobre completitud: un PRD corto y claro vale más que uno largo y vago.
- No propongas arquitectura técnica ni stacks — eso es rol del backend-expert o frontend-expert.
- Si detectas contradicciones en las respuestas, señálalas antes de sintetizar.
