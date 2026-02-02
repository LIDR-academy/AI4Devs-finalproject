# TravelSplit MVP - Design System Guide

**Versión:** 2.1.0 (Actualizado con especificaciones de UI_FLOW_DESIGN.md)  
**Autor:** Architect UI/X  
**Stack:** React (TS) + TailwindCSS + Lucide Icons + Shadcn/ui (Base)  
**Última actualización:** 2025-01-02

---

## 1. Visual Language (Look & Feel)

### 1.1 Dirección de Arte: "Modern Friendly"

El diseño busca reducir la tensión social que genera el dinero. No debe parecer una hoja de cálculo aburrida, ni un banco intimidante.

- **Mood:** Colaborativo, Claro, Lúdico pero funcional
- **Formas:** Bordes redondeados generosos (`rounded-xl` o `rounded-2xl`) para evocar amabilidad
- **Estética:** "Clean UI" con toques de color vibrante para acciones principales

### 1.2 Paleta de Color (Tailwind Config)

Diseñado para Light Mode por defecto, con tokens semánticos listos para Dark Mode.

#### Brand Colors (Violeta - Creatividad y Confianza Social)

El violeta se diferencia de los bancos tradicionales (azul) y apps de contabilidad (verde).

```css
/* Tailwind: violet-600 como Primary */
--primary: #7C3AED;              /* Botones, Links, Elementos activos */
--primary-foreground: #FFFFFF;
--primary-light: #DDD6FE;         /* Fondos de items seleccionados (violet-200) */
```

#### Colores Semánticos (Funcionales)

| Uso | Color | Código | Tailwind | Notas |
|-----|-------|--------|----------|-------|
| Deuda (Negativo) | Rojo | `#EF4444` | `red-500` | Usar con moderación para no estresar |
| A favor (Positivo) | Verde | `#10B981` | `emerald-500` | Para saldos a recibir |
| Neutral/Subtle | Gris | `#64748B` | `slate-500` | Textos secundarios, fechas |

#### Fondos y Superficies

- **Background:** `#F8FAFC` (`slate-50`) → Evitar blanco puro `#FFF` para reducir fatiga visual
- **Surface (Cards):** `#FFFFFF` (White) + Sombra suave

### 1.3 Tipografía

Combinación moderna que asegura legibilidad en números y personalidad en títulos.

#### Headings
- **Fuente:** 'Plus Jakarta Sans' (Google Fonts)
- **Características:** Geométrica y moderna
- **Weights:** 600 (Semibold), 700 (Bold)

#### Body & Numbers
- **Fuente:** 'Inter' (Google Fonts)
- **Características:** Indispensable para tablas numéricas (Tabular nums)
- **Weights:** 400 (Regular), 500 (Medium)

---

## 📱 2. Layout & Navegación (Mobile First)

### 2.1 Estructura del Viewport

El diseño asume que el 90% del uso será en móviles (360px - 430px width).

- **Área Segura (Safe Area):** Respetar el notch superior y la barra de home inferior en iOS

**Contenedor Principal:**

```css
.main-container {
  @apply max-w-md mx-auto min-h-screen bg-slate-50 relative pb-24; 
  /* pb-24 asegura espacio para el Bottom Nav */
}
```

### 2.2 Principio de Navegación Coherente

**Jerarquía de Negocio: Viaje → Gastos**

La interfaz debe reflejar la lógica de negocio donde los gastos solo existen dentro de un viaje. La navegación debe ser contextual y coherente:

- **Sin viaje activo:** No se puede crear gastos
- **Dentro de un viaje:** Acción de crear gasto disponible
- **Crear viaje:** Acción primaria y prominente cuando no hay viajes

**Flujo Natural:**

**Flujo completo desde entrada sin autenticación:**
```
Home (no auth) → Login/Register → Home (auth) → Viajes → [Crear Viaje] → Detalle Viaje → Tab Gastos → [Crear Gasto]
```

**Navegación entre autenticación:**
- Home (no auth) → Login → Home (auth)
- Home (no auth) → Register → Login → Home (auth)
- Login → [←] → Home (no auth)
- Register → [←] → Home (no auth)

