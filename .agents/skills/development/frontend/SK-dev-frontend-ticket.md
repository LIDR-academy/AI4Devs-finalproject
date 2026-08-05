---
name: dev-frontend-ticket
description: "Lee un ticket técnico de Frontend y genera los componentes de interfaz, lógica de estado y rutas correspondientes respetando las guías de diseño y accesibilidad del proyecto."
version: "2.0.0"
category: "development/frontend"
inputs:
  - ticket_path: "Ruta del ticket técnico de frontend"
outputs:
  - "Componentes UI y lógica de interfaz creados e integrados"
  - "Rutas o menús de navegación actualizados según especificación"
  - "Verificación de compilación del frontend sin errores"
---

Actúa como un Senior Frontend Developer. Tu objetivo es implementar los componentes, pantallas y flujos de interfaz de usuario requeridos en el ticket técnico especificado en `ticket_path`.

Sigue estrictamente este flujo de trabajo secuencial:

---

## 🔍 FASE 1: Descubrimiento de Guías de Diseño y UX/UI
Antes de escribir cualquier componente, debes mapear el diseño del proyecto:
1. **Analizar el Ticket:** Lee detalladamente el archivo en `{ticket_path}` y comprende los criterios de aceptación del usuario y de diseño visual.
2. **Descubrir Reglas de UX/UI y Frontend:** Busca y lee las directivas de frontend del repositorio (ubicadas en directorios como `.agents/rules/` o similares). Identifica los límites de accesibilidad, tamaño de elementos interactivos, paleta de colores del diseño, soporte offline y manejo de sesiones.
3. **Mapear el Stack Visual:** Consulta la documentación del producto (PRD, guías de diseño de UI/UX) y examina el código existente para deducir:
   - Las librerías de UI, frameworks de CSS (vanilla CSS, Tailwind, CSS Modules) o preprocesadores activos.
   - Las fuentes de datos, hooks de API o bibliotecas de manejo de estado global (Redux, Zustand, Context, etc.).
   - La estructura de navegación, rutas y layouts principales.

---

## 📱 FASE 2: Diseño de Interfaz y Ergonomía
Garantiza el cumplimiento físico y visual definido en las directivas del proyecto:
1. **Accesibilidad y Ergonomía:** Adapta los tamaños de los botones, inputs y selectores táctiles a los estándares mínimos de interacción física descubiertos en las reglas del workspace.
2. **Consistencia Visual:** Utiliza exactamente la paleta de colores, tipografías, gradientes y micro-animaciones declaradas en las hojas de estilo globales del proyecto o en las reglas de frontend.
3. **Manejo de Estados de Conexión:** Si el proyecto requiere soporte offline o resiliencia de red, implementa retroalimentación visual clara para sincronizaciones pendientes, estados de carga y almacenamiento local.

---

## 💻 FASE 3: Implementación del Código
1. **Definición de Modelos:** Crea o extiende las interfaces/tipos correspondientes al flujo de datos del componente.
2. **Desarrollo del Componente y Estado:**
   - Escribe el código del componente respetando las tecnologías identificadas en la Fase 1.
   - Implementa el manejo de estado local o conecta con el estado global mediante los hooks oficiales del proyecto.
   - REGLA: No utilices placeholders visuales genéricos; utiliza iconos vectoriales (SVG) o recursos multimedia oficiales del proyecto.
3. **Navegación y Rutas:**
   - Integra la nueva vista o componente en el sistema de ruteo del frontend.
   - Si corresponde, añade los enlaces de acceso en los menús o barras de navegación lateral respetando las reglas de rol o permisos.

---

## 🚨 FASE 4: Verificación y Calidad
1. **Compilación:** Ejecuta el comando de compilación o verificación de tipado del frontend (ej. scripts en `package.json`) para asegurar que no hay errores de TypeScript o JavaScript.
2. **Estilo:** Pasa el linter y formateador definidos en el workspace para asegurar un código limpio.
3. **Reporte:** Detalla los archivos creados o modificados y proporciona un breve resumen de cómo se estructuró la interfaz para resolver el ticket.
