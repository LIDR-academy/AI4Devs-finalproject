# Frontend design checklist (operativo)

Checklist rápido para revisar estilo y UX visual en cada ticket de frontend.

> Objetivo: interfaz profesional, moderna y sencilla, sin sobrecomplicar.

---

## 1) Estructura de pantalla

- [ ] Hay una jerarquía clara: título, contexto breve y acción principal.
- [ ] Se reutiliza `section.card` para bloques principales.
- [ ] El layout mantiene consistencia con pantallas existentes.

## 2) Tokens y consistencia visual

- [ ] Se usan tokens de `:root` en `frontend/src/style.css` (sin colores hardcodeados).
- [ ] Se usa la escala de espacios `--space-*` (sin valores aislados innecesarios).
- [ ] Radios/sombras siguen el sistema (`--radius-*`, `--shadow*`).

## 3) Botones y acciones

- [ ] Botones con clases estándar (`btn`, `btn-primary`, `btn-secondary`).
- [ ] Acciones agrupadas en `.actions` con espaciado consistente.
- [ ] Estado `disabled` visible y comprensible.
- [ ] Existe feedback en `hover`, `focus` y `active`.

## 4) Formularios

- [ ] Cada control tiene `label` visible y asociada (`for`/`id`).
- [ ] Inputs usan clases estándar (`form-label`, `form-control`, `field-error`).
- [ ] Placeholder ayuda, pero no sustituye validación.
- [ ] Errores de campo se muestran cerca del control.

## 5) Accesibilidad

- [ ] Focus visible en todos los elementos interactivos.
- [ ] Contraste adecuado de texto, controles y estados.
- [ ] No se transmite información solo por color.
- [ ] Enlaces externos con `rel="noopener noreferrer"` cuando aplique.

## 6) Responsive

- [ ] La vista es usable en móvil (<=720px) y escritorio.
- [ ] Formularios pasan a una sola columna en móvil cuando corresponde.
- [ ] Botones múltiples no se solapan ni rompen el layout.

## 7) Calidad de implementación

- [ ] No hay estilos inline evitables.
- [ ] No se duplican reglas existentes si ya hay clase reusable.
- [ ] Cambios visuales no alteran lógica de negocio ni navegación.
- [ ] Textos de UI en `i18n` (sin hardcodear copy nuevo en componentes).

---

## Referencias rápidas

- Sistema visual: `frontend/src/style.css`
- Shell/layout base: `frontend/src/App.vue`
- Ejemplo home: `frontend/src/views/HomeView.vue`
- Ejemplo formulario: `frontend/src/views/CreateTreeView.vue`
- Guía extendida: `docs/onboarding/frontend-design-guide.md`