### 2.3 Bottom Tab Bar (Navegación Principal)

- **Posición:** Barra fija en la parte inferior (`z-50 fixed bottom-0`)
- **Altura:** 64px - 80px

**Items (3 fijos):**

1. **Home/Resumen** (Icono: Home)
   - Vista de resumen general o empty state
   - Acceso rápido a viajes recientes (si existen)

2. **Mis Viajes** (Icono: Map)
   - Lista de todos los viajes del usuario
   - **Acción principal en header:** Botón "Crear Viaje"

3. **Perfil** (Icono: User)
   - Configuración de usuario

**Estados:**

- **Activo:** Icono y texto en color Primary (`violet-600`)
- **Inactivo:** Color `slate-400`

**Nota:** El FAB ha sido eliminado. El botón "Nuevo Gasto" está integrado directamente en el tab de Gastos del detalle del viaje (`TripDetailPage`), arriba de la lista de gastos.

### 2.4 Estructura de Vistas Principales

#### HomePage (`/`)
- **Estado 1 - Usuario No Autenticado:**
  - Botones "Iniciar sesión" y "Crear cuenta"
  - Sin BottomTabBar
  - Icono grande (Map, 64px, color slate-300)
  - Mensaje: "¿Planeando una escapada?"
  - Descripción: "Inicia sesión o regístrate para empezar a dividir gastos"
- **Estado 2 - Usuario Autenticado Sin Viajes:**
  - Empty state con botón "Crear mi primer viaje"
  - Con BottomTabBar
  - Mismo estilo visual que estado 1
- **Estado 3 - Usuario Autenticado Con Viajes:**
  - Resumen con total gastado + viajes recientes (máximo 3)
  - Botón "Ver todos mis viajes" → `/trips`
  - Con BottomTabBar
- **FAB:** Oculto

#### LoginPage (`/login`)
- **Header:** Botón "←" + Título "Iniciar sesión" (navega a `/`)
- **Sin BottomTabBar** (página de autenticación)
- **Fondo:** `bg-slate-50`
- **Card centrado:** `bg-white rounded-2xl shadow-lg p-6 md:p-8 max-w-md`
- **Inputs:** Altura mínima 48px (h-12) para evitar zoom en iOS
- **Manejo de errores:** Card rojo (`bg-red-50 border-red-200`) con mensaje descriptivo
- **Estado de carga:** Botón muestra spinner + texto "Iniciando sesión..."
- **Link a registro:** Parte inferior centrado

#### RegisterPage (`/register`)
- **Header:** Botón "←" + Título "Crear cuenta" (navega a `/`)
- **Sin BottomTabBar** (página de autenticación)
- **Mismo estilo que LoginPage** para coherencia visual
- **Campos:** Nombre, Email, Contraseña
- **Validación visual:** Errores específicos (email duplicado, contraseña corta)
- **Estado de carga:** Botón muestra spinner + texto "Registrando..."
- **Link a login:** Parte inferior centrado

#### TripsListPage (`/trips`)
- **Header:** Título "Mis Viajes" + Botón "Crear Viaje" (prominente)
- **Contenido:** Lista de `TripCard` con todos los viajes
- **Empty state:** Si no hay viajes, mostrar empty state con botón
- **FAB:** Oculto

#### CreateTripPage (`/trips/new`)
- **Formulario:** Input para nombre del viaje
- **Información:** Moneda COP (fija) + código único
- **Acción:** Botón "Crear Viaje" → Redirige a `/trips/:tripId`
- **FAB:** Oculto

#### TripDetailPage (`/trips/:tripId`)
- **Header:** Nombre del viaje + Menú acciones (solo CREATOR)
- **Tabs:** [Gastos] [Saldos] [Participantes] - Sticky top
- **Contenido:** Según tab activo
- **Botón "Nuevo Gasto":** ✅ **Solo en tab de Gastos**, arriba de la lista → `/trips/:tripId/expenses/new`

#### ExpenseFormPage (`/trips/:tripId/expenses/new`)
- **Formulario completo:** Título, Monto, Categoría, Pagador, Beneficiarios, Foto
- **Acción:** Botón "Crear Gasto" → Vuelve a `/trips/:tripId`
- **FAB:** Oculto (en formulario)

