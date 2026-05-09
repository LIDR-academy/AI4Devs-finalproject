# Guía de diseño frontend (MyTreeLibrary)

Guía práctica para desarrolladores sobre cómo mantener una interfaz **profesional, moderna y sencilla** en el frontend de MyTreeLibrary, sin introducir complejidad innecesaria.

> Alcance: diseño visual y UX de implementación (no lógica de negocio).

---

## 1) Principios de diseño del proyecto

1. **Claridad primero**: cada pantalla debe comunicar qué hacer en 3 segundos.
2. **Jerarquía visual**: título claro, texto de apoyo breve, acción principal visible.
3. **Consistencia**: los mismos patrones deben verse y comportarse igual.
4. **Sencillez**: evitar adornos; priorizar lectura y flujo de tareas.
5. **Accesibilidad base**: foco visible, contraste correcto, controles legibles.

---

## 2) Tokens de diseño (fuente de verdad)

La fuente canónica de estilos globales está en `frontend/src/style.css`, bloque `:root`.

### 2.1 Color

- Fondo y superficies: `--bg`, `--bg-soft`, `--surface`, `--surface-elevated`
- Texto: `--text`, `--muted`
- Marca/acción: `--primary`, `--primary-hover`, `--primary-soft`
- Feedback: `--danger`, `--success`
- Bordes y foco: `--border`, `--border-strong`, `--focus-ring`

**Regla:** no hardcodear colores en componentes salvo casos excepcionales documentados.

### 2.2 Espaciado

Usar escala de espacios para mantener ritmo visual:

- `--space-1`, `--space-2`, `--space-3`, `--space-4`, `--space-5`, `--space-6`, `--space-8`

**Regla:** evitar valores sueltos (`13px`, `19px`) si ya existe un token equivalente.

### 2.3 Forma y profundidad

- Radios: `--radius-sm`, `--radius`, `--radius-lg`
- Sombras: `--shadow`, `--shadow-soft`

**Regla:** usar sombra solo para separar capas (cards/CTA), no como decoración.

---

## 3) Tipografía y jerarquía

- Fuente base: `Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif`
- Priorizar escala breve y estable:
  - Marca/títulos principales con `clamp(...)`
  - Texto de apoyo en color `--muted`
- Usar ancho de lectura razonable en textos largos (`max-width` por caracteres cuando aplique).

**Checklist de jerarquía por pantalla:**

- [ ] Título único y claro
- [ ] Descripción breve (1-2 líneas)
- [ ] Acción principal visible sin scroll (si es posible)

---

## 4) Componentes base y patrón visual

### 4.1 Layout

- Contenedor principal: `.container`
- Tarjeta estándar: `.card`
- Secciones de formulario: `.field`, `.field-full`

### 4.2 Botones

- Primario: `.btn .btn-primary`
- Secundario: `.btn .btn-secondary`
- Agrupación: `.actions`

Estados mínimos obligatorios:

- hover
- focus visible
- disabled (opacidad + cursor)
- active (microfeedback leve)

### 4.3 Formularios

- Etiquetas: `.form-label`
- Controles: `.form-control`
- Textarea: `.form-textarea`
- Error de campo: `.field-error`

Reglas:

- Siempre `label` visible y asociada (`for` + `id`)
- Placeholder como ayuda breve, no como sustituto de validación
- Feedback de error cercano al campo

### 4.4 Feedback de estado

- Mensajes informativos: `.status-note`
- Errores globales: `.error`
- Éxito: `.success`

---

## 5) Responsive (sin sobreingeniería)

Breakpoint base actual: `@media (max-width: 720px)`.

Patrones:

- Formularios en una columna en móvil.
- Botones principales al 100% en móvil cuando hay más de una acción.
- Evitar alturas fijas que rompan contenido dinámico.

---

## 6) Accesibilidad mínima obligatoria

- Focus visible en todos los controles interactivos.
- Contraste suficiente entre texto y fondo.
- Tamaño táctil razonable en botones/campos.
- `role`/`aria-*` donde aporte semántica real (errores, regiones dinámicas, mapas).

No permitido:

- Quitar outline sin reemplazarlo por focus equivalente.
- Basar el estado solo en color sin apoyo textual.

---

## 7) Guía de implementación para nuevas pantallas

Cuando crees una vista nueva en `frontend/src/views`:

1. Estructura base:
   - `section.card`
   - título + texto de apoyo
   - bloque de acciones (`.actions`)
2. Usa clases y tokens existentes antes de crear nuevos.
3. Si falta un patrón reutilizable, añádelo en `style.css` con nombre semántico.
4. Revisa en móvil y escritorio antes de cerrar.

---

## 8) Anti-patrones a evitar

- Duplicar estilos de botón o input por componente.
- Añadir estilos inline para resolver casos rápidos.
- Hardcodear colores/tamaños ignorando tokens.
- Introducir animaciones llamativas sin objetivo UX.
- Mezclar cambios visuales con refactors de lógica no relacionados.

---

## 9) Checklist de revisión visual en PR

- [ ] Se usan tokens de color/espacio/radio/sombra
- [ ] Botones y campos mantienen patrón existente
- [ ] Focus visible y estados claros
- [ ] Vista usable en móvil
- [ ] No se rompe consistencia con Home/CreateTree/App
- [ ] Cambios solo visuales (sin impacto funcional)

---

## 10) Ficheros de referencia rápida

- Estilos globales: `frontend/src/style.css`
- Shell de app: `frontend/src/App.vue`
- Ejemplo landing/home: `frontend/src/views/HomeView.vue`
- Ejemplo formulario: `frontend/src/views/CreateTreeView.vue`
- Reglas Vue/UX/seguridad:
  - `.cursor/rules/frontend-vue3.mdc`
  - `.cursor/rules/frontend-ux.mdc`
  - `.cursor/rules/frontend-security.mdc`

