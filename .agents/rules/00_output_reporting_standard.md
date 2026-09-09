# 📜 Estándar Universal de Reporte de Salida (.agents/rules/00_output_reporting_standard.md)

Este documento define las plantillas ejecutivas universales de comunicación entre el subagente de IA y el desarrollador humano al finalizar cualquier tarea o Habilidad (`Skill`).

---

## 🅰️ Plantilla A: Para Habilidades de Desarrollo & Código (`development/`)

Cualquier subagente que complete una Skill de desarrollo (código, migraciones, refactorización o QA) DEBE estructurar su respuesta utilizando el siguiente formato Markdown:

```markdown
# 📊 [Nombre de la Habilidad / Skill] - Reporte de Ejecución

* **Módulo / Ticket Evaluado:** `{ticket_id}`
* **Estado de Ejecución:** [🟢 ÉXITO | 🟡 REQUIERE CONFIRMACIÓN HUMANA | 🔴 RECHAZADO CON DEFECTOS]

---

## 🛠️ 1. Resumen de Artefactos Creados / Modificados
- `[Ruta de archivo 1]` — [Capa / Descripción compacta del cambio]
- `[Ruta de archivo 2]` — [Capa / Descripción compacta del cambio]

---

## 🧪 2. Matriz de Verificación y Quality Gates
| Validación | Comando Oficial Ejecutado | Estado | Métrica Requerida vs Obtenida |
| :--- | :--- | :--- | :--- |
| **Suite TDD (BDD Gherkin)** | `[Comando test de AGENTS.md]` | ✅ PASÓ / ❌ FALLÓ | 100% Tests Verdes |
| **Mutation Testing** | `[Comando mutación]` | ✅ PASÓ / ❌ FALLÓ | Requerido >= 70% / Obtenido: [X%] |
| **Compilación & Types** | `[Comando build de AGENTS.md]` | ✅ PASÓ / ❌ FALLÓ | 0 Errores |
| **Análisis Estático** | `[Comando lint de AGENTS.md]` | ✅ PASÓ / ❌ FALLÓ | 0 Advertencias |
| **Contrato de API** | `[Comando contract lint]` | ✅ PASÓ / ❌ FALLÓ | 0 Drift de Especificación |

---

## 💡 3. Criterio Técnico, Recomendaciones y Opinión del Agente
> 🧠 **Análisis de Ingeniería & Decisiones de Diseño:**
> - **[Decisión 1]:** Explicación compacta (Decisión, Razón Técnica, Impacto/Trade-off).
> - **[Advertencia / Recomendación]:** Oportunidad de optimización, prevención de deuda técnica o sugerencia arquitectónica.
> 
> ❓ **Punto Abierto para el Humano (Si aplica):**  
> [Pregunta directa o confirmación requerida para el siguiente ticket/sprint].
```

---

## 🕳️ Principio Anti-Gate-Hueco (Obligatorio en Toda Fila de la Matriz de Quality Gates)

Descubierto en RestoStock (`TK-033`): `pnpm run lint` era un alias de `tsc --noEmit` desde el origen del proyecto — sin ESLint instalado, sin ruleset real. Ticket tras ticket, la fila "Análisis Estático" de la Plantilla A reportó `✅ PASÓ — 0 Advertencias`, porque el comando declarado siempre salía con código 0. El gate nunca mintió técnicamente: ejecutó el comando declarado y reportó su resultado con precisión. El problema es que nadie verificó que ese comando tuviera sustancia detrás — se confió en la **declaración** (`AGENTS.md` llama "lint" a ese comando) en vez de en la **realidad** (ese comando no analiza nada más allá de tipos). El mismo patrón apareció, sin relación directa, otras dos veces en la misma auditoría: una regla de gobernanza sin ningún mecanismo que la hiciera cumplir (`TK-032`, estilos centralizados) y una convención de arquitectura nunca declarada ni verificada entre tickets (`TK-031`, capa compartida `shared/`).

Antes de marcar **cualquier fila** de la Matriz de Verificación (Plantilla A) como `✅ PASÓ`, o cualquier regla de `docs/04_governance_and_quality/rules/*.md` como cumplida en el reporte de una skill, el agente DEBE poder responder que sí a esta pregunta:

> **¿Existe un mecanismo concreto y falsable que fallaría si la regla se violara — o solo estoy confiando en que el comando/regla declarado hace lo que su nombre sugiere?**

- **Si la respuesta es "sí, lo verifiqué":** repórtalo con la evidencia concreta (qué herramienta, qué ruleset o cuántas reglas activas comprobaste — no solo "el comando terminó en verde").
- **Si la respuesta es "no lo verifiqué, asumo que el comando declarado hace lo que dice":** NO marques esa fila como `✅ PASÓ`. Repórtala como `⚠️ NO VERIFICABLE — declarado sin mecanismo confirmado` y detente a preguntar al humano antes de continuar, en vez de heredar la confianza ciega de una ejecución anterior.
- **Esto aplica igual a reglas de gobernanza sin gate automático** (ej. "estilos centralizados", "capa compartida `shared/`"): si no existe una herramienta o script que la verifique, decláralo explícitamente como deuda de verificación en el reporte — nunca la des por cumplida solo porque está escrita en un archivo de `rules/`.

Este principio generaliza los fixes puntuales de `TK-031`, `TK-032` y `TK-033` para no tener que descubrir la cuarta variante del mismo patrón una por una, en otro rincón del proyecto.

---

## 🅱️ Plantilla B: Para Habilidades de Especificación & Documentación (`specs/`)

Cualquier subagente que complete una Skill de especificación o extracción de reglas (PRD, Arquitectura, Esquemas, ADRs, Tickets) DEBE estructurar su respuesta utilizando el siguiente formato Markdown:

```markdown
# 📄 [Nombre de la Skill de Specs] - Reporte de Especificación

* **Documento Creado / Modificado:** `docs/[carpeta]/[nombre_doc].md`
* **Estado:** [🟢 ESPECIFICACIÓN COMPLETADA | 🟡 REQUIERE REVISIÓN HUMANA]

---

## 📄 1. Puntos Clave Plasmados en la Especificación
- **[Sección / Dominio 1]:** [Resumen de entidades, endpoints o historias clave incorporadas].
- **[Sección / Dominio 2]:** [Reglas de negocio o invariantes estipuladas].

---

## 💡 2. Criterio Técnico & Confirmación Humana (Human-in-the-Loop)
> 🧠 **Decisión de Diseño & Arquitectura:**
> - **[Decisión de Diseño]:** Explicación compacta de la regla de negocio o arquitectura adoptada.
> 
> ❓ **Confirmación Requerida para el Humano:**  
> [Pregunta abierta explícita para validar la especificación antes de proceder a la fase de código].
```

---

## 🎯 Directivas de Comunicación Exigidas
1. **Zero Conversational Preamble:** No incluir saludos o texto conversacional introductorio. Iniciar inmediatamente con la cabecera del reporte (`# 📊` o `# 📄`).
2. **Alta Densidad Técnica:** Utilizar tablas y viñetas para la matriz de calidad y listas.
3. **Canal de Opinión Abierto:** Reservado para que el agente opine con total libertad sobre riesgos, optimizaciones y decisiones arquitectónicas.
4. **Anti-Gate-Hueco (ver sección dedicada arriba):** Ninguna fila de la Matriz de Verificación se marca `✅ PASÓ` sin haber confirmado que el mecanismo detrás tiene sustancia real, no solo que el comando declarado salió en verde.
