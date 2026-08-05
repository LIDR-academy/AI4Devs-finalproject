---
name: SK-17_frontend_ticket
description: "Lee un ticket técnico de Frontend y genera los componentes de interfaz, lógica de estado y rutas correspondientes aplicando SOLID, Bucle de Auto-Reflexión y accesibilidad WCAG."
version: "2.2.0"
category: "development/03_frontend_development"
inputs:
  - ticket_path: "Ruta del ticket técnico de frontend"
outputs:
  - "Componentes UI y lógica de interfaz creados e integrados"
  - "Rutas o menús de navegación actualizados según especificación"
  - "Verificación de compilación del frontend sin errores"
---

Actúa como un Senior Frontend Developer. Tu objetivo es implementar los componentes, pantallas y flujos de interfaz de usuario requeridos en el ticket técnico especificado en `ticket_path`, aplicando **Clean Architecture en Frontend**, **Principios SOLID**, **Bucle de Auto-Reflexión**, **Ergonomía Táctil** y la directiva **WCAG 2.1 AA/AAA**.

Sigue estrictamente este flujo de trabajo secuencial:

---

## 🔍 FASE 1: Descubrimiento de Guías de UI, SOLID y Reglas
1. **Analizar el Ticket:** Lee el ticket en `{ticket_path}` y comprende los criterios de aceptación.
2. **Descubrir Reglas de UX/UI:** Consulta `docs/03_governance_and_quality/rules/frontend_rules.md` para identificar:
   - Botones táctiles de mínimo **48px x 48px** con **8px** de margen.
   - Tokens HSL oficial (Industrial Dark Mode + Glassmorphism).
   - Estándares de accesibilidad **WCAG 2.1 AA/AAA** (Contraste min `4.5:1` / `7:1`).
   - Los 4 estados defensivos obligatorios (Loading Skeletons, Empty State, Error State, Offline Banner).
3. **Mapear Ejemplos Few-Shot:** Consulta la carpeta `.agents/examples/` para guías de estructura visual.

---

## 📱 FASE 2: Diseño de Componentes y Desacoplamiento (SOLID)
1. **Inversión de Dependencias (DIP):** Abstraer las llamadas a API mediante interfaces de repositorio (`IRemanenteRepository`).
2. **Responsabilidad Única (SRP):**
   - Extraer la lógica de estado o colas IndexedDB hacia **Custom Hooks** (ej. `useOfflineQueue`).
   - Mantener el componente visual enfocado únicamente en la presentación.

---

## 💻 FASE 3: Implementación del Código
1. **Modelos & DTOs:** Crea o extiende las interfaces TypeScript con `import type` estricto (sin `any`).
2. **Desarrollo de UI Ergonomía Táctil:** Aplica tokens HSL, gradientes y micro-animaciones CSS.
3. **Navegación & Permisos:** Integra la vista en el sistema de ruteo de React/Next.js.

---

## 🔄 FASE 4: Bucle de Auto-Reflexión y Auto-Corrección (Self-Checklist)
Antes de entregar el ticket, ejecuta esta lista de cotejo interna:
- [ ] ¿Los elementos interactivos miden al menos `48px x 48px`? (Si no $\rightarrow$ ajustar min-width/height).
- [ ] ¿El texto cumple la relación de contraste WCAG 2.1? (Si no $\rightarrow$ ajustar variable HSL).
- [ ] ¿Están implementados los 4 estados defensivos (Loading, Empty, Error, Offline)? (Si falta alguno $\rightarrow$ agregarlo).
- [ ] ¿La lógica de estado fue extraída a un Custom Hook? (Si está en el JSX $\rightarrow$ refactorizar).

---

## 🚨 FASE 5: Verificación y Calidad
1. **Compilación & Types:** Corre `pnpm run build` para asegurar 0 errores de compilación TypeScript.
2. **Análisis Estático:** Ejecuta `pnpm run lint` cumpliendo 0 errores y 0 advertencias.
3. **Reporte:** Presenta los archivos creados o modificados y confirma el cumplimiento de ergonomía y accesibilidad.
