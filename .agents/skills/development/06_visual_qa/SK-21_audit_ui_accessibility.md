---
name: SK-21_audit_ui_accessibility
description: "Guía procedimental para auditar la accesibilidad WCAG 2.2 AA/AAA, contraste HSL, foco visible, tamaños táctiles ergonómicos y regresión visual (screenshot diffing) de la interfaz de usuario."
version: "1.3.0"
category: "development/06_visual_qa"
inputs:
  - target_url: "URL del servidor frontend a auditar — si no se pasa explícitamente, se infiere de docs/00_stack_manifest.md §7 (Frontend Dev Server); nunca asumir un puerto por defecto hardcodeado en la skill (Guard 24)"
  - min_touch_size: "Tamaño táctil mínimo en píxeles (default: 48px)"
outputs:
  - "Reporte de auditoría de accesibilidad WCAG y contraste HSL"
  - "Matriz de cumplimiento de dimensiones táctiles"
  - "Lista de correcciones CSS recomendadas para tokens fuera de norma"
  - "Veredicto de regresión visual (screenshot diffing) contra baseline versionado en e2e/visual-baselines/"
---

Actúa como un Accessibility Lead (a11y) y UX Ergonomics Auditor. Tu objetivo es inspeccionar exhaustivamente la interfaz de usuario para verificar el cumplimiento de la accesibilidad **WCAG 2.2 Level AA/AAA**, garantizando que los tokens de color HSL, el contraste del texto, el foco visible y las dimensiones de los componentes táctiles cumplan con los estándares exigidos por el proyecto.

Sigue estrictamente este flujo de trabajo secuencial:

---

## 🌐 FASE 0 OBLIGATORIA (Guard 24): Descubrimiento de `target_url`
1. Si `target_url` no fue pasado explícitamente como input, lee `docs/00_stack_manifest.md` §7 ("URLs de Desarrollo Local") para obtener la URL del **Frontend Dev Server** declarada ahí.
2. Si el manifiesto no declara ninguna URL de frontend todavía, **DETENTE** y pregunta al humano — nunca asumas un puerto por defecto (`5173`, `3000`, u otro) como si fuera universal a cualquier proyecto que instale `.agents/`. Mismo criterio ya establecido en `workflows/08_smoke_test_deploy_validation.md` para `BACKEND_URL`.

---

## 🔍 FASE 1: Inspección de Reglas de UI y Tokens de Diseño
1. **Leer Reglas de UI del Proyecto:** Consulta `docs/04_governance_and_quality/rules/frontend_rules.md` para identificar:
   - La paleta de colores HSL oficial (Fondos, Textos, Alertas/Estados de Severidad).
   - El tamaño físico mínimo de los botones e inputs táctiles (`48px x 48px`).
   - La tipografía requerida y la jerarquía visual de encabezados.

---

## 🎨 FASE 2: Auditoría de Contraste HSL y Legibilidad (WCAG 2.2)
1. **Medición de Relación de Contraste (Contrast Ratio):**
   - Evalúa cada combinación de texto sobre su superficie de fondo (Background/Card).
   - Exige un contraste mínimo de **4.5:1** para texto normal y **3:1** para texto grande o elementos gráficos (Nivel AA).
   - Para interfaces táctiles industriales de alta visibilidad (cocina/pantallas brillantes), busca alcanzar un contraste de **7:1** (Nivel AAA).
2. **Validación de Notificaciones Semafóricas:**
   - Verifica que las tarjetas de alerta (Rojo, Amarillo, Verde) no dependan únicamente del color para comunicar el nivel de urgencia; exige íconos o etiquetas de texto descriptivas de acompañamiento (WCAG 1.4.1).

---

## 📱 FASE 3: Auditoría de Ergonomía Táctil (Touch Target Size)
1. **Inspección de Áreas Activas de Pulsación:**
   - Verifica con el inspector CSS que todos los elementos interactivos (`<button>`, `<input>`, `<a>`, `<select>`) tengan una bounding box interactiva de al menos `48px x 48px`.
