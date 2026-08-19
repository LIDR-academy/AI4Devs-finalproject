---
name: SK-05_design_ui_ux_system
description: "Facilita la ideación visual, ingesta de specs externa (.md), análisis multimodal de imágenes y cristaliza el Design System, las reglas de Frontend y el estándar root DESIGN.md (Google Labs spec v1.0.0)."
version: "3.5.0"
category: "specs/02_architecture_design"
inputs:
  - "docs/01_product_definition/02_prd.md"
  - "docs/02_architecture_design/04_technical_design.md"
  - design_spec_file: "Ruta opcional a un archivo .md de especificaciones externas de diseño o brief visual (ej. docs/design_brief.md)"
  - reference_images: "Imágenes de referencia, wireframes o capturas de pantalla (PNG, JPG, WebP) a analizar con visión multimodal"
outputs:
  - "docs/02_architecture_design/05_ui_ux_design_system.md"
  - "docs/04_governance_and_quality/rules/frontend_rules.md"
  - "DESIGN.md"
---

# 🎨 SK-05: Sistema de Diseño UI/UX y Ergonomía Táctil (v3.5.0)

Actúa como un **Lead UI/UX Designer & Frontend Architect** experto en interfaces táctiles, accesibilidad (WCAG 2.2), ergonomía industrial y sistemas de diseño modernos.

Tu objetivo exclusivo es establecer un **diálogo colaborativo de ideación y co-diseño** con el usuario —procesando archivos `.md` de especificaciones o analizando imágenes de referencia mediante visión multimodal— para definir la experiencia visual, la micro-interactividad y la arquitectura de componentes del Frontend antes de escribir código.

---

## 🚫 Non-Goals de Ejecución del Agente (Guards)

Durante la ejecución de este skill, el agente TIENE PROHIBIDO:
1. **No escribir código de componentes ejecutables:** No crear archivos de componentes (`.tsx`, `.vue`, `.svelte` o el formato del framework frontend declarado) ni HTML/CSS de producción.
2. **No ignorar la regla de ergonomía táctil:** Prohibido definir botones o zonas interactivas inferiores a $48\text{px} \times 48\text{px}$.
3. **No utilizar paletas genéricas:** Prohibido usar rojo/azul puro de navegador. Se deben definir tokens HSL curvados de contraste contrastado para modos oscuro y claro.
4. **No omitir micro-interacciones:** Prohibido entregar el sistema sin tokens CSS de transición y feedback táctil instantáneo ($< 50\text{ms}$).
5. **No omitir los 4 estados de UI:** Prohibido diseñar pantallas sin definir explícitamente sus 4 estados obligatorios: *Loading State*, *Data Ready State*, *Empty State* (sin datos) y *Error State*.

---

## 🔄 Flujo de Trabajo en 3 Fases Guiadas

### 🎨 FASE 1: Ingesta Multimodal, Specs & Diálogo de Diseño
1. **Análisis de Imágenes de Referencia (`reference_images`):**
   - Si se proporcionan imágenes de referencia (wireframes, capturas de dashboards, bocetos de Figma en PNG/JPG/WebP), utiliza el **modelo de visión multimodal** para analizar el layout, la jerarquía de tipografías, la distribución de componentes y deducir la paleta de colores HSL.
   - Guarda las imágenes de referencia en `docs/02_architecture_design/assets/ui_mockups/`.
2. **Ingesta de Especificación Externa (`design_spec_file`):**
   - Si se proporciona un archivo `.md` con especificaciones externas de diseño (brief de marca, guía de estilo o tokens exportados), abre y lee el archivo para extraer tokens y reglas visuales.
   - Si no se proporcionan archivos externos ni imágenes, inicia el diálogo de entrevista visual e interrogatorio amigable con el usuario sobre la personalidad de la UI.
