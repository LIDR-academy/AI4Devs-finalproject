---
user_story: US-035
title: Generador de Recetas de Aprovechamiento Anti-Desperdicio
epic: Reportes, Recetas y Prevención de Mermas
status: approved
---

# 📖 Historia de Usuario: US-035 — Generador de Recetas de Aprovechamiento Anti-Desperdicio

## 👤 Rol del Usuario
Como Chef Ejecutivo o Encargado de Cocina (ADMIN),

## 🎯 Objetivo / Valor de Negocio
Quiero que el sistema analice los remanentes abiertos en cocina cuya fecha de caducidad esté próxima (<48 horas) y genere propuestas estructuradas de recetas o preparaciones de aprovechamiento basadas exclusivamente en ingredientes disponibles, con el fin de evitar mermas por vencimiento (`US-005`), aumentar el margen operativo y acelerar la rotación de inventarios bajo el principio FEFO.

## 📌 Justificación (Gap Analysis)
Actualmente, el sistema alerta sobre remanentes por vencer mediante notificaciones (`US-006`), pero la decisión culinaria de cómo transformar esos insumos en platos vendibles recae en la memoria del cocinero. Esta historia cierra la brecha entre la detección del riesgo de merma y su consumo productivo, ofreciendo sugerencias estructuradas que pueden convertirse en recetas del catálogo en un solo clic.

## 🗣️ Decisiones de Negocio Consultadas con el Humano (Guard 28)
*   **Pregunta 1:** ¿La IA publica automáticamente la receta en la carta del restaurante?
*   **Respuesta:** No. Human-in-the-Loop estricto: la IA genera sugerencias en estado de borrador con gramajes y raciones estimadas. El Chef debe pulsar "Guardar en Catálogo" para que se persista como receta activa en el recetario (`US-012`).
*   **Pregunta 2:** ¿Cómo se garantiza que no haya fuga de las recetas secretas/fórmulas del restaurante al usar IA?
*   **Respuesta:** **Modo Dual Estricto con Zero Data Leakage (Guard 9):**
    1. **Modo Catálogo Propio (`CATALOG` - Por defecto):** El sistema cruza los remanentes en riesgo (<48h) con el recetario ya existente en la base de datos local de RestoStock. Se ejecuta 100% en el servidor local (Node.js/Postgres). **Cero datos salen a la red**, protegiendo el secreto industrial.
    2. **Modo Creativo Libre (`CREATIVE`):** Si el chef desea inventar platos fuera de carta, la IA externa (o fallback heurístico) recibe únicamente nombres genéricos de insumos y cantidades en riesgo. Jamás se transmiten recetas del catálogo, preparaciones confidenciales ni datos de clientes/negocio.
*   **Pregunta 3:** ¿Qué ocurre si no hay internet o el proveedor de IA falla en Modo Creativo?
*   **Respuesta:** Conmutación automática transparente: el sistema ejecuta de inmediato el motor heurístico local determinista (agrupa remanentes por categoría y sugiere preparaciones base como caldos, salsas o salteados), devolviendo un resultado válido con badge `"Origen: Motor Heurístico Local"`.
*   **Pregunta 4:** ¿Cómo se maneja la precisión de cantidades y costos?
*   **Respuesta:** Cumplimiento estricto de Guard 17: las cantidades y costos sugeridos se representan en cadenas numéricas decimales y se instancian como `DecimalQuantity` con `decimal.js`, sin operaciones flotantes primitivas.

---

## 🥒 Criterios de Aceptación (BDD - Sintaxis Gherkin)

### Escenario 1: Modo Catálogo Propio (Soberanía IP y Zero Data Leakage)
- **Given** Existen remanentes activos en cocina con fecha de caducidad menor a 48 horas y un catálogo de recetas registradas en el sistema.
- **When** El chef selecciona el modo "Recetas del Restaurante (100% Privado)" y solicita sugerencias.
- **Then** El sistema ejecuta el cruce en memoria/DB local sin emitir llamadas de red externas, identificando las recetas existentes cuyos ingredientes coinciden con los remanentes en riesgo, calculando raciones consumibles y etiquetando el resultado con `"Origen: Catálogo Propio (100% Local / Zero Data Leakage)"`.

### Escenario 2: Modo Creativo Libre con IA Externa
- **Given** Existen remanentes activos en cocina con fecha de caducidad menor a 48 horas.
- **When** El chef selecciona el modo "Generación Creativa (IA)" y pulsa "Generar Sugerencias".
- **Then** El sistema envía únicamente la lista anonimizada de ingredientes en riesgo al gateway configurado, presentando hasta 3 propuestas culinarias creativas que maximizan la prevención de merma.

### Escenario 3: Fallback Heurístico Automático en Modo Creativo
- **Given** El proveedor de IA externo configurado no responde (timeout > 5 segundos) o el modo `HEURISTIC` está activo.
- **When** El chef solicita sugerencias en Modo Creativo.
- **Then** El sistema no arroja error HTTP 500 ni interrumpe la pantalla; ejecuta el algoritmo determinista local y devuelve propuestas heurísticas con el indicador `"Origen: Motor Heurístico Local"`.

### Escenario 4: Conversión de Propuesta Creativa a Receta Activa del Catálogo
- **Given** Una propuesta de aprovechamiento creativo desplegada en la pantalla.
- **When** El chef pulsa "Guardar en Catálogo de Recetas".
- **Then** El sistema persiste la nueva entidad `Receta` con sus `RecetaIngredientes` asociados en base de datos, mostrándola disponible de inmediato para consumo rápido mediante `US-007`.

---

## 🔗 Referencias
*   PRD: [`docs/01_product_definition/02_prd.md`](../../../01_product_definition/02_prd.md) §5 (US-035)
*   Manifiesto: [`docs/00_stack_manifest.md`](../../../00_stack_manifest.md) §2 (Conector IA)
*   Tickets Técnicos:
    *   [`TK-122`](../../12_tickets/recipes/backend/TK-122.md) & [`TK-122-FE`](../../12_tickets/recipes/frontend/TK-122-FE.md): Generador Inicial IA & Heurístico.
    *   [`TK-124`](../../12_tickets/recipes/backend/TK-124.md) & [`TK-124-FE`](../../12_tickets/recipes/frontend/TK-124-FE.md): Modo Dual & Matching Local Catálogo con Zero Data Leakage.
*   Historias Relacionadas: [`US-003`](../stock/US-003.md) (Remanentes FEFO), [`US-007`](../kitchen/US-007.md) (Consumo por Receta), [`US-034`](../settings/US-034_configuracion_agente_ia.md) (Configuración IA)

