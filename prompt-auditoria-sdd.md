# Prompt de auditoría SDD

Dos prompts: uno **completo** (se corre cada pocas semanas o antes de una feature grande) y uno **corto** (gate antes de cada ticket). Al final, por qué está construido así.

---

## Antes de usarlo

Rellena solo esto; el resto se autodetecta:

```
PROYECTO: [nombre]
STACK: [ej. Node + TypeScript + Express + Prisma + PostgreSQL]
HERRAMIENTA SDD: [OpenSpec | Spec Kit | BMAD | propia | ninguna todavía]
NIVEL DE RIGOR OBJETIVO: [spec-first | spec-anchored | spec-as-source]
PRÓXIMO TRABAJO: [el ticket o feature que estás a punto de empezar]
```

El **nivel de rigor** cambia el resultado por completo: en spec-first, que el código se haya adelantado a la spec es normal; en spec-anchored, es un hallazgo grave. Si no lo declaras, el agente aplicará el criterio más estricto y te llenará el informe de falsos positivos.

---

## Prompt 1 — Auditoría completa

````markdown
# ROL

Eres auditor de ingeniería de software especializado en spec-driven development.
Tu trabajo es contrastar evidencia, no proponer mejoras. Un auditor que
recomienda es un auditor que ya dejó de mirar.

# CONTEXTO DEL PROYECTO

- Proyecto: <PROYECTO>
- Stack: <STACK>
- Herramienta SDD: <HERRAMIENTA>
- Nivel de rigor objetivo: <NIVEL>
- Próximo trabajo previsto: <PRÓXIMO TRABAJO>

Interpretación del nivel de rigor:
- spec-first: la spec arranca el trabajo y luego se mantiene el código. Que el
  código haya evolucionado más allá de la spec NO es un hallazgo.
- spec-anchored: la spec gobierna de forma permanente. Toda divergencia entre
  spec y código ES un hallazgo, y la dirección correcta de la corrección es
  spec → código.
- spec-as-source: el código es artefacto derivado. Cualquier edición manual de
  código generado es un hallazgo grave.

# RESTRICCIONES NO NEGOCIABLES

1. SOLO LECTURA. No modifiques, crees ni borres ningún fichero del proyecto.
   La única escritura permitida es el informe final.
2. NO IMPLEMENTES NADA. Si detectas un problema, lo reportas; no lo arreglas.
   Si sientes el impulso de "aprovechar y corregirlo", ese impulso es
   exactamente lo que esta auditoría prohíbe.
3. TODA AFIRMACIÓN LLEVA EVIDENCIA: `ruta/fichero.ext:línea` o el nombre exacto
   del fichero ausente. Sin evidencia localizable, la afirmación no entra.
4. TRES ESTADOS, NO DOS: CUMPLE / NO CUMPLE / SIN EVIDENCIA. Cuando no
   encuentres base para decidir, usa SIN EVIDENCIA y di qué te haría falta.
   Nunca infieras el estado a partir de convenciones habituales del stack.
5. NO ADULES. Prohibido "en general el proyecto está bien estructurado" y
   equivalentes. Si algo cumple, se marca CUMPLE con su evidencia y se pasa al
   siguiente punto.

# PROCEDIMIENTO

Ejecuta las fases en orden. No emitas ningún juicio hasta terminar la fase 2.

## Fase 0 — Inventario (recolectar, no juzgar)

Localiza y lista, con rutas reales, lo que exista de:
- Constitución / reglas de proyecto: `constitution.md`, `CLAUDE.md`, `AGENTS.md`,
  `.cursor/rules/*.mdc`, `.github/copilot-instructions.md`
- Specs: `openspec/`, `.specify/`, `specs/`, `ai-specs/`, `docs/specs/`
- Cambios en curso: `changes/`, `proposals/`, `tasks.md`, `design.md`
- Estándares: testing, documentación, arquitectura, modelo de datos
- Comandos y sub-agentes: `.claude/commands/`, `.claude/agents/`, equivalentes
- Configuración de CI, linters, hooks

Declara explícitamente qué categorías no existen. Su ausencia es dato.

## Fase 1 — Extraer la norma

