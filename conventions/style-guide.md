# Guía de Estilo de Aura Planning

> Documentación del sistema de diseño extraída de `business-documentation/Aura.pen`

---

## Principios de Diseño

1. **Cálido y Elegante** — Usar fondos crema con tonos tierra para crear una sensación sofisticada e invitadora
2. **Formas Orgánicas** — Preferir radios de esquina generosos (12-16px) sobre esquinas afiladas
3. **Profundidad Sutil** — Usar sombras suaves y bordes claros para capas sin contraste pesado
4. **Jerarquía Tipográfica** — Playfair Display para encabezados (serif elegante), Inter para cuerpo (sans-serif limpio)
5. **Espaciado Consistente** — Seguir unidad base de 4px con múltiplos: 4, 8, 12, 16, 24, 32, 40, 48, 64

---

## Paleta de Colores

### Colores de Marca

| Token | Hex | Uso |
|-------|-----|-------|
| `primary` | `#7C9A72` | Acciones principales, estados de éxito, arco del logo |
| `primary-dark` | `#5C7A52` | Estados hover para primario |
| `primary-light` | `#A8C5A0` | Fondos claros, acentos sutiles |
| `accent` | `#C9A96E` | Acento secundario, arco medio del logo, highlights |
| `accent-light` | `#E0C992` | Estados hover para elementos de acento |
| `secondary` | `#C4918E` | Acento complementario |
| `secondary-light` | `#DDB5B2` | Fondos secundarios claros |

### Fondos

| Token | Hex | Uso |
|-------|-----|-------|
| `bg-cream` | `#FDFBF7` | Fondo de página (por defecto) |
| `bg-surface` | `#F5F0E8` | Fondos de tarjeta sobre crema, fondos de input |
| `bg-dark` | `#2D2A26` | Footer, secciones oscuras |
| `card-bg` | `#FFFFFF` | Tarjetas elevadas |

### Texto

| Token | Hex | Uso |
|-------|-----|-------|
| `text-primary` | `#2D2A26` | Encabezados, contenido principal |
| `text-secondary` | `#6B6560` | Texto de cuerpo, descripciones |
| `text-muted` | `#9B9590` | Subtítulos, placeholders, labels apagados |
| `text-inverse` | `#FDFBF7` | Texto sobre fondos oscuros |

### Bordes

| Token | Hex | Uso |
|-------|-----|-------|
| `border` | `#E8E0D4` | Bordes por defecto sobre fondos claros |
| `border-light` | `#F0EBE3` | Bordes sutiles de tarjeta |

### Colores Semánticos

| Token | Hex | Fondo | Uso |
|-------|-----|-----------|-------|
| `color-success` | `#7C9A72` | `color-success-bg` (`#F0F5EE`) | Estados confirmados |
| `color-warning` | `#D4A054` | `color-warning-bg` (`#FDF6EC`) | Estados pendientes |
| `color-error` | `#C47070` | `color-error-bg` (`#FDF0EF`) | Estados de error, cancelado |
| `color-info` | `#7A9EB5` | `color-info-bg` (`#EEF5F9`) | Estados informativos |

---

## Tipografía

### Familias de Fuentes

| Token | Valor | Uso |
|-------|-------|-------|
| `font-heading` | `Playfair Display` | Encabezados, títulos, nombre de marca |
| `font-body` | `Inter` | Texto de cuerpo, labels, elementos UI |
| `font-caption` | `Inter` | Subtítulos pequeños, metadatos |

### Escala de Tipos

| Elemento | Fuente | Tamaño | Weight | Line Height |
|---------|------|------|--------|-------------|
| Display | Playfair Display | 56px | Normal (400) | 1.2 |
| H1 | Playfair Display | 36px | Normal (400) | 1.2 |
| H2 | Playfair Display | 28px | Normal (400) | 1.2 |
| H3 | Playfair Display | 24px | Normal (400) | 1.2 |
| H4 | Playfair Display | 20px | Normal (400) | 1.2 |
| H5 | Playfair Display | 18px | Normal (400) | 1.2 |
| Body Large | Inter | 18px | Normal (400) | 1.5 |
| Body | Inter | 16px | Normal (400) | 1.5 |
| Body Small | Inter | 14px | Normal (400) | 1.5 |
| Caption | Inter | 13px | Normal (400) | 1.4 |
| Label | Inter | 12px | Medium (500) | 1.4 |
| Overline | Inter | 10px | Normal (400) | 1.4, letter-spacing: 3px |