---

## 3. Componentes Clave (Atomic Specs)

### 3.1 Tarjetas de Viaje (Trip Card)

Componente para mostrar viajes en listas (HomePage, TripsListPage).

- **Layout:** Card completo con información resumida
- **Contenido:**
  - **Nombre del viaje:** `text-lg font-heading font-semibold text-slate-900`
  - **Participantes:** Icono `Users` + número (`text-sm text-slate-500`)
  - **Total gastado:** `text-base font-semibold text-slate-900` (formato moneda)
  - **Fecha:** `text-sm text-slate-500` (formato relativo: "Hoy", "Ayer", "Hace X días")
- **Microinteracción:** Active: `scale-98` al tocar para navegar a detalle
- **Acción:** Click navega a `/trips/:tripId`

### 3.2 Tarjetas de Gasto (Expense Card)

El componente más repetido en el feed de gastos dentro de un viaje.

- **Layout:** Flex row (Izquierda: Icono/Categoría | Centro: Título y Pagador | Derecha: Monto)
- **Iconografía:** Círculo con fondo suave (`bg-slate-100`) + Icono de categoría (Ej: Utensils para comida)
- **Microinteracción:** Active: `scale-98` al tocar para ver detalles
- **Acciones (solo CREATOR):** Botones "Editar" y "Eliminar" pequeños en esquina superior derecha

#### Formato de Moneda (COP)

- **SIEMPRE sin decimales:** `$ 25.000` (No `$25.000,00`)
- Usar separador de miles (punto)

### 3.3 Visualización de Saldos (Texto Simple)

Para cumplir con el requerimiento de claridad:

- **Contenedor:** Card con borde suave
- **List Item:**
  - **Texto:** "Juan debe a Pedro" (Pedro en negrita)
  - **Valor:** Badge/Pastilla a la derecha

**Estados de Badge:**

- **Si soy Juan (Debo):** Badge Rojo suave (`bg-red-100 text-red-700`) → `$ 50.000`
- **Si soy Pedro (Me deben):** Badge Verde suave (`bg-emerald-100 text-emerald-700`) → `$ 50.000`

### 3.4 Inputs de Formulario (Mobile Optimized)

- **Altura mínima:** 48px (Touch target estándar)
- **Font Size:** 16px (Evita zoom automático en iOS)

#### Input de Monto

- Tamaño grande (`text-3xl`)
- Centrado o alineado a la derecha
- Prefijo "$" fijo en color gris

#### Selector de Categoría

Scroll horizontal de "Pills" (Pastillas) o Grid de Iconos grandes.

### 3.5 Carga de Evidencia (Opcional)

- **UI:** Botón secundario/Ghost con icono de cámara (`Camera`)
- **Texto:** "Añadir foto (Opcional)"
- **Estado Cargado:** Muestra miniatura pequeña (thumbnail) de 48x48px rounded + botón "X" para quitar

### 3.6 Tarjetas de Participante (Participant Card)

Componente para mostrar participantes en un viaje.

- **Layout:** Card horizontal con información del usuario
- **Contenido:**
  - **Avatar/Iniciales:** Círculo con iniciales o icono `User`
  - **Nombre:** `text-base font-medium text-slate-900`
  - **Rol:** Badge pequeño (CREATOR: `bg-violet-100 text-violet-700`, MEMBER: `bg-slate-100 text-slate-700`)
  - **Email:** `text-sm text-slate-500`
- **Acción (solo CREATOR):** Botón "Eliminar" pequeño si no es el creador

### 3.7 Tabs de Navegación (TripDetailPage)

Navegación por tabs dentro del detalle de viaje.

- **Posición:** Sticky top (debajo del header)
- **Layout:** Flex row con 3 items iguales
- **Estados:**
  - **Activo:** `text-violet-600 border-b-2 border-violet-600`
  - **Inactivo:** `text-slate-500`
- **Items:** "Gastos" | "Saldos" | "Participantes"
- **Transición:** Smooth al cambiar de tab