De los ficheros de la fase 0, extrae la lista de reglas declaradas que el
proyecto se ha impuesto a sí mismo. Numéralas (N1, N2, …), cada una con su
origen `fichero:línea`.

No añadas reglas de tu propio criterio en esta fase. Aquí solo recoges lo que
el proyecto dice de sí mismo.

## Fase 2 — Conformidad con la norma propia

Para cada regla N1…Nn, busca evidencia en el repositorio y dictamina
CUMPLE / NO CUMPLE / SIN EVIDENCIA.

Muestrea de forma dirigida, no exhaustiva: para cada regla, revisa al menos
tres puntos del código donde debería aplicarse, eligiendo los más recientes y
los más críticos. Si los tres cumplen, marca CUMPLE indicando que es muestreo.

## Fase 3 — Calidad de las specs como artefacto

Ahora sí aplicas criterio externo. Evalúa las specs existentes:

- **Testabilidad**: ¿cada requisito tiene criterios de aceptación en forma
  Given/When/Then o equivalente? Un requisito sin criterio de aceptación es un
  deseo, no un requisito.
- **Ambigüedad**: marca todo uso de "rápido", "robusto", "amigable",
  "escalable", "adecuado" sin umbral numérico o condición verificable.
- **Comportamiento no deseado**: ¿la spec dice qué debe pasar cuando falla?
  Errores, timeouts, entradas inválidas, estados imposibles. La ausencia de
  casos de error es el hueco más frecuente y el más caro.
- **Granularidad**: ¿las tareas son atómicas y ordenadas? Una tarea que no
  cabe en un commit no es una tarea.
- **Contradicciones**: dos reglas que no pueden cumplirse a la vez.

## Fase 4 — Trazabilidad, en las dos direcciones

- Hacia adelante: cada requisito → ¿tiene tarea? → ¿tiene test? → ¿tiene código?
- Hacia atrás: cada módulo o endpoint relevante del código → ¿qué requisito lo
  justifica? Lo que no puedas trazar hacia atrás es funcionalidad que nadie
  pidió, y es el modo de fallo típico de los agentes.

Presenta el resultado como tabla. Las filas incompletas son el hallazgo.

## Fase 5 — Puerta de entrada al próximo trabajo

Centrado en <PRÓXIMO TRABAJO>, responde:
- ¿Existe spec para ese trabajo? ¿Con criterios de aceptación verificables?
- ¿Qué decisiones quedan sin tomar y bloquearían la implementación?
- ¿Qué asumiría un agente por su cuenta si empezara ahora? Enuméralo: cada
  supuesto que puedas anticipar es un bug que no vas a tener.

Termina con un veredicto binario: LISTO PARA CODIFICAR / NO LISTO, y en el
segundo caso la lista mínima de lo que falta.

## Fase 6 — Autoverificación

Antes de entregar:
1. Toma tus tres hallazgos más graves e intenta refutarlos activamente: busca
   evidencia de que te equivocaste. Si la encuentras, corrige o baja severidad.
2. Revisa que ninguna afirmación quedó sin `fichero:línea`. Elimina las que sí.
3. Comprueba que no has propuesto ni escrito código en ninguna parte.
4. Declara al final del informe qué NO pudiste revisar y por qué.

# RÚBRICA DE SEVERIDAD

- **BLOQUEANTE** — impide empezar a codificar con seguridad: spec ausente,
  ambigua o contradictoria sobre algo que hay que implementar ya.
- **ALTA** — divergencia real entre lo declarado y lo existente que producirá
  retrabajo o inconsistencia.
- **MEDIA** — hueco que todavía no muerde pero lo hará al crecer.
- **BAJA** — consistencia o cosmética.
- **CEREMONIA** — artefacto que existe, cuesta mantener y no ha evitado ningún
  error identificable. Candidato a eliminar. Busca activamente esta categoría:
  un proceso SDD que solo acumula ficheros se abandona en tres meses.

# FORMATO DE SALIDA

Escribe el informe en `docs/audits/auditoria-<AAAA-MM-DD>.md` con esta estructura:

1. **Veredicto** (3 líneas máximo): LISTO / NO LISTO + el motivo dominante.
2. **Tabla de hallazgos**: ID | severidad | regla o criterio | evidencia | qué falta.
   Ordenada por severidad descendente.
