# RunMarket — Design System

> Extraído del prototipo Figma Make (`fileKey: 0wtedXb5138odnAOgHlMiA`).
> Fuente de verdad visual para la implementación del frontend.

---

## 1. Tokens de color

Los tokens viven en `frontend/src/app/globals.css` como CSS custom properties y se mapean a clases Tailwind v4 vía `@theme inline`.

### 1.1 Paleta base (shadcn)

| Token CSS | Valor | Uso |
|---|---|---|
| `--background` | `#ffffff` | Fondo de página |
| `--foreground` | `oklch(0.145 0 0)` ≈ `#111` | Texto principal |
| `--card` | `#ffffff` | Fondo de tarjetas |
| `--primary` | `#030213` | Texto de marca, botón primario |
| `--primary-foreground` | `#ffffff` | Texto sobre botón primario |
| `--muted` | `#ececf0` | Fondos suaves, skeletons |
| `--muted-foreground` | `#717182` | Texto secundario / placeholders |
| `--accent` | `#e9ebef` | Hover backgrounds |
| `--destructive` | `#d4183d` | Errores, acciones destructivas |
| `--border` | `rgba(0,0,0,0.1)` | Bordes de cards, inputs |
| `--input-background` | `#f3f3f5` | Fondo de inputs |
| `--radius` | `0.625rem` | Radio base (10px) |

### 1.2 Tokens RunMarket (semánticos)

Accesibles como clases Tailwind: `bg-rm-*` / `text-rm-*`.

#### Etiquetas de nivel (ProductCard)

| Nivel | `bg-rm-*` | `text-rm-*` | Hex bg | Hex text |
|---|---|---|---|---|
| `beginner` → Principiante | `bg-rm-level-beginner-bg` | `text-rm-level-beginner-text` | `#dcfce7` (green-100) | `#16a34a` (green-600) |
| `intermediate` → Popular | `bg-rm-level-intermediate-bg` | `text-rm-level-intermediate-text` | `#dbeafe` (blue-100) | `#1d4ed8` (blue-700) |
| `advanced` → Avanzado | `bg-rm-level-advanced-bg` | `text-rm-level-advanced-text` | `#ffedd5` (orange-100) | `#c2410c` (orange-700) |

**Uso en código:**
```tsx
const LEVEL_CONFIG = {
  beginner:     { label: 'Principiante', bg: 'bg-rm-level-beginner-bg',     text: 'text-rm-level-beginner-text' },
  intermediate: { label: 'Popular',      bg: 'bg-rm-level-intermediate-bg', text: 'text-rm-level-intermediate-text' },
  advanced:     { label: 'Avanzado',     bg: 'bg-rm-level-advanced-bg',     text: 'text-rm-level-advanced-text' },
} as const;
```

#### Estados de pedido (OrderBadge)

| Status | `bg-rm-*` | `text-rm-*` | Color |
|---|---|---|---|
| `processing` | `bg-rm-status-processing-bg` | `text-rm-status-processing-text` | Azul |
| `shipped` | `bg-rm-status-shipped-bg` | `text-rm-status-shipped-text` | Ámbar |
| `delivered` | `bg-rm-status-delivered-bg` | `text-rm-status-delivered-text` | Verde |
| `cancelled` | `bg-rm-status-cancelled-bg` | `text-rm-status-cancelled-text` | Rojo |

#### CTA (botón principal)

| Token | Clase Tailwind | Valor |
|---|---|---|
| `--rm-cta` | `bg-rm-cta` | `#2563eb` (blue-600) |
| `--rm-cta-hover` | `bg-rm-cta-hover` | `#1d4ed8` (blue-700) |
| `--rm-cta-fg` | `text-rm-cta-fg` | `#ffffff` |

> Los CTAs del prototipo usan directamente `bg-blue-600 hover:bg-blue-700 text-white` — ambas clases son equivalentes.

---

## 2. Tipografía

**Base:** `16px` (variable `--font-size`). Sin fuente personalizada en el MVP — se usa la sans-serif del sistema (shadcn default).