### 3.8 Empty State Component (Reutilizable)

Componente genérico para estados vacíos.

- **Props:**
  - `icon`: ReactNode (icono grande)
  - `title`: string (título)
  - `description`: string (descripción)
  - `action?`: ReactNode (botón opcional)
- **Layout:** Centrado vertical y horizontalmente
- **Estilo:** Icono `text-slate-300`, textos según jerarquía

### 3.9 Header Component (Estándar)

Componente reutilizable para headers de todas las páginas.

- **Patrón:** `[←] Título [Acciones]`
- **Altura:** 64px (h-16)
- **Padding:** 24px horizontal (px-6)
- **Fondo:** Blanco (bg-white)
- **Borde:** 1px slate-200 inferior (border-b)
- **Sticky:** top-0 z-40 cuando aplica
- **Botón atrás:** Solo visible si hay navegación previa
- **Acciones:** Máximo 2 iconos/botones en la derecha

**Variantes:**
- **Sin botón atrás:** Solo título (ej: HomePage no autenticado)
- **Con botón atrás:** Botón "←" + Título (ej: CreateTripPage, TripDetailPage)
- **Con acciones:** Botón atrás + Título + Acciones (ej: TripsListPage con "Crear Viaje", TripDetailPage con menú)

### 3.10 Modal Component (Invitación y Diálogos)

Componente para modales y diálogos.

- **Overlay:** `bg-black/50` para destacar modal
- **Modal:**
  - Fondo: `bg-white`
  - Border radius: `rounded-2xl` (16px)
  - Padding: `p-6` (24px)
  - Max width: `max-w-sm`
  - Sombra: `shadow-2xl`
- **Título:** `font-heading font-bold text-xl`
- **Labels:** `text-sm font-medium`
- **Inputs:** `h-12 rounded-xl`
- **Botones:** Primario (h-12, full-width) y Secundario/Ghost

### 3.11 Modal de Unirse a Viaje

Modal específico para ingresar código de 8 caracteres para unirse a un viaje existente.

**Características del Input:**

- **Alineación:** `text-center` - Código centrado para fácil lectura
- **Transformación:** `uppercase` - Auto-conversión a mayúsculas
- **Espaciado:** `tracking-wider` - Mejor legibilidad de caracteres
- **Peso:** `font-semibold` - Destacar el código
- **Tamaño:** `text-base` - Consistente con otros inputs del sistema
- **Dimensiones:** `h-12 w-full max-w-full` - Prevenir overflow en pantallas pequeñas
- **Max length:** 8 caracteres exactos
- **Placeholder:** "Ej: ABC12345"
- **Validación:** Solo A-Z y 0-9, filtrado automático con regex `/[^A-Z0-9]/g`

**Estados del Input:**

- **Normal:** `border-slate-300`
- **Focus:** `border-violet-600 ring-2 ring-violet-100`
- **Error:** `border-red-500 ring-2 ring-red-100`
- **Disabled:** `opacity-50 cursor-not-allowed`

**Feedback Visual:**

- **Contador de caracteres:** Muestra `X/8 caracteres` mientras se escribe
- **Color del contador:**
  - Incompleto: `text-slate-500`
  - Completo (8 chars): `text-violet-600`
- **Texto de ayuda inicial:** "Código de 8 caracteres (letras y números)" cuando está vacío

**Mensajes de Error Específicos:**

- **404:** "No encontramos un viaje con ese código. Verifica que esté correcto."
- **409:** "Ya eres participante de este viaje"
- **401:** "Tu sesión ha expirado. Inicia sesión nuevamente"

**Layout del Botón:**

- **Ancho:** `w-full max-w-sm mx-auto` - Centrado y limitado en desktop
- **Altura:** `h-12` - Touch target accesible
- **Estilo:** `bg-slate-200` (secundario), no primario
- **Icono:** Key de lucide-react

---

## 4. UX Patterns & Feedback

### 4.1 Manejo de Error: Strict User Policy (Active Help)

Cuando el creador intenta agregar un email no registrado (ej: `user@travelsplit.com`):

#### Validación