---

## Sistema de Espaciado

Unidad base: **4px**

| Token | Valor | Uso |
|-------|-------|-------|
| `spacing-1` | 4px | Espaciado ajustado, gaps de iconos |
| `spacing-2` | 8px | Gaps pequeños entre elementos relacionados |
| `spacing-3` | 12px | Espaciado medio-pequeño |
| `spacing-4` | 16px | Espaciado por defecto entre elementos |
| `spacing-6` | 24px | Gaps de sección, padding |
| `spacing-8` | 32px | Gaps grandes entre secciones |
| `spacing-10` | 40px | Espaciado XL |
| `spacing-12` | 48px | Espaciado XXL |
| `spacing-16` | 64px | Divisores de sección |

---

## Radio de Borde

| Token | Valor | Uso |
|-------|-------|-------|
| `radius-sm` | 8px | Elementos pequeños, badges |
| `radius-md` | 12px | Botones, inputs, tarjetas medianas |
| `radius-lg` | 16px | Tarjetas grandes, modales |
| `radius-full` | 999px | Pills, avatares, completamente redondeado |

---

## Sombras

| Token | Valor | Uso |
|-------|-------|-------|
| `shadow-sm` | `#00000008` (8% opacity) | Elevación sutil, estados hover |
| `shadow-md` | `#0000000D` (13% opacity) | Tarjetas, dropdowns |
| `shadow-lg` | `#00000012` (18% opacity) | Modales, paneles elevados |

---

## Componentes

### Botones

**Botón Primario**
- Fondo: `primary` (`#7C9A72`)
- Texto: Blanco (`#FFFFFF`)
- Fuente: Inter 14px Medium
- Padding: 12px vertical, 24px horizontal
- Radio de esquina: `radius-md` (12px)
- Estados: Hover oscurece a `primary-dark`

**Botón Secundario**
- Fondo: Transparente
- Texto: `text-primary`
- Borde: 1px `border`
- Padding: 12px vertical, 24px horizontal
- Radio de esquina: `radius-md` (12px)

**Botón Ghost**
- Fondo: Transparente
- Texto: `text-primary`
- Sin borde
- Padding: 12px vertical, 24px horizontal
- Radio de esquina: `radius-md` (12px)

**Botón de Peligro**
- Fondo: `color-error` (`#C47070`)
- Texto: Blanco
- Fuente: Inter 14px Medium
- Padding: 12px vertical, 24px horizontal
- Radio de esquina: `radius-md` (12px)

### Inputs de Formulario

**Campo de Texto**
- Label: Inter 13px Medium, `text-primary`
- Contenedor de input: `card-bg` con 1px `border`
- Placeholder: Inter 14px, `text-muted`
- Mensaje de error: Inter 12px, `color-error`
- Radio de esquina: `radius-md` (12px)
- Padding: 12px vertical, 16px horizontal

### Badges / Pills de Estado

**Estructura**
- Padding: 6px vertical, 12px horizontal
- Radio de esquina: `radius-full` (999px)
- Fuente: Inter 12px Medium

**Variantes**

| Estado | Fondo | Color de Texto |
|-------|------------|------------|
| Pendiente | `color-warning-bg` (`#FDF6EC`) | `color-warning` (`#D4A054`) |
| Confirmado | `color-success-bg` (`#F0F5EE`) | `color-success` (`#7C9A72`) |
| Cancelado | `color-error-bg` (`#FDF0EF`) | `color-error` (`#C47070`) |

### Tarjetas

**Tarjeta Estándar**
- Fondo: `card-bg` (`#FFFFFF`)
- Borde: 1px `border-light`
- Radio de esquina: `radius-lg` (16px)
- Padding: 24px
- Sombra: `shadow-md`

**Tarjeta de Evento**
- Placeholder de imagen: `bg-surface`, 160px altura
- Padding de contenido: 16px
- Radio de esquina: `radius-lg` (16px)
- Borde: 1px `border-light`

### Avatar

- Forma: Círculo (`radius-full`)
- Tamaño: 40px diámetro (por defecto)
- Fondo: `bg-surface`
- Texto: Inter 14px Medium, `text-secondary`
- Contenido: Iniciales (2 caracteres)

### Barra de Navegación

- Altura: 64px
- Fondo: `card-bg`
- Borde inferior: 1px `border-light`
- Padding horizontal: 32px
- Logo: Playfair Display 20px
- Links de navegación: Inter 14px, `text-secondary`, gap de 32px
- Gap del menú de usuario: 12px

