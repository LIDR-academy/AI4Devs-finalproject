# TravelSplit Frontend

Frontend del sistema de gestión de gastos de viaje TravelSplit, construido con React, TypeScript, TailwindCSS y Vite.

## Estructura del Proyecto

El proyecto sigue una arquitectura atómica/modular para la organización de componentes:

```
src/
├── components/          # Componentes reutilizables
│   ├── atoms/          # Componentes básicos (Button, Input, etc.)
│   ├── molecules/      # Componentes compuestos (FormField, Card, etc.)
│   └── organisms/      # Componentes complejos (Header, Footer, etc.)
├── pages/              # Páginas/views principales
├── hooks/              # Custom hooks
├── services/           # Servicios API (futuro)
├── utils/              # Utilidades y helpers
├── types/              # Definiciones TypeScript
└── routes/             # Configuración de rutas
```

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run lint` - Ejecuta el linter
- `npm run lint:fix` - Ejecuta el linter y corrige errores automáticamente
- `npm run format` - Formatea el código con Prettier
- `npm run format:check` - Verifica el formato sin modificar archivos
- `npm run preview` - Previsualiza el build de producción

## Tecnologías

- **React** v19.2 - Biblioteca de UI
- **TypeScript** v5.9+ - Tipado estático
- **Vite** v7.x - Build tool y dev server
- **TailwindCSS** v4.0 - Framework de estilos
- **React Router** - Enrutamiento
- **ESLint** - Linter
- **Prettier** - Formateador de código

## Path Aliases

El proyecto utiliza path aliases para imports más limpios:

- `@/*` → `./src/*`
- `@/components/*` → `./src/components/*`
- `@/pages/*` → `./src/pages/*`
- `@/hooks/*` → `./src/hooks/*`
- `@/services/*` → `./src/services/*`
- `@/utils/*` → `./src/utils/*`
- `@/types/*` → `./src/types/*`

## Convenciones

- Componentes: PascalCase (ej: `Button.tsx`)
- Hooks: camelCase con prefijo `use` (ej: `useAuth.ts`)
- Utilidades: camelCase (ej: `formatCurrency.ts`)
- Tipos: PascalCase (ej: `User.ts`)