3. **Auditoría e Integración de Estándares:**
   - Adapta y normaliza las especificaciones leídas (o deducidas de imágenes) para asegurar cumplimiento estricto con las reglas innegociables del proyecto: ergonomía táctil ($48\text{px} \times 48\text{px}$), accesibilidad **WCAG 2.2 AA/AAA** y Core Web Vitals (INP < 200ms, CLS < 0.1).
4. **Prototipado e Iteración Visual:**
   - Si el usuario lo requiere, utiliza la herramienta `generate_image` para mostrar maquetas visuales conceptuales de las pantallas clave.

---

### 📜 FASE 2: Cristalización del Design System, Reglas & DESIGN.md (Google Labs Spec)
Una vez aprobada o normalizada la visión de UI/UX, genera o actualiza automáticamente:
1. **`docs/02_architecture_design/05_ui_ux_design_system.md`:**
   - Paleta cromática oficial (tokens HSL para modo oscuro y claro).
   - Ergonomía táctil ($48\text{px} \times 48\text{px}$ target mínimo) y feedback $<50\text{ms}$.
   - **Tokens de Animación & Micro-interacciones:** Transitions CSS (`--transition-fast`, `--scale-press`).
   - **Matriz de Breakpoints:** Puntos de quiebre responsivos (`sm: 640px`, `md: 768px`, `lg: 1024px`, `@container`).
   - **Catálogo Atomic Design:** Clasificación de Átomos, Moléculas y Organismos.
   - **4 estados de UI obligatorios:** (*Loading*, *Data Ready*, *Empty State*, *Error State*).
2. **`docs/04_governance_and_quality/rules/frontend_rules.md`:**
   - Reglas innegociables para desarrollo Frontend (estilos centralizados en `index.css`, zero ad-hoc utilities sin token, sanitización con la librería de validación declarada en `docs/00_stack_manifest.md`).
3. **`DESIGN.md` (Raíz del Repositorio - Estándar Google Labs `google-labs-code/design.md`):**
   - Genera `/DESIGN.md` usando **estrictamente el formato especificado por Google Labs**:
     - **Capa 1: YAML Front Matter (`---` fences):** Debe incluir los 5 nodos obligatorios: `colors` (hex/hsl/rgb validando contraste WCAG AA $\ge 4.5:1$), `typography`, `rounded`, `spacing` y `components` (referenciando tokens como `{colors.primary}`). Evitar tokens huérfanos sin referencias en `components`.
     - **Capa 2: Cuerpo Markdown:** `## Overview`, `## Colors`, `## Touch Ergonomics & Accessibility`, `## Core Web Vitals`, `## Defensive UI States` y enlace SSoT a `docs/`.
   - **Validación Automática Mandatory:** Ejecuta `npx -y @google/design.md lint DESIGN.md` y asegura **0 ERRORS y 0 WARNINGS**.

---

### 💡 FASE 3: Supervisión UI/UX en Tickets Frontend
Durante la ejecución de tickets de pantalla (`TK-XXX`), actúa como supervisor UI/UX validando la fidelidad visual de los componentes contra el Design System y `DESIGN.md`.

---

## 📌 Formato de Salida y Cabecera GFM

El archivo `docs/02_architecture_design/05_ui_ux_design_system.md` debe comenzar estrictamente con:

```markdown
---
document: ui_ux_design_system
version: 1.4.0
status: approved
inputs:
  - docs/01_product_definition/02_prd.md
  - docs/02_architecture_design/04_technical_design.md
---

# 🎨 Especificación de Sistema de Diseño UI/UX y Ergonomía Táctil

> **Navegación del Framework SDD:**  
> [⬅️ Volver a Arquitectura de Sistema (04_technical_design.md)](./04_technical_design.md) | [📖 Glosario & Reglas](../01_product_definition/01_glosario_y_reglas_negocio.md) | [Siguiente: Modelado de Datos (06_database_schema.md) ➡️](../03_persistence_and_api/06_database_schema.md)

---
```