### Estado Vacío

- Contenedor de icono: 80px círculo, `bg-surface`, trazo de icono centrado `text-muted`
- Título: Playfair Display 20px, `text-primary`
- Descripción: Inter 14px, `text-secondary`, max-width para ajuste de texto
- Padding: 48px
- Gap entre elementos: 16px

### Tarjeta de Estadísticas/Métricas

- Fondo: `card-bg`
- Borde: 1px `border-light`
- Radio de esquina: `radius-lg` (16px)
- Padding: 24px
- Label: Inter 13px, `text-secondary`
- Valor: Playfair Display 32px, `text-primary`

---

## Directrices de Layout

### Estructura de Página

- Fondo de página por defecto: `bg-cream`
- Ancho máximo de contenido: 1200px
- Padding de sección: 32px horizontal (mobile: 16px)
- Ritmo vertical: 32px entre secciones mayores

### Layout de Tarjetas

- Gap de tarjeta: 24px
- Ancho de tarjeta: 280-320px típico
- Grid: Auto-fit con columnas min 280px

### Grupos de Botones

- Gap de botón: 16px
- Botones CTA: gap de 16px

---

## Accesibilidad

- Ratio de contraste mínimo: 4.5:1 para texto normal, 3:1 para texto grande
- Estados de focus: Outline visible usando colores de marca
- Elementos interactivos: Target táctil mínimo de 44px
- Tamaño de texto: Usar unidades relativas donde sea posible para escalado

---

## Directrices de Iconos

- Librería: Lucide (por defecto), Feather (alternativa)
- Ancho de trazo: 2px
- Tope de trazo: Round
- Tamaño por defecto: 20-24px para inline, 40px para standalone

---

## Especificaciones de Logo

### Logo Completo
- Marca de icono: 40x40px
- Arco exterior: 2.5px stroke, color `primary`
- Arco medio: 2px stroke, color `accent`
- Punto central: 8px, filled `primary`
- Wordmark: "Aura" (Playfair Display 24px) + "EVENTS" (Inter 10px, 3px letter-spacing)

### Solo Icono
- Igual que marca de icono del logo completo
- Tamaño: 40x40px

---

## Puntos de Rotura Responsive

| Punto de Rotura | Ancho | Uso |
|------------|-------|-------|
| Mobile | < 640px | Columna única, padding reducido |
| Tablet | 640px - 1024px | Grids de 2 columnas |
| Desktop | > 1024px | Layout completo, multi-columna |

---

## Directrices de Animación

- Duración: 150-300ms para micro-interacciones
- Easing: ease-out para entradas, ease-in para salidas
- Transiciones hover: 150ms
- Transiciones de página: 300ms

---

## Anexo: Referencia de Propiedades CSS Personalizadas

```css
:root {
  /* Colors - Brand */
  --color-primary: #7C9A72;
  --color-primary-dark: #5C7A52;
  --color-primary-light: #A8C5A0;
  --color-accent: #C9A96E;
  --color-accent-light: #E0C992;
  --color-secondary: #C4918E;
  --color-secondary-light: #DDB5B2;

  /* Colors - Backgrounds */
  --color-bg-cream: #FDFBF7;
  --color-bg-surface: #F5F0E8;
  --color-bg-dark: #2D2A26;
  --color-card-bg: #FFFFFF;

  /* Colors - Text */
  --color-text-primary: #2D2A26;
  --color-text-secondary: #6B6560;
  --color-text-muted: #9B9590;
  --color-text-inverse: #FDFBF7;

  /* Colors - Borders */
  --color-border: #E8E0D4;
  --color-border-light: #F0EBE3;

  /* Colors - Semantic */
  --color-success: #7C9A72;
  --color-success-bg: #F0F5EE;
  --color-warning: #D4A054;
  --color-warning-bg: #FDF6EC;
  --color-error: #C47070;
  --color-error-bg: #FDF0EF;
  --color-info: #7A9EB5;
  --color-info-bg: #EEF5F9;

  /* Typography */
  --font-heading: 'Playfair Display', serif;
  --font-body: 'Inter', sans-serif;

  /* Spacing */
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-6: 24px;
  --spacing-8: 32px;
  --spacing-10: 40px;
  --spacing-12: 48px;
  --spacing-16: 64px;

  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 999px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.13);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.18);
}
```