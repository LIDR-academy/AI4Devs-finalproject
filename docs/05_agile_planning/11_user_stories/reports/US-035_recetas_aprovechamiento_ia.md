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
*   **Pregunta 2:** ¿Qué ocurre si no hay internet o el proveedor de IA falla?
*   **Respuesta:** Conmutación automática transparente: el sistema ejecuta de inmediato el motor heurístico local determinista (agrupa remanentes por categoría y sugiere preparaciones base como caldos, salsas o salteados), devolviendo un resultado válido con badge `"Origen: Motor Heurístico Local"`.
*   **Pregunta 3:** ¿Cómo se maneja la precisión de cantidades y costos?
*   **Respuesta:** Cumplimiento estricto de Guard 17: las cantidades y costos sugeridos se representan en cadenas numéricas decimales y se instancian como `DecimalQuantity` con `decimal.js`, sin operaciones flotantes primitivas.

---

## 🥒 Criterios de Aceptación (BDD - Sintaxis Gherkin)

### Escenario 1: Generación de Propuestas de Aprovechamiento con IA
- **Given** Existen remanentes activos en cocina con fecha de caducidad menor a 48 horas.
- **When** El chef pulsa "Generar Sugerencias de Aprovechamiento" en `/reportes` o `/recetas`.
- **Then** El sistema consulta los insumos en riesgo, invoca al gateway de IA configurado con un JSON schema estricto y presenta hasta 3 tarjetas de recetas sugeridas indicando nombre, raciones estimadas, ingredientes con cantidades exactas y la merma prevenida.

### Escenario 2: Fallback Heurístico Automático por Desconexión o Timeout
- **Given** El proveedor de IA externo configurado no responde (timeout > 5 segundos) o el modo `HEURISTIC` está activo.
- **When** El chef solicita sugerencias de aprovechamiento.
- **Then** El sistema no arroja error HTTP 500 ni interrumpe la pantalla; ejecuta el algoritmo determinista local y devuelve propuestas heurísticas con el indicador `"Origen: Motor Heurístico Local"`.

### Escenario 3: Conversión de Propuesta a Receta Activa del Catálogo
- **Given** Una propuesta de aprovechamiento desplegada en la pantalla.
- **When** El chef pulsa "Guardar en Catálogo de Recetas".
- **Then** El sistema persiste la nueva entidad `Receta` con sus `RecetaIngredientes` asociados en base de datos, mostrándola disponible de inmediato para consumo rápido mediante `US-007`.

---

## 🔗 Referencias
*   PRD: [`docs/01_product_definition/02_prd.md`](../../../01_product_definition/02_prd.md) §5 (US-035)
*   Manifiesto: [`docs/00_stack_manifest.md`](../../../00_stack_manifest.md) §2 (Conector IA)
*   Historias Relacionadas: [`US-003`](../stock/US-003.md) (Remanentes FEFO), [`US-007`](../kitchen/US-007.md) (Consumo por Receta), [`US-034`](../settings/US-034_configuracion_agente_ia.md) (Configuración IA)
