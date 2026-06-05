---
name: wireframe-designer
description: "Wireframe, Mockup, Prototipo, Ui Prototype, Navigable Design, Interactivo, Autocontenido. Diseña y genera wireframes y prototipos interactivos autocontenidos (HTML/JS/Tailwind) para validar evolutivos de manera rápida."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "3.3"
---
[ACTIVATION]

Esta skill se activa cuando la tarea o el contexto del usuario requiere realizar acciones sobre wireframe-designer o incluye las siguientes palabras clave/desencadenadores:
**Triggers:** wireframe, mockup, prototipo, UI prototype, navigable design, interactivo, autocontenido

---

[RULES]

1. **No dependencies:** El archivo prototipo HTML debe ser completamente autocontenido y cargarse en cualquier navegador.
2. **Tailwind CSS:** Usar CDN de Tailwind CSS para el prototipo visual.

---

[GATES]

| Condición | Acción | Destino / Fase |
| :--- | :--- | :--- |
| El prototipo requiere interactividad básica | Agregar scripts de vanilla JS embebidos | Interactive HTML |
| Se solicita validación de UX | Generar prototipo visual interactivo en HTML | Output Prototipo |


---

[HARNESS]

1. **Autocontenido y Sin Dependencias Locales:** Todo prototipo HTML debe ser autocontenido y cargarse directamente en cualquier navegador sin requerir un servidor local ni dependencias de archivos locales.
2. **Uso de Tailwind Seguro:** Utilizar única y exclusivamente la URL del CDN oficial y seguro de Tailwind CSS especificado en `references/tailwind-cdn-rules.md`.
3. **No Placeholders Visuales:** Queda prohibido usar rectángulos vacíos con texto "Imagen aquí". Usar imágenes reales o placeholders SVG embebidos de manera explícita.
4. **Interactividad con Vanilla JS:** Toda la interactividad básica (modales, pestañas, menús desplegables) debe implementarse con Vanilla JS limpio embebido.
5. **Cumplimiento de Contraste:** Asegurar que los colores Tailwind elegidos para el wireframe cumplen con el contraste mínimo de accesibilidad (AA).
6. **Estructura Semántica:** El prototipo HTML debe utilizar tags semánticos (`<header>`, `<nav>`, `<main>`, `<footer>`) en lugar de únicamente divs anidados.
7. **Diseño Mobile-First:** El layout del prototipo debe estructurarse con clases responsivas de Tailwind adaptándose correctamente a resoluciones móviles.
8. **Sin Errores en Consola:** El prototipo no debe lanzar ningún error de JavaScript en la consola del navegador al cargarse o interactuar con él.
9. **Formularios Interactivos:** Todos los formularios presentes en el prototipo deben reaccionar con un feedback visual al enviarse (ej. alerta o mensaje de éxito).
10. **Tipografía Legible:** Emplear clases de fuente sans-serif legibles y con jerarquías claras.
11. **Enlaces Simulados:** Todos los enlaces o botones de navegación interna deben estar cableados con hashes (`#`) o simular transiciones de pantalla en JS.
12. **Datos Realistas:** Emplear textos y datos realistas en la interfaz para simular el comportamiento real de la aplicación, evitando textos "test" repetitivos.
13. **Procedimiento de Autoverificación - Carga Local:** Validar que el archivo HTML se abre directamente desde el sistema de archivos (`file://`) cargando todos sus estilos.
14. **Procedimiento de Autoverificación - Consola:** Simular la interacción con los elementos interactivos y comprobar que no hay errores de JS.
15. **Procedimiento de Autoverificación - Responsive:** Comprobar que los menús se colapsan correctamente y los elementos se apilan en el breakpoint móvil (`sm:`).
16. **Procedimiento de Autoverificación - Contraste:** Asegurar visualmente que el texto sobre fondos de color es legible y cumple con las guías de estilo.
17. **Procedimiento de Autoverificación - Semántica HTML:** Validar que no hay tags interactivos (ej. botones) construidos con `<div>` sin atributos ARIA adecuados.
18. **Procedimiento de Autoverificación - Guardado:** Verificar que el archivo final se almacena en el directorio `docs/design/wireframes/` con extensión `.html`.
19. **Procedimiento de Autoverificación - Carga de Red:** Comprobar que todas las llamadas externas de recursos (CDN) provienen únicamente de dominios seguros autorizados.
20. **Límite de Seguridad:** Máximo 3 intentos de autoverificación y auto-corrección. Si tras 3 intentos no se cumplen las condiciones, detener la ejecución y escalar la alerta.

---

[STEPS]

### Solo Mode (Interactivo / Usuario)
1. Analizar los requerimientos de la UI y los flujos de usuario descritos en el PRD.
2. Generar el archivo HTML con estilos Tailwind embebidos y scripts de interactividad.
3. Guardar el prototipo interactivo en `docs/design/wireframes/` y registrar el contrato.

### Orchestrated Mode (Coordinado / SDD Pipeline)
1. Generar automáticamente el prototipo HTML y guardarlo en la carpeta de diseño visual.
2. Actualizar el contrato indicando éxito.

---

[OUTPUT]

Al completar su ejecución, la skill debe:
1. Generar los artefactos y archivos resultantes especificados en su modo de ejecución.
2. Escribir/Actualizar un contrato de estado en el archivo de estado de la skill (especificado por la configuración de la tarea o en Engram). El formato del contrato debe cumplir con el esquema definido en:
   - [contract.d.ts](references/contract.d.ts)

---

[REFERENCES]

- [contract.d.ts](references/contract.d.ts) — Interfaz TypeScript del contrato de datos de la skill.
- [tailwind-cdn-rules.md](references/tailwind-cdn-rules.md) — Reglas y CDN seguro de Tailwind.