- **Trigger:** OnBlur (al salir del campo) o al intentar agregar

#### UI Feedback

1. El input se marca en rojo
2. Aparece un **Actionable Alert** (Toast/Modal):

   > "El usuario `user@travelsplit.com` no está registrado en TravelSplit."
   > 
   > [ **Botón Primario:** Copiar invitación ]  
   > [ **Botón Secundario:** Corregir email ]

#### Copy sugerido para invitación

> "¡Hola! Únete a nuestro viaje en TravelSplit para dividir gastos fácilmente. Regístrate aquí: [LINK]"

### 4.2 Empty States

No dejar pantallas en blanco. Cada empty state debe guiar al usuario hacia la acción correcta.

#### Sin Viajes (HomePage / TripsListPage)

- **Icono:** `Map` (lucide-react) grande, color `slate-300`, size 64
- **Título:** "¿Planeando una escapada?" (`text-2xl font-heading font-bold text-slate-900`)
- **Descripción:** "Crea tu primer viaje para empezar a dividir gastos fácilmente" (`text-slate-600`)
- **Acción:** Botón primario grande "Crear mi primer viaje" → `/trips/new`
- **Layout:** Centrado vertical y horizontalmente

#### Sin Gastos (TripDetailPage - Tab Gastos)

- **Botón "Nuevo Gasto":** Visible arriba del empty state
- **Icono:** `Receipt` (lucide-react) grande, color `slate-300`
- **Título:** "Todo tranquilo por aquí" (`text-xl font-heading font-semibold text-slate-900`)
- **Descripción:** "Toca el botón 'Nuevo Gasto' arriba para agregar el primer gasto" (`text-slate-600`)
- **Nota:** El botón "Nuevo Gasto" está dentro del tab de Gastos, arriba de la lista o empty state

#### Sin Participantes (TripDetailPage - Tab Participantes)

- **Icono:** `Users` (lucide-react) grande, color `slate-300`
- **Título:** "Aún no hay participantes" (`text-xl font-heading font-semibold text-slate-900`)
- **Descripción:** "Invita a tus amigos para empezar a dividir gastos" (`text-slate-600`)
- **Acción (solo CREATOR):** Botón "Invitar Participante" → Modal de invitación

---

## 5. Especificaciones de Diseño Visual (Design Tokens)

### 5.1 Headers Estándar

- **Patrón:** `[←] Título [Acciones]`
- **Altura:** 64px (h-16)
- **Padding:** 24px horizontal (px-6)
- **Fondo:** Blanco (bg-white)
- **Borde:** 1px slate-200 inferior (border-b)
- **Sticky:** top-0 z-40 cuando aplica

### 5.2 Espaciado Estándar

- **Contenedor principal:** px-6 py-8 (24px horizontal, 32px vertical)
- **Cards:** p-6 (24px todos los lados)
- **Espaciado entre elementos:** space-y-4 o space-y-6
- **Border radius:** rounded-xl (12px) para cards, rounded-2xl (16px) para modales

### 5.3 Iconos

- **Sistema:** lucide-react (NO emojis)
- **Tamaños:** 20px (botones), 24px (header), 64px (empty states)
- **Colores:** slate-300 (empty states), slate-500 (secundarios), violet-600 (activos)

### 5.4 Tabs

- **Activo:** text-violet-600 font-semibold border-b-2 border-violet-600
- **Inactivo:** text-slate-500 font-medium
- **Transición:** transition-colors duration-200
- **Fondo sticky:** bg-white border-b border-slate-200

### 5.5 Botones

- **Primario:** h-12, bg-violet-600, text-white, rounded-xl, font-semibold
- **Secundario:** h-12, bg-slate-200, text-slate-900, rounded-xl, font-medium
- **Full-width:** w-full en formularios y acciones principales

---

## 6. Implementación Técnica (Dev Guidelines)

### 6.1 Librerías Recomendadas

| Categoría | Librería | Propósito |
|-----------|----------|-----------|
| Iconos | `lucide-react` | Consistencia y peso ligero |
| Validación | `zod` + `react-hook-form` | Crucial para manejo de montos y emails |
| UI Base | `shadcn/ui` | Components: Button, Input, Dialog, Card, Toast |
| Fechas | `date-fns` | Formato: "Hoy", "Ayer", "29 Dic" |