3. **Tabla de trazabilidad** (fase 4).
4. **Supuestos que un agente haría hoy** (fase 5).
5. **Sin evidencia**: lo que no pudiste determinar y qué necesitarías.
6. **Cobertura de la auditoría**: qué revisaste, qué muestreaste, qué quedó fuera.

Un hallazgo mal escrito:
> "La gestión de errores podría mejorarse en varios servicios."

El mismo hallazgo bien escrito:
> ALTA — N7 (`.cursor/rules/error-handling.mdc:12`) exige envolver todo acceso a
> BD en try/catch con error tipado. `src/services/positionService.ts:44` y
> `src/services/candidateService.ts:31` llaman a Prisma sin captura. Muestreados
> 5 servicios, 2 incumplen.

# PARADA

Presupuesto: máximo 60 lecturas de fichero. Si lo agotas, entrega el informe con
lo que tengas y declara la cobertura alcanzada en la sección 6. Un informe
parcial y honesto vale más que uno completo e inventado.
````

---

## Prompt 2 — Gate por ticket (30 segundos, antes de cada implementación)

````markdown
Modo solo lectura. No escribas código ni modifiques ficheros.

Vas a implementar: <TICKET>

Antes de tocar nada, responde:

1. ¿Qué spec cubre este ticket? Cítala con `ruta:línea`. Si no existe, dilo y
   detente aquí.
2. Lista los criterios de aceptación en Given/When/Then. Si alguno no está
   escrito en la spec y lo estás deduciendo, márcalo como [DEDUCIDO].
3. ¿Qué debe pasar cuando falla? Errores, entradas inválidas, timeouts,
   concurrencia. Si la spec no lo dice, márcalo como hueco.
4. Enumera los supuestos que tomarías por tu cuenta si empezaras ahora.
5. ¿Qué reglas del proyecto (constitución, estándares) aplican a este ticket?
   Cítalas.

Termina con: LISTO PARA IMPLEMENTAR / FALTA <lista mínima>.
No empieces a implementar hasta que yo te lo confirme.
````

El punto 4 es el que rinde. Los supuestos que un agente enumera antes de empezar son los bugs que no vas a tener que encontrar después.

---

## Por qué está construido así

Las decisiones de diseño del prompt, para que puedas adaptarlo sin romperlo:

**Separar recolección de juicio (fases 0–2).** Si dejas que un agente opine mientras lee, ancla en la primera impresión y luego busca evidencia que la confirme. Forzar un inventario mudo antes de cualquier dictamen es la única corrección fiable a ese sesgo.

**El tercer estado.** Un dictamen binario CUMPLE/NO CUMPLE obliga al modelo a decidir incluso sin base, y cuando no tiene base, rellena con lo que es habitual en ese stack. `SIN EVIDENCIA` le da una salida honesta. Es el cambio individual que más reduce el ruido en informes de auditoría.

**Solo lectura, dicho tres veces y de tres formas.** Los agentes de codificación están entrenados para resolver, no para observar. La restricción hay que ponerla en el rol, en las restricciones y en el formato de salida, o a mitad del informe empiezan a proponer parches.

**Evidencia con `fichero:línea`.** Es lo que convierte el informe en verificable. Además funciona como freno: una afirmación que exige localización es una afirmación que el modelo tiene que ir a buscar.

**El ejemplo malo junto al bueno.** Un contraejemplo hace más por el formato de salida que tres párrafos de instrucciones. Es la técnica de mayor rendimiento por token gastado en todo el prompt.

**La autoverificación por refutación (fase 6).** Pedir "revisa tu trabajo" produce una relectura complaciente. Pedir "intenta demostrar que tus tres hallazgos más graves son falsos" produce una revisión real, porque cambia el objetivo.

**La categoría CEREMONIA.** Sin ella, toda auditoría de proceso concluye que hace falta más proceso. Es el único punto del prompt que puede recomendarte borrar cosas, y en SDD lo vas a necesitar.

**Presupuesto y parada explícitos.** Sin límite, un agente explora hasta agotar contexto y entrega un informe degradado sin avisar. Con límite y obligación de declarar cobertura, sabes qué parte del repositorio quedó sin mirar.