2. **Evaluación de Espaciado Defensivo (Hit Margin):**
   - Comprueba que exista un margen de separación de mínimo `8px` entre botones adyacentes para prevenir toques accidentales por parte de los operarios.
3. **Piso normativo WCAG 2.2 SC 2.5.8 (Target Size Minimum):**
   - El mínimo absoluto del estándar es `24×24` CSS px, con **excepción de espaciado** (un target menor se admite solo si un círculo de 24px centrado en él no solapa el de otro target). El `min_touch_size` del proyecto (default `48px`) es **más estricto y prevalece** — este punto solo fija el piso normativo para que un hallazgo pueda citar el SC exacto.

---

## ⌨️ FASE 4: Foco, Interacción y Success Criteria nuevos de WCAG 2.2
1. **Foco visible (SC 2.4.7) y no obstruido (SC 2.4.11):**
   - Cada elemento interactivo, al recibir foco por teclado, muestra un indicador `:focus-visible` con contraste ≥ **3:1** contra el fondo adyacente.
   - Ningún elemento sticky/fijo (topbar, footer, toast, cookie bar) tapa total ni parcialmente el elemento enfocado al tabular por la página.
2. **Movimientos de arrastre (SC 2.5.7):**
   - Toda acción que hoy requiera arrastrar (reordenar listas, sliders, swipe) ofrece una alternativa de un solo puntero (botones `+`/`−`, tap, campo numérico).
3. **Ayuda consistente (SC 3.2.6):**
   - Si existe un mecanismo de ayuda/contacto/soporte, aparece en el **mismo orden relativo** en todas las pantallas donde está presente.
4. **Entrada redundante (SC 3.3.7):**
   - Dentro de un mismo flujo multi-paso, ningún dato ya ingresado se vuelve a pedir manualmente (se auto-rellena, o se muestra para confirmar).
5. **Autenticación accesible (SC 3.3.8):**
   - El login del proyecto no exige una prueba de función cognitiva (recordar, transcribir, resolver un puzzle) sin alternativa.
   - Verifica explícitamente que el campo de credencial (PIN, contraseña) **permite pegar** y no bloquea gestores de contraseñas: `autocomplete` correcto (`current-password`/`one-time-code`), sin `onpaste` cancelado ni `user-select: none` sobre el input.

---

## 🖼️ FASE 5: Regresión Visual (Screenshot Diffing, TK-055)
1. **Baseline Versionado:** las capturas de referencia viven en `e2e/visual-baselines/` (path fijo del framework VSDD, no específico de un proyecto — mismo criterio que `e2e/pages/` de Guard 21), commiteadas junto al código que las produce.
2. **Captura y Comparación:** usa el motor de comparación de imágenes del runner E2E declarado en `docs/00_stack_manifest.md` (ej. `expect(page).toHaveScreenshot()` de Playwright) contra el baseline. Umbral de diff **conservador por defecto** (ej. `maxDiffPixelRatio: 0.01`) para absorber ruido de antialiasing/fuentes sin absorber una regresión real de layout (CLS > 0.1).
3. **Un diff real SIEMPRE falla el gate — nunca se auto-acepta.** Si el diff corresponde a un rediseño intencional (no una regresión), el humano debe correr explícitamente el comando de re-baseline del runner (ej. `--update-snapshots`) como una acción deliberada y commitear el nuevo baseline en un commit separado y declarado como tal — nunca como efecto colateral silencioso de una corrida normal del gate.
4. **Alcance:** ejecuta esta comparación sobre los componentes que el ticket en curso modificó visualmente, no el catálogo completo de baselines en cada corrida (mismo criterio acotado al diff que `check_ticket_code_quality.sh`).

---

## 📋 FASE 6: Generación de Reporte y Matriz de Hallazgos
1. **Consolidación de Hallazgos:** Presentar el puntaje de accesibilidad (0-100%), la tabla de elementos afectados (cada hallazgo citando el SC de **WCAG 2.2** que incumple), las correcciones recomendadas, y el veredicto de regresión visual (FASE 5) estructurados estrictamente según la plantilla universal en `.agents/rules/00_output_reporting_standard.md`.