| Elemento | Tailwind | Peso | Uso |
|---|---|---|---|
| Título de página (`h1`) | `text-3xl font-bold` | 700 | "Productos para Running" |
| Título de sección (`h2`) | `text-xl font-semibold` | 600 | Nombres de grupo de filtros |
| Subtítulo (`h3`) | `text-lg font-medium` | 500 | Headers de panel |
| Nombre de producto | `text-base font-medium` | 500 | ProductCard título |
| Marca de producto | `text-sm` | 400 | ProductCard — sobre el nombre |
| Precio | `text-xl font-bold` | 700 | ProductCard |
| Cuerpo / descripción | `text-base text-muted-foreground` | 400 | Párrafos genéricos |
| Label de filtro | `text-sm text-gray-700` | 400 | Opciones del FilterPanel |
| Badge / etiqueta | `text-xs` | 400 | Nivel, estado, contador |

**Formato de precio:** `product.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })` → `129,99 €`

---

## 3. Layout y espaciado

### Contenedor principal
```
max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
```

### Header
```
bg-white border-b border-gray-200 sticky top-0 z-50 h-16
```
- Logo: cuadrado azul 32×32px `bg-blue-600 rounded-lg` + texto `text-xl font-bold`
- Carrito badge: `absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5`

### Grid del catálogo
```
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
```

### Panel lateral de filtros
```
lg:w-64 — bg-white rounded-lg shadow-sm p-6 sticky top-20
```

### Footer
```
bg-white border-t border-gray-200 — grid grid-cols-1 md:grid-cols-4 gap-8 py-8
```

### Escala de espaciado frecuente

| Uso | Clase |
|---|---|
| Padding de tarjeta | `p-4` |
| Padding de panel | `p-6` |
| Gap entre secciones | `mb-8` |
| Gap entre elementos de filtro | `space-y-2` |
| Gap entre grupos de filtro | `space-y-6` |
| Gap del grid | `gap-6` |

---

## 4. Componentes

### ProductCard

```
bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden group
├── aspect-square overflow-hidden bg-gray-100
│   └── img  w-full h-full object-cover group-hover:scale-105 transition duration-300
└── p-4
    ├── text-sm text-gray-500           ← marca
    ├── font-medium text-gray-900 line-clamp-2  ← nombre
    ├── badges de nivel  (ver §1.2)
    │   text-xs px-2 py-1 rounded-full
    └── flex justify-between
        ├── text-xl font-bold text-gray-900   ← precio
        └── botón carrito: w-10 h-10 bg-rm-cta rounded-full
```

**Stock bajo** (`stock < 10 && stock > 0`): `text-xs text-rm-stock-low mt-2` — "Solo quedan N unidades"
**Agotado** (`stock === 0`): `text-xs text-rm-stock-out mt-2` — "Agotado"

### FilterPanel (cabecera)

```
flex items-center justify-between mb-6
├── h2  font-bold  + icono Filter + badge contador: bg-blue-600 text-white rounded-full px-2 py-1
└── botón Limpiar: text-sm text-blue-600 hover:text-blue-700  (solo si hay filtros activos)
```

### Botón CTA primario

```
bg-rm-cta text-rm-cta-fg hover:bg-rm-cta-hover transition rounded-lg px-4 py-2 font-medium
```

### EmptyState (sin resultados de filtros)

```
text-center py-12
├── text-gray-500 mb-4  ← mensaje
└── button text-blue-600 hover:text-blue-700 ← "Limpiar filtros"
```

### Badge de estado de pedido

```tsx
const STATUS_CONFIG = {
  processing: { label: 'En proceso',  bg: 'bg-rm-status-processing-bg', text: 'text-rm-status-processing-text' },
  shipped:    { label: 'Enviado',     bg: 'bg-rm-status-shipped-bg',    text: 'text-rm-status-shipped-text'    },
  delivered:  { label: 'Entregado',   bg: 'bg-rm-status-delivered-bg',  text: 'text-rm-status-delivered-text'  },
  cancelled:  { label: 'Cancelado',   bg: 'bg-rm-status-cancelled-bg',  text: 'text-rm-status-cancelled-text'  },
};
// Clase base: text-xs font-medium px-2.5 py-1 rounded-full
```

---

## 5. Mapeos de valores del dominio → etiquetas UI

