---
name: frontend-architect
description: "Frontend Architect, Implementar Frontend, Arquitectura Frontend, Ui Implementation. Diseña e implementa historias técnicas de frontend, gestiona su ciclo de vida y coordina con testing y backend skills."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "3.3"
---
[ACTIVATION]

Esta skill se activa cuando la tarea o el contexto del usuario requiere realizar acciones sobre frontend-architect o incluye las siguientes palabras clave/desencadenadores:
**Triggers:** frontend architect, implementar frontend, arquitectura frontend, UI implementation

---

[RULES]

1. **Component isolation:** Todo componente UI debe ser reutilizable y libre de lógica de negocio pesada.
2. **Accessibility (a11y):** Cumplir con WCAG 2.1 AA en contraste, tags ARIA y navegación por teclado.

---

[GATES]

| Condición | Acción | Destino / Fase |
| :--- | :--- | :--- |
| Falta accesibilidad en componentes de UI | Agregar etiquetas ARIA y estados de foco | Refactor UI |
| Implementación de UI requerida | Generar código de frontend basado en el diseño | Implementación |


---

[HARNESS]

1. **Aislamiento de Lógica:** Queda prohibido mezclar llamadas directas a APIs o lógica pesada de negocio dentro de componentes puramente visuales o de presentación.
2. **Prop Types o Tipado Estricto:** Todos los componentes de interfaz deben definir tipos o interfaces TypeScript estrictas para sus propiedades (Props).
3. **No Variables CSS Inline:** No utilizar valores de colores, márgenes o tipografías inline. Usar el sistema global de variables CSS o tokens de diseño.
4. **Responsive por Defecto:** Todo componente visual debe ser responsive y utilizar layouts fluidos (Flexbox/Grid), evitando anchos fijos en píxeles.
5. **Accesibilidad Integrada:** Todos los elementos interactivos deben poseer un indicador de foco visible y orden de tabulación secuencial correcto.
6. **Manejo de Carga y Errores:** Todos los componentes asíncronos deben mostrar explícitamente estados de carga (skeletons/spinners) y de error.
7. **Optimización de Imágenes:** Todo tag de imagen (`<img>`) debe declarar sus dimensiones (width y height) y usar carga perezosa (`loading="lazy"`) cuando proceda.
8. **Sin Fugas de Memoria:** Limpiar los listeners globales, temporizadores o suscripciones en los métodos del ciclo de vida del componente.
9. **Rendimiento de Renderizado:** Evitar renders innecesarios memorizando funciones de callback y valores calculados complejos si es necesario.
10. **Prevención de XSS:** Queda prohibido inyectar HTML crudo (ej. `dangerouslySetInnerHTML`) sin aplicar antes un proceso explícito de sanitización.
11. **Manejo del Historial:** La navegación entre páginas internas debe gestionarse exclusivamente a través del enrutador de la aplicación.
12. **Nombres de Clases Consistentes:** Usar convenciones claras de nomenclatura CSS (ej. BEM, CSS Modules) para evitar colisión de estilos globales.
13. **Procedimiento de Autoverificación - Linting:** Ejecutar el linter del framework frontend y validar que no existen errores de código sin usar.
14. **Procedimiento de Autoverificación - Responsive:** Comprobar visualmente el diseño en anchos de pantalla comunes (375px para móvil, 1440px para escritorio).
15. **Procedimiento de Autoverificación - Consistencia de CSS:** Verificar que no hay estilos duplicados y que todos los colores provienen de los tokens globales.
16. **Procedimiento de Autoverificación - Teclado:** Asegurar que es posible completar el flujo principal utilizando exclusivamente la tecla Tab y Enter.
17. **Procedimiento de Autoverificación - Bundler:** Validar que el build de producción compila correctamente sin lanzar warnings de dependencias perdidas.
18. **Procedimiento de Autoverificación - Alt tags:** Confirmar que no hay tags `<img>` interactivos sin su respectivo texto alternativo descriptivo.
19. **Procedimiento de Autoverificación - Estado Local:** Validar que el estado global no es abusado para almacenar datos efímeros que pertenecen al estado local.
20. **Límite de Seguridad:** Máximo 3 intentos de autoverificación y auto-corrección. Si tras 3 intentos no se cumplen las condiciones, detener la ejecución y escalar la alerta.

---

[STEPS]

### Solo Mode (Interactivo / Usuario)
1. Cargar y comprender los wireframes y especificaciones del PRD.
2. Generar la estructura de componentes de UI respetando los lineamientos de diseño de la aplicación.
3. Escribir el código en la carpeta correspondiente del framework (ej. React/Vite) y reportar en el contrato.

### Orchestrated Mode (Coordinado / SDD Pipeline)
1. Leer referencias del diseño e implementar los componentes frontend requeridos.
2. Generar código en `src/components/` y validar su correcta carga y compilación.
3. Actualizar el contrato de estado.

---

[OUTPUT]

Al completar su ejecución, la skill debe:
1. Generar los artefactos y archivos resultantes especificados en su modo de ejecución.
2. Escribir/Actualizar un contrato de estado en el archivo de estado de la skill (especificado por la configuración de la tarea o en Engram). El formato del contrato debe cumplir con el esquema definido en:
   - [contract.d.ts](references/contract.d.ts)

---

[REFERENCES]

- [contract.d.ts](references/contract.d.ts) — Interfaz TypeScript del contrato de datos de la skill.
- [a11y-testing](file:///Users/develop/Workspace/Courses/LidrCo/AI4Devs/AI4Devs-finalproject/.agents/skills/a11y-testing/SKILL.md) — Verificador de accesibilidad.
- [ui-guidelines.md](references/ui-guidelines.md) — Guía de estilo visual y componentes.
