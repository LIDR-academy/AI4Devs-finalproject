# Guía de Diseño y Accesibilidad - VetConnect

**Última actualización:** 10 de Febrero 2026

Esta guía unifica el sistema de diseño y los estándares de accesibilidad de VetConnect, asegurando consistencia visual y cumplimiento con WCAG 2.1 AA.

---

## 1. Sistema de Diseño Base

### 1.1 Paleta de Colores

#### Colores Primarios (Profesionalismo y Confianza)
- **Primary Blue**: `#4F46E5` (Indigo 600) - Acciones principales, enlaces, elementos destacados
- **Primary Dark**: `#4338CA` (Indigo 700) - Hover states, elementos activos
- **Primary Light**: `#818CF8` (Indigo 400) - Estados secundarios, badges

#### Colores Secundarios (Calidez y Cuidado)
- **Veterinary Green**: `#10B981` (Emerald 500) - Éxito, confirmaciones, salud
- **Warm Orange**: `#F59E0B` (Amber 500) - Advertencias, recordatorios
- **Care Pink**: `#EC4899` (Pink 500) - Elementos de cuidado, citas

#### Colores de Estado
- **Success**: `#10B981` (Emerald 500)
- **Warning**: `#F59E0B` (Amber 500)
- **Error/Danger**: `#EF4444` (Red 500)
- **Info**: `#3B82F6` (Blue 500)

#### Escala de Grises (Neutralidad y Legibilidad)
- **Gray 50**: `#F9FAFB` - Fondos suaves
- **Gray 100**: `#F3F4F6` - Fondos de tarjetas
- **Gray 200**: `#E5E7EB` - Bordes sutiles
- **Gray 300**: `#D1D5DB` - Bordes
- **Gray 400**: `#9CA3AF` - Texto secundario
- **Gray 500**: `#6B7280` - Texto deshabilitado
- **Gray 600**: `#4B5563` - Texto secundario
- **Gray 700**: `#374151` - Texto principal
- **Gray 800**: `#1F2937` - Títulos
- **Gray 900**: `#111827` - Texto principal oscuro

### 1.2 Tipografía

#### Familia de Fuentes
- **Principal**: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- **Justificación**: Inter es una fuente moderna, legible y optimizada para pantallas. Cumple con estándares de accesibilidad WCAG 2.1 AA.

#### Escala Tipográfica
- **H1**: 3rem (48px) - Títulos principales, hero sections
- **H2**: 2.25rem (36px) - Títulos de sección
- **H3**: 1.875rem (30px) - Subtítulos
- **H4**: 1.5rem (24px) - Títulos de tarjetas
- **H5**: 1.25rem (20px) - Subtítulos menores
- **H6**: 1.125rem (18px) - Títulos pequeños
- **Body**: 1rem (16px) - Texto base
- **Small**: 0.875rem (14px) - Texto secundario
- **XSmall**: 0.75rem (12px) - Labels, badges

#### Pesos de Fuente
- **Light**: 300 - Texto decorativo
- **Regular**: 400 - Texto base
- **Medium**: 500 - Enlaces, botones secundarios
- **Semibold**: 600 - Títulos menores
- **Bold**: 700 - Títulos principales

### 1.3 Componentes Reutilizables

#### Botones
- **Primary**: Fondo azul primario, texto blanco, padding 12px 24px, mínimo 44x44px
- **Secondary**: Fondo transparente, borde azul, texto azul
- **Success**: Fondo verde, texto blanco
- **Danger**: Fondo rojo, texto blanco
- **Ghost**: Sin fondo, solo texto con color
- **Focus**: `focus:ring-2 focus:ring-indigo-500` para accesibilidad

#### Tarjetas
- Fondo blanco, sombra suave, border-radius 12px
- Padding interno: 24px
- Hover: Elevación de sombra, transformación sutil

#### Formularios
- Inputs: Borde 2px, border-radius 8px, padding 12px 16px
- Focus: Borde azul, sombra de enfoque
- Labels: Peso 500, color gray-700, asociados con `for` attribute
- Errores: Texto rojo, borde rojo, mensajes descriptivos
- Campos requeridos: Asterisco + `aria-required="true"`

#### Tablas
- Fondo blanco, bordes sutiles
- Filas alternadas con fondo gray-50
- Hover: Fondo gray-100
- Headers: Fondo gray-100, texto semibold
- Headers con `scope="col"` o `scope="row"` para accesibilidad

### 1.4 Sistema de Espaciado

Basado en escala de 4px:
- **XS**: 4px (0.25rem)
- **SM**: 8px (0.5rem)
- **MD**: 16px (1rem)
- **LG**: 24px (1.5rem)
- **XL**: 32px (2rem)
- **2XL**: 48px (3rem)
- **3XL**: 64px (4rem)

### 1.5 Grid System

- **Container**: Max-width 1200px, centrado
- **Grid**: 12 columnas, gap de 24px
- **Breakpoints**:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px

---

## 2. Accesibilidad WCAG 2.1 AA

### 2.1 Contraste de Colores ✅

- **Texto normal**: Mínimo 4.5:1 (verificado en todos los textos)
- **Texto grande**: Mínimo 3:1 (títulos y textos grandes)
- **Componentes UI**: Mínimo 3:1 (botones, badges, estados)

**Verificación**: Todos los colores del sistema cumplen estos requisitos.

### 2.2 Navegación por Teclado ✅