### Niveles

| Valor BD | Etiqueta ES |
|---|---|
| `beginner` | Principiante |
| `intermediate` | Popular |
| `advanced` | Avanzado |

### Distancias

| Valor BD | Etiqueta ES |
|---|---|
| `5K` | 5K |
| `10K` | 10K |
| `half-marathon` | Media Maratón |
| `marathon` | Maratón |
| `ultra` | Ultra |

### Superficies

| Valor BD | Etiqueta ES |
|---|---|
| `road` | Asfalto |
| `trail` | Montaña / Trail |
| `track` | Pista |
| `mixed` | Mixto |

### Objetivos

| Valor BD | Etiqueta ES |
|---|---|
| `training` | Entrenamiento |
| `competition` | Competición |
| `recovery` | Recuperación |
| `daily` | Uso diario |

### Categorías

| Valor BD | Etiqueta ES |
|---|---|
| `shoes` | Zapatillas |
| `clothing` | Ropa |
| `accessories` | Accesorios |

---

## 6. Constantes de dominio (frontend/src/lib/product-utils.ts)

Centralizar aquí todos los mapeos para evitar duplicación entre componentes:

```typescript
export const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Popular',
  advanced: 'Avanzado',
};

export const LEVEL_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  beginner:     { label: 'Principiante', bg: 'bg-rm-level-beginner-bg',     text: 'text-rm-level-beginner-text' },
  intermediate: { label: 'Popular',      bg: 'bg-rm-level-intermediate-bg', text: 'text-rm-level-intermediate-text' },
  advanced:     { label: 'Avanzado',     bg: 'bg-rm-level-advanced-bg',     text: 'text-rm-level-advanced-text' },
};

export const DISTANCE_LABELS: Record<string, string> = {
  '5K': '5K', '10K': '10K',
  'half-marathon': 'Media Maratón',
  'marathon': 'Maratón',
  'ultra': 'Ultra',
};

export const SURFACE_LABELS: Record<string, string> = {
  road: 'Asfalto', trail: 'Trail', track: 'Pista', mixed: 'Mixto',
};

export const OBJECTIVE_LABELS: Record<string, string> = {
  training: 'Entrenamiento', competition: 'Competición',
  recovery: 'Recuperación', daily: 'Uso diario',
};

export const CATEGORY_LABELS: Record<string, string> = {
  shoes: 'Zapatillas', clothing: 'Ropa', accessories: 'Accesorios',
};

export const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  processing: { label: 'En proceso',  bg: 'bg-rm-status-processing-bg', text: 'text-rm-status-processing-text' },
  shipped:    { label: 'Enviado',     bg: 'bg-rm-status-shipped-bg',    text: 'text-rm-status-shipped-text'    },
  delivered:  { label: 'Entregado',   bg: 'bg-rm-status-delivered-bg',  text: 'text-rm-status-delivered-text'  },
  cancelled:  { label: 'Cancelado',   bg: 'bg-rm-status-cancelled-bg',  text: 'text-rm-status-cancelled-text'  },
};
```

---

## 7. Estados de UI

| Estado | Patrón |
|---|---|
| **Loading** | `animate-pulse` skeleton con `bg-muted rounded` del mismo tamaño que el elemento real |
| **Empty** | Texto `text-muted-foreground` + CTA secundario `text-rm-cta hover:text-rm-cta-hover` |
| **Error** | Bloque `bg-destructive/10 text-destructive rounded-lg p-4` + botón «Reintentar» |
| **Hover card** | `shadow-sm → shadow-md` + `scale-105` en imagen (duration-300) |

---

## 8. Fuente de referencia del prototipo

- **Figma Make:** `https://www.figma.com/make/0wtedXb5138odnAOgHlMiA`
- **Archivos clave leídos:** `src/styles/theme.css`, `src/app/components/ProductCard.tsx`, `src/app/components/Layout.tsx`, `src/app/pages/Home.tsx`
- **Nota:** el prototipo usa React Router v7 (SPA). La implementación usa Next.js 14 App Router con Server Components y rutas equivalentes (`/`, `/product/[id]`, `/cart`, `/checkout`, `/orders`).
