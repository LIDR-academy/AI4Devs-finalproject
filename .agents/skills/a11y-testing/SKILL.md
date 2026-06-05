---
name: a11y-testing
description: "Accesibilidad, A11Y, Wcag, Accessibility Testing, Contraste, Aria, Teclado, Lector De Pantalla, Auditoría Accesibilidad. Genera tests de accesibilidad WCAG 2.1/2.2, audita violaciones, propone fixes y produce reportes priorizados."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "2.2"
---
[ACTIVATION]

Esta skill se activa cuando la tarea o el contexto del usuario requiere realizar acciones sobre a11y-testing o incluye las siguientes palabras clave/desencadenadores:
**Triggers:** accesibilidad, a11y, WCAG, accessibility testing, contraste, ARIA, teclado, lector de pantalla, auditoría accesibilidad

---

[RULES]

1. **Strict WCAG Compliance:** Evaluar y cumplir niveles A y AA de las guías de accesibilidad web.
2. **Audit Priority:** Los problemas que bloqueen el teclado o la lectura de pantalla deben ser resueltos con severidad alta.

---

[GATES]

| Condición | Acción | Destino / Fase |
| :--- | :--- | :--- |
| Violación crítica de contraste o ARIA encontrada | Reportar y detener compilación de UI si se requiere | Reporte de Accesibilidad |
| Solicitud de auditoría de accesibilidad | Ejecutar análisis estático de a11y | Auditoría |


---

[HARNESS]

1. **Contraste Mínimo:** Todos los elementos de texto deben cumplir con una relación de contraste mínima de 4.5:1 para texto normal y 3:1 para texto grande.
2. **Uso del Color:** El color no debe ser el único medio visual para transmitir información, indicar una acción o distinguir elementos.
3. **Control por Teclado:** Toda la funcionalidad del contenido debe ser operable a través de una interfaz de teclado sin requerir tiempos específicos para pulsaciones individuales.
4. **Foco Visible:** Cualquier interfaz de usuario operativa por teclado debe tener un indicador de foco visible y altamente distinguible.
5. **Sin Trampas de Foco:** Si el foco del teclado puede ser movido a uno de los componentes de la página, debe ser posible retirarlo usando solo la interfaz de teclado.
6. **Estructura de Encabezados:** Los encabezados deben seguir una estructura jerárquica lógica (`<h1>` a `<h6>`), sin saltarse niveles.
7. **Atributo Alt en Imágenes:** Todas las imágenes no decorativas deben poseer un atributo `alt` descriptivo. Las imágenes decorativas deben usar `alt=""`.
8. **Etiquetas de Formulario:** Todos los campos de entrada deben estar asociados a una etiqueta `<label>` o tener un atributo `aria-label`/`aria-labelledby`.
9. **Nombres de Accesibilidad:** Los botones, enlaces y otros elementos interactivos deben poseer un nombre accesible discernible y descriptivo.
10. **Roles ARIA correctos:** Los atributos ARIA deben usarse de acuerdo con la especificación WAI-ARIA y no deben contradecir la semántica nativa del HTML.
11. **Indicadores de Estado:** Cualquier cambio dinámico de estado en la interfaz de usuario debe anunciarse a los lectores de pantalla mediante regiones activas (`aria-live`).
12. **Idiomas de la Página:** El elemento `<html>` debe especificar un atributo `lang` válido que represente el idioma primario del documento.
13. **Procedimiento de Autoverificación - Contraste:** Analizar el CSS/HTML para asegurar que las clases de color cumplen con las relaciones de contraste establecidas.
14. **Procedimiento de Autoverificación - Navegación:** Simular mentalmente el orden de tabulación (`tabindex`) para confirmar que es natural y secuencial.
15. **Procedimiento de Autoverificación - Lectores de Pantalla:** Verificar que los elementos no textuales relevantes tienen equivalentes textuales descriptivos.
16. **Procedimiento de Autoverificación - Errores de Validación:** Ejecutar un linter de accesibilidad (ej. axe-core si está configurado) y asegurar cero violaciones de nivel crítico.
17. **Procedimiento de Autoverificación - Zoom de Texto:** Asegurar que la interfaz sigue siendo legible y funcional cuando se escala el texto al 200%.
18. **Procedimiento de Autoverificación - Atributos Duplicados:** Confirmar que no existen IDs duplicados en el DOM que puedan romper la accesibilidad.
19. **Procedimiento de Autoverificación - Reporte:** Verificar que el archivo `docs/qa/a11y_report.md` detalla todas las pruebas de conformidad WCAG 2.1/2.2 AA realizadas.
20. **Límite de Seguridad:** Máximo 3 intentos de autoverificación y auto-corrección. Si tras 3 intentos no se cumplen las condiciones, detener la ejecución y escalar la alerta.

---

[STEPS]

### Solo Mode (Interactivo / Usuario)
1. Analizar el código HTML o componentes de la interfaz de usuario.
2. Identificar violaciones de contraste, falta de roles semánticos o navegación por teclado.
3. Guardar el reporte de auditoría en `docs/qa/a11y_report.md` y registrar en el contrato.

### Orchestrated Mode (Coordinado / SDD Pipeline)
1. Evaluar el HTML renderizado de los componentes.
2. Generar reporte de a11y y actualizar el contrato.

---

[OUTPUT]

Al completar su ejecución, la skill debe:
1. Generar los artefactos y archivos resultantes especificados en su modo de ejecución.
2. Escribir/Actualizar un contrato de estado en el archivo de estado de la skill (especificado por la configuración de la tarea o en Engram). El formato del contrato debe cumplir con el esquema definido en:
   - [contract.d.ts](references/contract.d.ts)

---

[REFERENCES]

- [contract.d.ts](references/contract.d.ts) — Interfaz TypeScript del contrato de datos de la skill.
- [wcag-criteria.md](references/wcag-criteria.md) — Listado y verificación de criterios WCAG 2.1 AA.
- [axe-assertions.md](references/axe-assertions.md) — Reglas y aserciones automatizadas de a11y.