### 6.2 Responsive & Tailwind Classes

Usar prefijos `md:` y `lg:` solo para adaptar el layout en escritorio (centrar el contenedor móvil en el medio de la pantalla), pero diseñar el interior pensando 100% en móvil.

**Ejemplo de Wrapper para simular app en desktop:**

```jsx
<div className="min-h-screen bg-slate-200 flex justify-center items-center">
  <div className="w-full max-w-md h-screen bg-slate-50 overflow-y-auto shadow-2xl">
    {/* App Content */}
  </div>
</div>
```

---

## Implementation Checklist

Entregar esta lista al equipo de desarrollo:

### Fase 0: Setup

- [ ] Configurar Tailwind con la paleta de colores (violet, slate, emerald, red)
- [ ] Instalar tipografías Plus Jakarta Sans y Inter
- [ ] Configurar shadcn/ui y componentes base (Button, Input, Card)

### Fase 1: Autenticación & Onboarding

- [ ] **HomePage:** Refactorizar para 3 estados (No autenticado, Autenticado sin viajes, Autenticado con viajes)
- [ ] **LoginPage:** Agregar header con botón "←" que navegue a `/`
- [ ] **RegisterPage:** Agregar header con botón "←" que navegue a `/`
- [ ] Pantalla de Login/Registro (Mobile friendly, inputs grandes)
- [ ] Manejo de tokens JWT y persistencia de sesión

### Fase 2: Core - Viajes

- [ ] **HomePage:** Empty state cuando no hay viajes + Resumen cuando hay viajes
- [ ] **TripsListPage:** Lista de viajes con botón "Crear Viaje" en header
- [ ] **CreateTripPage:** Formulario simple (Nombre + Moneda fija COP)
- [ ] **TripDetailPage:** Vista con tabs (Gastos, Saldos, Participantes) + Botón "Nuevo Gasto" dentro del tab de Gastos
- [ ] **Bottom Tab Bar:** Simplificado a 3 items fijos (sin FAB)
- [ ] Feature Crítica: Lógica de invitación de usuarios + Modal de "Active Help" para usuarios no registrados

### Fase 3: Core - Gastos

- [ ] **ExpenseFormPage:** Formulario de Gasto (Monto grande, Categorías, Selección de pagador)
- [ ] **ExpenseCard:** Componente para mostrar gastos en feed
- [ ] Feed de Gastos (Lista cronológica dentro de TripDetailPage)
- [ ] Carga de imágenes (Input file hidden estilizado)
- [ ] Edición/Eliminación de gastos (solo CREATOR)

### Fase 4: Core - Saldos

- [ ] Algoritmo de cálculo en Backend
- [ ] **TripBalancesPage (Tab Saldos):** Visualización Frontend con:
  - Balance personal destacado (card grande)
  - Lista de texto "Quién debe a Quién"
  - Badges de colores para diferenciar deudas vs. cobros
- [ ] **BalanceItem:** Componente para cada item de deuda

---

## Nota Final de Architect UI/X

> El éxito de este MVP radica en la fluidez del formulario de gasto. Si un usuario borracho en un bar puede registrar una cerveza en 5 segundos, el producto será un éxito. **Prioricen la velocidad de interacción en el "Botón +".**

> **Actualización v2.0:** La navegación debe reflejar la jerarquía de negocio. El FAB ha sido eliminado. El botón "Nuevo Gasto" está integrado dentro del tab de Gastos, arriba de la lista, donde tiene sentido contextual. La creación de viajes debe ser prominente y accesible. **La interfaz debe guiar al usuario: primero viaje, luego gastos.**

---

## Referencias

- **UI Flow Design:** Ver `docs/UI_FLOW_DESIGN.md` para mocks visuales y flujos completos
- **Especificación Técnica:** Ver `docs/UI_IMPLEMENTATION_SPEC.md` para detalles de implementación
- **Casos de Uso:** Ver `docs/UseCaseDiagram.md` para validar coherencia
