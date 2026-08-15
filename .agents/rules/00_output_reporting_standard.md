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
