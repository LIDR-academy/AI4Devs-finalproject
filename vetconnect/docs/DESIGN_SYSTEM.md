# Sistema de Diseño VetConnect

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
- **Primary**: Fondo azul primario, texto blanco, padding 12px 24px
- **Secondary**: Fondo transparente, borde azul, texto azul
- **Success**: Fondo verde, texto blanco
- **Danger**: Fondo rojo, texto blanco
- **Ghost**: Sin fondo, solo texto con color

#### Tarjetas
- Fondo blanco, sombra suave, border-radius 12px
- Padding interno: 24px
- Hover: Elevación de sombra, transformación sutil

#### Formularios
- Inputs: Borde 2px, border-radius 8px, padding 12px 16px
- Focus: Borde azul, sombra de enfoque
- Labels: Peso 500, color gray-700
- Errores: Texto rojo, borde rojo

#### Tablas
- Fondo blanco, bordes sutiles
- Filas alternadas con fondo gray-50
- Hover: Fondo gray-100
- Headers: Fondo gray-100, texto semibold

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

## 2. Branding Visual

### 2.1 Identidad Visual

**Concepto**: Profesionalismo médico con calidez humana
- Colores que transmiten confianza (azul) y cuidado (verde)
- Tipografía clara y legible
- Iconografía relacionada con animales y cuidado veterinario

### 2.2 Iconografía

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

### 2.3 Elementos de Confianza

- **Badges de certificación**: "Clínica Certificada"
- **Testimonios**: Sección de reseñas
- **Estadísticas**: Números de éxito
- **Garantías**: Políticas claras de privacidad

## 3. Aplicación por Vista

### 3.1 Páginas de Autenticación

#### Login
- Fondo con gradiente suave (azul a púrpura)
- Tarjeta centrada con sombra prominente
- Logo grande y visible
- Formulario simple y claro
- Enlaces de ayuda visibles

#### Registro
- Mismo estilo que login
- Formulario multi-paso para mejor UX
- Validación en tiempo real
- Indicadores de progreso

#### Recuperación de Contraseña
- Diseño minimalista
- Instrucciones claras
- Confirmación visual

### 3.2 Dashboards por Rol

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

### 3.3 Vistas de Tablas

- Filtros visibles y accesibles
- Búsqueda prominente
- Paginación clara
- Acciones por fila (hover)
- Estados visuales (badges de color)

### 3.4 Formularios

- Layout de dos columnas en desktop
- Una columna en mobile
- Validación visual inmediata
- Botones de acción claramente diferenciados
- Confirmaciones antes de acciones destructivas

### 3.5 Sistema de Alertas

- **Success**: Verde, icono de check
- **Warning**: Amarillo, icono de alerta
- **Error**: Rojo, icono de X
- **Info**: Azul, icono de información

Posición: Top-right con animación de entrada

### 3.6 Estados

#### Estado Vacío
- Ilustración o icono grande
- Mensaje claro y amigable
- Call-to-action para crear contenido

#### Estado de Carga
- Spinner animado
- Mensaje de "Cargando..."
- Skeleton screens para mejor percepción

#### Estado de Error
- Mensaje claro del error
- Acciones sugeridas
- Botón para reintentar

## 4. Responsive Design

### Mobile First
- Diseño optimizado para móviles
- Navegación hamburguesa
- Tarjetas apiladas verticalmente
- Formularios de una columna

### Tablet
- Grid de 2 columnas
- Navegación lateral colapsable
- Tablas con scroll horizontal

### Desktop
- Grid completo
- Navegación lateral fija
- Tablas completas visibles

## 5. Accesibilidad WCAG 2.1 AA

### Contraste
- Texto normal: mínimo 4.5:1
- Texto grande: mínimo 3:1
- Componentes UI: mínimo 3:1

### Navegación por Teclado
- Todos los elementos interactivos accesibles
- Focus visible y claro
- Orden lógico de tabulación

### Screen Readers
- Labels descriptivos
- ARIA labels donde sea necesario
- Textos alternativos en imágenes

### Tamaños de Click
- Mínimo 44x44px para elementos táctiles
- Espaciado adecuado entre elementos

## 6. Implementación Técnica

### CSS Variables
```css
:root {
  --color-primary: #4F46E5;
  --color-primary-dark: #4338CA;
  --spacing-md: 1rem;
  /* ... */
}
```

### Tailwind Config
Extensión de Tailwind con colores personalizados y componentes.

### Componentes Rails
Partiales reutilizables para:
- `_button.html.erb`
- `_card.html.erb`
- `_form_field.html.erb`
- `_alert.html.erb`
- `_table.html.erb`
