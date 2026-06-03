---
description: Estándares de desarrollo frontend, buenas prácticas y convenciones para la aplicación React de ConRutina, incluyendo patrones de componentes, gestión de estado, directrices UI/UX y prácticas de pruebas
globs: ["frontend/src/**/*.{js,jsx,ts,tsx}", "frontend/tsconfig.json", "frontend/vite.config.ts", "frontend/package.json"]
alwaysApply: true
---

# Configuración del proyecto frontend y buenas prácticas — ConRutina

## Índice

- [Resumen](#resumen)
- [Stack tecnológico](#stack-tecnológico)
  - [Tecnologías principales](#tecnologías-principales)
  - [Framework de UI](#framework-de-ui)
  - [Gestión de estado y flujo de datos](#gestión-de-estado-y-flujo-de-datos)
  - [Framework de pruebas](#framework-de-pruebas)
  - [Herramientas de desarrollo](#herramientas-de-desarrollo)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Clean Architecture en el frontend](#clean-architecture-en-el-frontend)
- [Estándares de codificación](#estándares-de-codificación)
  - [Convenciones de lenguaje y nomenclatura](#convenciones-de-lenguaje-y-nomenclatura)
  - [Convenciones de componentes](#convenciones-de-componentes)
  - [Gestión de estado](#gestión-de-estado)
  - [Arquitectura de la capa de servicios](#arquitectura-de-la-capa-de-servicios)
- [Estándares UI/UX](#estándares-uiux)
  - [Integración de Tailwind CSS v4](#integración-de-tailwind-css-v4)
  - [Componentes Radix UI](#componentes-radix-ui)
  - [Manejo de formularios](#manejo-de-formularios)
  - [Accesibilidad](#accesibilidad)
- [Estándares de pruebas](#estándares-de-pruebas)
- [Estándares de configuración](#estándares-de-configuración)
- [Buenas prácticas de rendimiento](#buenas-prácticas-de-rendimiento)
- [Flujo de trabajo de desarrollo](#flujo-de-trabajo-de-desarrollo)

---

## Resumen

Este documento describe las buenas prácticas, convenciones y estándares utilizados en la aplicación frontend de ConRutina. El frontend sigue los principios de Clean Architecture y emplea patrones modernos de React para garantizar coherencia, mantenibilidad y una experiencia de usuario óptima.

## Stack tecnológico

### Tecnologías principales
- **React 18.3.1**: React moderno con componentes funcionales y hooks (peer dependency)
- **TypeScript**: Desarrollo con tipado estático y modo estricto
- **Vite 6.4.2**: Herramienta de build moderna con HMR rápido y builds optimizados
- **@vitejs/plugin-react 4.7.0**: Fast Refresh y soporte JSX

### Framework de UI
- **Tailwind CSS 4.1.12**: Framework CSS utility-first para diseño responsive
- **@tailwindcss/vite 4.1.12**: Integración de Tailwind con el pipeline de Vite
- **Radix UI (@radix-ui/react-*)**: Primitivas de UI accesibles (varias versiones v1.x–2.x)
- **Patrón shadcn/ui**: Biblioteca de componentes basada en Radix + Tailwind + CVA
- **lucide-react 0.487.0**: Biblioteca de iconos para elementos de UI
- **MUI (opcional) 7.3.5**: Componentes Material-UI (instalados pero no obligatorios para la pantalla principal)

### Estilos y utilidades
- **clsx 2.1.1**: Utilidad para construir cadenas de className
- **tailwind-merge 3.2.0**: Fusión de clases Tailwind sin conflictos
- **class-variance-authority 0.7.1**: Patrones de variantes de componentes con tipado seguro
- **tw-animate-css 1.3.8**: Utilidades adicionales de animación para Tailwind

### Gestión de estado y flujo de datos
- **React Hooks**: useState, useEffect para gestión de estado local
- **Custom Hooks**: Hooks específicos del dominio (useHabitDashboard, useUserProfile)
- **Sin biblioteca de estado global**: Gestión de estado mediante hooks de React y context (cuando sea necesario)

### Formularios y validación
- **react-hook-form 7.55.0**: Formularios performantes con validación sencilla
- **date-fns 3.6.0**: Utilidades de manipulación de fechas
- **react-day-picker 8.10.1**: Componente selector de fechas

### Bibliotecas adicionales
- **motion 12.23.24**: Animaciones y transiciones
- **recharts 2.15.2**: Biblioteca de gráficos (gráficos declarativos con D3 internamente)
- **next-themes 0.4.6**: Gestión de tema claro/oscuro
- **sonner 2.0.3**: Notificaciones toast
- **canvas-confetti 1.9.4**: Efectos de celebración para logros

### Framework de pruebas
- **Vitest** (planificado): Framework de pruebas moderno
- **Playwright** (vía MCP): Capacidad de pruebas E2E

### Herramientas de desarrollo
- **ESLint**: Linting de código
- **TypeScript**: Comprobación estática de tipos
- **Vite**: Servidor de desarrollo rápido con HMR

## Estructura del proyecto

```
frontend/
├── public/                     # Recursos estáticos
├── src/
│   ├── domain/                # Lógica de negocio pura y tipos
│   │   ├── habit.ts          # Entidad Habit y lógica asociada
│   │   ├── reward.ts         # Entidad Reward
│   │   ├── week.ts           # Cálculos semanales
│   │   └── fixtures.ts       # Datos de ejemplo
│   ├── application/          # Casos de uso y hooks
│   │   ├── useHabitDashboard.ts  # Lógica principal del dashboard
│   │   └── useUserProfile.ts     # Lógica del perfil de usuario
│   ├── infrastructure/       # Adaptadores externos
│   │   ├── httpClient.ts     # Cliente HTTP base (fetch /api)
│   │   └── profileApi.ts     # Adaptador GET /api/profile
│   ├── presentation/         # Capa de UI
│   │   ├── App.tsx          # Componente principal de la aplicación
│   │   └── components/      # Componentes React
│   │       ├── layout/      # Shell de la SPA (AppLayout, secciones)
│   │       │   ├── AppLayout.tsx
│   │       │   ├── StatsSection.tsx
│   │       │   ├── CalendarSection.tsx
│   │       │   └── RewardsSection.tsx
│   │       ├── Header.tsx
│   │       ├── HabitRow.tsx
│   │       ├── RewardCard.tsx
│   │       ├── AddHabitModal.tsx
│   │       ├── AddRewardModal.tsx
│   │       ├── UserProfileCard.tsx
│   │       ├── WeeklyCalendar.tsx
│   │       ├── ProgressBar.tsx
│   │       ├── StatCard.tsx
│   │       ├── media_handler/
│   │       │   └── ImageWithFallback.tsx
│   │       └── ui/          # Primitivas UI reutilizables (patrón shadcn)
│   │           ├── button.tsx
│   │           ├── dialog.tsx
│   │           ├── card.tsx
│   │           ├── input.tsx
│   │           └── ... (más de 50 componentes)
│   ├── styles/              # Estilos globales
│   │   ├── index.css       # Punto de entrada de estilos
│   │   ├── tailwind.css    # Directivas Tailwind
│   │   ├── theme.css       # Variables CSS para theming
│   │   └── fonts.css       # Definiciones de fuentes
│   ├── imports/            # Recursos estáticos (imágenes)
│   └── main.tsx           # Punto de entrada de la aplicación
├── index.html             # Plantilla HTML
├── tsconfig.json        # Configuración TypeScript del frontend
└── postcss.config.mjs  # Configuración PostCSS (placeholder Tailwind v4)

# En la raíz del monorepo (no dentro de frontend/):
# vite.config.ts         # root → frontend/, alias @, proxy /api
# package.json             # Scripts dev:web, dev, build
```

## Clean Architecture en el frontend

El frontend de ConRutina sigue los principios de Clean Architecture, organizando el código en capas con límites claros:

### Capa de dominio (`src/domain/`)
- **Lógica de negocio pura**: Sin dependencias de React, APIs ni frameworks
- **Entidades y objetos de valor**: Tipos Habit, Reward, Week
- **Reglas de negocio**: Cálculo de rachas, cómputo de puntos, lógica de estado de hábitos

**Ejemplo:**
```typescript
// domain/habit.ts
export interface Habit {
  id: string;
  emoji: string;
  name: string;
  pointsPerDay: number;
  penalty: number;
  streak: number;
  completionStatus: CompletionStatus[];
}

export function computeStreakFromStatus(status: CompletionStatus[]): number {
  // Pure business logic, no React or external dependencies
}
```

### Capa de aplicación (`src/application/`)
- **Casos de uso**: Hooks que orquestan la lógica de dominio y la infraestructura
- **Flujos de negocio**: Gestión de hábitos, recompensas y perfil de usuario
- **Gestión de estado**: Hooks de React para el estado de la aplicación

**Ejemplo:**
```typescript
// application/useHabitDashboard.ts
export function useHabitDashboard() {
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [rewards, setRewards] = useState<Reward[]>(initialRewards);
  
  const handleToggleDay = (habitId: string, dayIndex: number) => {
    // Orchestrates domain logic
    setHabits(habits.map(habit =>
      habit.id === habitId ? toggleHabitDayCompletion(habit, dayIndex) : habit
    ));
  };
  
  return { habits, rewards, handleToggleDay, ... };
}
```

### Capa de infraestructura (`src/infrastructure/`)
- **Adaptadores externos**: Clientes HTTP, almacenamiento local, servicios externos
- **Comunicación con la API**: Llamadas fetch al backend

**Ejemplo:**
```typescript
// infrastructure/httpClient.ts + profileApi.ts
import { apiGet } from './httpClient';

export async function fetchUserProfile(): Promise<ProfileApiResult> {
  const result = await apiGet<ProfileUserDto>('/profile');
  if (result.ok) return { ok: true, user: result.data };
  return { ok: false, error: result.message };
}
```

### Capa de presentación (`src/presentation/`)
- **Componentes UI**: Componentes React para el renderizado
- **Interacción con el usuario**: Manejadores de eventos, formularios, modales
- **Estilos**: Clases Tailwind, variantes de componentes

**Ejemplo:**
```typescript
// presentation/App.tsx
export default function App() {
  const {
    habits,
    rewards,
    handleToggleDay,
    handleAddHabit,
    // ... other use case methods
  } = useHabitDashboard();
  
  return (
    <div>
      <Header />
      <HabitRow habits={habits} onToggleDay={handleToggleDay} />
      <RewardCard rewards={rewards} />
    </div>
  );
}
```

## Estándares de codificación

### Convenciones de lenguaje y nomenclatura

**Reglas generales:**
- **Nomenclatura de variables**: Usar camelCase para variables y funciones (p. ej., `habitId`, `toggleHabitDay`, `getUserProfile`)
- **Nomenclatura de componentes**: Usar PascalCase para componentes React (p. ej., `HabitRow`, `RewardCard`, `AddHabitModal`)
- **Nomenclatura de constantes**: Usar UPPER_SNAKE_CASE para constantes (p. ej., `MAX_HABITS`, `DEFAULT_POINTS`)
- **Nomenclatura de tipos/interfaces**: Usar PascalCase para tipos e interfaces (p. ej., `Habit`, `UserProfile`, `CompletionStatus`)
- **Nomenclatura de archivos**: Usar PascalCase para archivos de componentes (p. ej., `HabitRow.tsx`) y camelCase para archivos de utilidades (p. ej., `profileApi.ts`)
- **Nomenclatura de clases CSS**: Usar clases utilitarias de Tailwind; evitar clases CSS personalizadas cuando sea posible
- **Nomenclatura de hooks**: Usar camelCase con prefijo "use" (p. ej., `useHabitDashboard`, `useUserProfile`)

**Textos de interfaz:** Los textos visibles para el usuario (etiquetas, placeholders, mensajes, aria-label) deben estar en **español**. El código, identificadores y tipos permanecen en **inglés**.

**Ejemplo de ConRutina:**
```typescript
// Good: All in English, proper naming conventions
import { useState } from 'react';
import type { Habit, CompletionStatus } from '../domain/habit';

interface HabitRowProps {
  habit: Habit;
  onToggleDay: (habitId: string, dayIndex: number) => void;
}

export function HabitRow({ habit, onToggleDay }: HabitRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleDayClick = (dayIndex: number) => {
    onToggleDay(habit.id, dayIndex);
  };
  
  return (
    <div className="habit-row">
      {/* Component JSX */}
    </div>
  );
}
```

### Convenciones de componentes

#### Componentes funcionales con TypeScript
- **Usar siempre componentes funcionales** con hooks (sin componentes de clase)
- **Usar TypeScript** para seguridad de tipos
- **Definir interfaces de props** de forma explícita
- **Usar desestructuración** para las props

**Ejemplo de ConRutina:**
```typescript
// Domain type
export interface Habit {
  id: string;
  emoji: string;
  name: string;
  pointsPerDay: number;
  penalty: number;
  streak: number;
  completionStatus: CompletionStatus[];
}

// Component props interface
interface HabitRowProps {
  id: string;
  emoji: string;
  name: string;
  points: number;
  streak: number;
  completionStatus: CompletionStatus[];
  onToggleDay: (habitId: string, dayIndex: number) => void;
  onDelete: (habitId: string) => void;
}

// Functional component with TypeScript
export default function HabitRow({
  id,
  emoji,
  name,
  points,
  streak,
  completionStatus,
  onToggleDay,
  onDelete,
}: HabitRowProps) {
  // Component implementation
}
```

### Gestión de estado

#### Estado local con hooks
- **Usar custom hooks**: Extraer lógica de estado compleja a hooks personalizados
- **Lógica de dominio en hooks**: Mantener la lógica de negocio en hooks de la capa de aplicación
- **Funciones puras**: Las funciones de dominio deben ser puras (sin efectos secundarios)

**Ejemplo de ConRutina:**
```typescript
// Application layer hook (useHabitDashboard.ts)
export function useHabitDashboard() {
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [rewards, setRewards] = useState<Reward[]>(initialRewards);
  const [weekOffset, setWeekOffset] = useState(0);

  // Delegate to domain logic
  const handleToggleDay = (habitId: string, dayIndex: number) => {
    setHabits(habits.map(habit =>
      habit.id === habitId ? toggleHabitDayCompletion(habit, dayIndex) : habit
    ));
  };

  // Compute derived state using domain functions
  const stats = calculateHabitStats(habits);
  const totalPoints = totalPointsFromStats(stats);

  return {
    habits,
    rewards,
    stats,
    totalPoints,
    handleToggleDay,
    // ... other state and handlers
  };
}
```

#### Estados de carga y error
- **Gestionar siempre estados de carga** en operaciones asíncronas
- **Implementar manejo de errores** con mensajes comprensibles para el usuario
- **Usar tipos TypeScript adecuados** para el estado

**Ejemplo de ConRutina:**
```typescript
// useUserProfile.ts
export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUserProfile()
      .then(setProfile)
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  return { profile, isLoading, error };
}
```

### Arquitectura de la capa de servicios

#### Servicios de API
- **Centralizar las llamadas a la API** en la capa de infraestructura
- **Usar la API fetch** para peticiones HTTP
- **Devolver tipos de dominio** desde las funciones de API

**Ejemplo de ConRutina:**
```typescript
// infrastructure/profileApi.ts
export async function getUserProfile(): Promise<UserProfile> {
  const response = await fetch('/api/profile');
  
  if (!response.ok) {
    throw new Error(`Failed to fetch profile: ${response.statusText}`);
  }
  
  return response.json();
}
```

## Estándares UI/UX

### Integración de Tailwind CSS v4
- Usar **clases utilitarias de Tailwind** para todo el estilado
- **Seguir la sintaxis de Tailwind v4** (última versión)
- **Usar variables de tema** definidas en `styles/theme.css`
- **Evitar CSS personalizado** cuando existan utilidades de Tailwind

**Ejemplo de ConRutina:**
```typescript
<div className="min-h-screen bg-background">
  <div className="max-w-5xl mx-auto px-4 py-8">
    <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
      <h2 className="text-xl font-semibold text-gray-800">Calendario semanal</h2>
    </div>
  </div>
</div>
```

**Variables de tema:**

Tokens ConRutina (DoD T-05-02) en `frontend/src/styles/theme.css`. Los valores `--color-*` son la fuente de verdad; las variables shadcn (`--background`, `--primary`, etc.) referencian la misma paleta.

```css
/* frontend/src/styles/theme.css */
:root {
  /* Tokens ConRutina */
  --color-background: #faf8f5;
  --color-surface: #ffffff;
  --color-primary: #22c55e;
  --color-completed: #22c55e;
  --color-failed: #ef4444;
  --color-pending: #e5e7eb;

  /* shadcn — sincronizados con ConRutina */
  --background: var(--color-background);
  --foreground: #1a1a1a;
  --card: var(--color-surface);
  --primary: var(--color-primary);
  --secondary: #fbbf24;
  /* ... más variables shadcn en theme.css */
}
```

Utilidades Tailwind generadas vía `@theme inline`: `bg-primary`, `bg-completed`, `bg-failed`, `bg-pending`, `bg-background`, `bg-surface`.

Cadena de importación: `main.tsx` → `index.css` → `fonts.css` + `tailwind.css` + `theme.css`.

Tipografía: `--font-sans` (Inter) para UI; `--font-display` (Georgia) para títulos. Utilidades Tailwind: `font-sans`, `font-display`.

### Componentes Radix UI
- Usar **primitivas Radix UI** para componentes interactivos
- **Accesibles por defecto**: Radix gestiona los atributos ARIA
- **Componer componentes** siguiendo el patrón shadcn/ui
- **Personalizar con clases Tailwind**

**Componentes UI disponibles (en `presentation/components/ui/`):**

**DoD T-05-03 — primitivos base instalados y configurados:**

| Primitivo | Fichero | Uso principal |
|-----------|---------|---------------|
| Button | `button.tsx` | Acciones y envío de formularios |
| Dialog | `dialog.tsx` | Modales accesibles (Radix) |
| Input | `input.tsx` | Campos de texto |
| Label | `label.tsx` | Etiquetas de formulario |
| Card | `card.tsx` | Contenedores de contenido |
| Progress | `progress.tsx` | Barras de progreso |
| Badge | `badge.tsx` | Etiquetas y estados |
| Sonner | `sonner.tsx` | Wrapper de `<Toaster />` para toasts globales |

Configuración CLI: `components.json` en la raíz del monorepo (alias `@/` → `frontend/src`). Para añadir primitivos futuros: `npx shadcn@latest add <component>` desde la raíz.

**Componentes adicionales** (scaffold inicial, fuera del DoD T-05-03): Dialog, Sheet, Drawer, Textarea, Accordion, Tabs, Select, Checkbox, Switch, Tooltip, Popover, Dropdown Menu y más (~40 ficheros en `ui/`).

**Ejemplo de ConRutina:**
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function AddHabitModal({ isOpen, onClose, onAdd }: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo hábito</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Input
            name="name"
            placeholder="Nombre del hábito"
            value={formData.name}
            onChange={handleInputChange}
          />
          <Button type="submit">Añadir hábito</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### Manejo de formularios
- Usar **react-hook-form** para formularios complejos
- **Componentes controlados** con useState para formularios sencillos
- **Validación en tiempo real** cuando proceda
- **Deshabilitar botones de envío** durante el submit

**Ejemplo de formulario sencillo de ConRutina:**
```typescript
const [formData, setFormData] = useState({
  emoji: '💪',
  name: '',
  pointsPerDay: 10,
  penalty: 5,
});

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value,
  }));
};

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  onAdd(formData);
  onClose();
};
```

### Utilidades de estilos
- **clsx + tailwind-merge**: Usar la utilidad `cn()` para clases condicionales
- **class-variance-authority (CVA)**: Variantes de componentes con tipado seguro
- **Evitar estilos inline**: Usar utilidades Tailwind o variables de tema

**Ejemplo usando la utilidad `cn()`:**
```typescript
import { cn } from '../ui/utils';

<button
  className={cn(
    "px-4 py-2 rounded-lg font-medium transition-colors",
    isActive ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700",
    disabled && "opacity-50 cursor-not-allowed"
  )}
>
  Guardar
</button>
```

**Ejemplo usando CVA:**
```typescript
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  "px-4 py-2 rounded-lg font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-green-500 hover:bg-green-600 text-white",
        secondary: "bg-yellow-400 hover:bg-yellow-500 text-yellow-900",
        outline: "border border-gray-300 hover:bg-gray-100",
      },
      size: {
        sm: "text-sm px-3 py-1.5",
        md: "text-base px-4 py-2",
        lg: "text-lg px-6 py-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);
```

### Accesibilidad
- **Usar HTML semántico**
- **Los componentes Radix** gestionan automáticamente los atributos ARIA
- **Proporcionar texto alternativo** en imágenes
- **Navegación por teclado** soportada por defecto con Radix

**Ejemplo de ConRutina:**
```typescript
// Semantic HTML and proper structure
<button
  onClick={() => handleToggleDay(id, dayIndex)}
  className="..."
  aria-label={`Marcar cumplimiento de ${name} el ${dayName}`}
>
  {/* Button content */}
</button>

// Image with fallback
<ImageWithFallback
  src={imageSrc}
  alt="Perfil de usuario"
  fallbackSrc="/default-avatar.png"
/>
```

## Estándares de pruebas

### Pruebas unitarias (planificadas)
- **Vitest**: Framework de pruebas moderno (pendiente de configurar)
- **Organización de pruebas**: Seguir estructura orientada al dominio
- **Probar funciones puras**: La lógica de dominio es fácil de testear

**Ejemplo de prueba futura:**
```typescript
import { describe, it, expect } from 'vitest';
import { computeStreakFromStatus, toggleHabitDayCompletion } from './habit';

describe('Habit domain logic', () => {
  it('should compute streak correctly', () => {
    const status = ['completed', 'completed', 'completed', 'pending'];
    expect(computeStreakFromStatus(status)).toBe(3);
  });

  it('should toggle day completion status', () => {
    const habit = {
      id: '1',
      name: 'Exercise',
      completionStatus: ['pending', 'pending'],
      // ... other fields
    };
    
    const updated = toggleHabitDayCompletion(habit, 0);
    expect(updated.completionStatus[0]).toBe('completed');
  });
});
```

### Pruebas E2E con Playwright MCP
- **Herramientas Playwright MCP** disponibles para pruebas end-to-end
- Probar flujos completos de usuario
- Verificar persistencia de datos (cuando esté implementada)

## Estándares de configuración

### Configuración TypeScript
- **Modo estricto activado**: Refuerza la seguridad de tipos
- **Path mapping**: `@/*` apunta a `frontend/src/*`
- **Módulos ESM**: `moduleResolution: bundler` para Vite

**tsconfig.json actual:**
```json
{
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["frontend/src/*"]
    },
    "jsx": "react-jsx",
    "moduleResolution": "bundler"
  }
}
```

### Configuración Vite
- **Root**: directorio `frontend/`
- **Alias**: `@` → `./frontend/src`
- **Proxy**: `/api` → `http://localhost:3001`
- **Tailwind**: Mediante el plugin `@tailwindcss/vite`

**Ajustes clave de vite.config.ts:**
```typescript
export default defineConfig({
  root: 'frontend/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './frontend/src'),
    },
  },
  server: {
    proxy: {
      '/api/health': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: () => '/health',
      },
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

## Buenas prácticas de rendimiento

### Optimización de componentes
- **Carga diferida** de componentes cuando proceda (usando React.lazy)
- **Memoizar cálculos costosos** con useMemo
- **Evitar re-renderizados innecesarios** con useCallback
- **Extraer lógica reutilizable** a custom hooks

**Ejemplo:**
```typescript
const memoizedStats = useMemo(() => calculateHabitStats(habits), [habits]);

const handleToggleDay = useCallback((habitId: string, dayIndex: number) => {
  // Handler logic
}, [setHabits]);
```

### Optimización del bundle
- **Vite optimiza automáticamente**: Code splitting, tree shaking
- **Carga diferida de rutas**: Usar imports dinámicos para componentes de ruta
- **Optimizar imágenes**: Usar formatos y tamaños adecuados

### Eficiencia de la API
- **Minimizar llamadas a la API**: Usar estado local cuando sea posible
- **Cachear respuestas**: Considerar estrategia de caché para datos de solo lectura
- **Operaciones por lotes**: Agrupar operaciones relacionadas cuando sea posible

## Flujo de trabajo de desarrollo

### Flujo Git
- **Rama principal**: `develop` (base de integración; no implementar cambios de código directamente en ella)
- **Ramas de feature**: `feature/[ticket-id]-[ticket-name]` creadas desde `develop` (p. ej. `feature/T-13-01-habit-domain-types`); validar que no existan antes de crearlas
- **Commits**: Un **commit único** con mensaje en **viñetas breves** en español **solo al archivar** el change OpenSpec (cuando el usuario acepta); no commitear durante `/opsx:apply`
- **Revisión de código**: Revisar el código antes de fusionar
- **Cierre**: Tras pruebas obligatorias (p. ej. al archivar un change OpenSpec), push de la rama de feature al remoto y merge en `develop`
- **Ramas pequeñas**: Mantener cambios focalizados y manejables

Ver [openspec-tasks-mandatory-steps.md](./openspec-tasks-mandatory-steps.md) para el flujo detallado con OpenSpec.

### Scripts de desarrollo
```bash
npm run dev              # Iniciar servidor de desarrollo frontend (Vite)
npm run build            # Build de producción
npm run preview          # Previsualizar build de producción
npm run dev:api          # Iniciar API backend (otra terminal)
npm run prisma:generate  # Generar cliente Prisma
npm run docker:up        # Iniciar PostgreSQL
```

### Calidad de código
- **Modo estricto TypeScript**: Garantiza seguridad de tipos
- **ESLint** (cuando esté configurado): Linting de código
- **Todas las funcionalidades probadas**: Pruebas manuales antes de archivar (commit al cierre)
- **Monitorización de rendimiento**: Revisar advertencias en consola

---

Este documento sirve como base para mantener la calidad y coherencia del código en la aplicación frontend de ConRutina. Todos los miembros del equipo deben seguir estas prácticas para garantizar una base de código mantenible, escalable y performante.