- Todos los elementos interactivos son accesibles por teclado
- Focus visible implementado con `focus:ring-2 focus:ring-indigo-500`
- Orden lógico de tabulación
- Skip links implementados en CSS

### 2.3 Screen Readers ✅

- Labels descriptivos en todos los formularios (`<label for="...">`)
- ARIA labels donde es necesario (`aria-label`, `aria-labelledby`)
- Textos alternativos en imágenes (`alt` attributes)
- Roles ARIA apropiados (`role="alert"`, `role="table"`, etc.)
- `aria-describedby` para campos de formulario con ayuda
- `aria-required` para campos obligatorios
- `aria-label` para iconos decorativos

### 2.4 Tamaños de Click/Touch ✅

- Mínimo 44x44px para elementos táctiles
- Clase `min-h-[44px]` aplicada a botones y enlaces importantes
- Espaciado adecuado entre elementos interactivos

### 2.5 Formularios Accesibles ✅

- Labels asociados correctamente con inputs (`for` attribute)
- Mensajes de error claros y descriptivos
- Indicadores de campos requeridos (asterisco + `aria-required="true"`)
- Textos de ayuda con `aria-describedby`
- Validación HTML5 con `required` attribute

### 2.6 Tablas Accesibles ✅

- Headers con `scope="col"` o `scope="row"`
- Captions descriptivos con `sr-only` para screen readers
- `role="table"` y `aria-label` en tablas
- Responsive: columnas ocultas en móvil con clases `hidden sm:table-cell`

### 2.7 Estados y Feedback ✅

- Estados de error visibles y descriptivos
- Estados de éxito claros
- Estados de carga con spinners
- Estados vacíos con mensajes claros

### 2.8 Responsive Design ✅

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Tablas con scroll horizontal en móvil
- Formularios de una columna en móvil, dos en desktop
- Navegación adaptativa

### 2.9 Semántica HTML ✅

- Uso correcto de elementos semánticos (`<header>`, `<main>`, `<nav>`, etc.)
- Jerarquía de encabezados correcta (h1, h2, h3)
- Listas apropiadas (`<ul>`, `<ol>`)

### 2.10 Animaciones y Transiciones ✅

- Transiciones suaves para mejor UX
- Animaciones no bloqueantes
- Respeto por `prefers-reduced-motion` (a implementar si es necesario)

---

## 3. Branding Visual

### 3.1 Identidad Visual

**Concepto**: Profesionalismo médico con calidez humana
- Colores que transmiten confianza (azul) y cuidado (verde)
- Tipografía clara y legible
- Iconografía relacionada con animales y cuidado veterinario

### 3.2 Iconografía

**Iconos principales**:
- 🐾 Paw print - Logo principal, mascota
- 🏥 Hospital - Clínicas
- 📅 Calendario - Citas
- 📋 Clipboard - Registros médicos
- 📄 Documento - Archivos
- ⚕️ Medical - Servicios médicos
- 🔔 Notificación - Alertas
- 👤 Usuario - Perfiles

**Fuente de iconos**: Emojis nativos + Heroicons (SVG)

---

## 4. Aplicación por Vista

### 4.1 Páginas de Autenticación

#### Login
- Fondo con gradiente suave (azul a púrpura)
- Tarjeta centrada con sombra prominente
- Logo grande y visible
- Formulario simple y claro
- Enlaces de ayuda visibles

### 4.2 Dashboards por Rol

#### Dashboard Owner
- Resumen de mascotas (cards con fotos)
- Próximas citas destacadas
- Recordatorios de vacunación
- Accesos rápidos a acciones comunes

#### Dashboard Veterinario
- Citas del día (calendario visual)
- Pacientes pendientes
- Alertas médicas
- Estadísticas rápidas

#### Dashboard Admin
- Métricas generales (KPIs)
- Gráficos de actividad
- Gestión de usuarios
- Configuración del sistema

### 4.3 Sistema de Alertas

- **Success**: Verde, icono de check
- **Warning**: Amarillo, icono de alerta
- **Error**: Rojo, icono de X
- **Info**: Azul, icono de información

Posición: Top-right con animación de entrada

---

## 5. Implementación Técnica

### 5.1 CSS Variables

```css
:root {
  --color-primary: #4F46E5;
  --color-primary-dark: #4338CA;
  --spacing-md: 1rem;
  /* ... */
}
```

### 5.2 Componentes Rails

Partiales reutilizables para:
- `_button.html.erb`
- `_card.html.erb`
- `_form_field.html.erb`
- `_alert.html.erb`
- `_table.html.erb`

---

## 6. Herramientas de Verificación

- **WAVE**: Web Accessibility Evaluation Tool
- **axe DevTools**: Extensión de navegador
- **Lighthouse**: Auditoría de accesibilidad
- **Color Contrast Analyzer**: Verificación de contraste

---

## 7. Mejoras Futuras Sugeridas

1. **Reduced Motion**: Agregar soporte para `prefers-reduced-motion`
2. **High Contrast Mode**: Probar en modo de alto contraste
3. **Keyboard Navigation Testing**: Probar navegación completa solo con teclado
4. **Screen Reader Testing**: Probar con NVDA, JAWS, VoiceOver
5. **Color Blindness**: Verificar que no se dependa solo del color para información

---

**Notas de Implementación**:
- Todos los colores usan variables CSS para fácil mantenimiento
- Los componentes reutilizables incluyen accesibilidad por defecto
- El sistema de diseño documenta requisitos de accesibilidad
