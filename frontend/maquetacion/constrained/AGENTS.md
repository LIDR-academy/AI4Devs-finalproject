# Fusion Vue Tailwind Starter

A production-ready Vue.js application template with TypeScript, TailwindCSS 3, and modern tooling.

## Tech Stack

- **Frontend**: Vue 3.5.17 + TypeScript + TailwindCSS 3.4.11
- **Styling**: TailwindCSS 3 with PostCSS + Autoprefixer
- **Testing**: Vitest with Vue Test Utils for component testing
- **Build Tool**: Vite 7 with Vue plugin
- **Package Manager**: npm
- **Linting**: ESLint 9 + Prettier
- **Type Checking**: TypeScript 5 + vue-tsc
- **Development Tools**: Vue DevTools integration

## Project Structure

```
src/                     # Vue application source
├── App.vue             # Main app component
├── main.ts             # Application entry point
├── assets/             # Static assets
│   ├── base.css        # Base styles
│   ├── logo.svg        # Logo asset
│   └── main.css        # Main styles with TailwindCSS imports
├── components/         # Vue components
│   ├── __tests__/      # Component tests
│   └── icons/          # Icon components
├── env.d.ts            # TypeScript declarations
└── ...                 # Other source files

public/                 # Static assets
├── favicon.ico         # Site favicon
└── ...                 # Other static files
```

## Key Features

### Vue 3 Composition API

The application uses Vue 3's modern Composition API with TypeScript:

- `<script setup>` syntax for concise component logic
- TypeScript integration throughout
- Reactive state management with Vue's reactivity system
- Component-based architecture

### Styling System

- **Primary**: TailwindCSS 3.4.11 utility classes
- **PostCSS**: Autoprefixer for cross-browser compatibility
- **Configuration**: `tailwind.config.js` for custom theming

```vue
<!-- Example of TailwindCSS usage in Vue components -->
<template>
  <div
    class="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200"
  >
    <div class="text-center">
      <h1 class="text-2xl font-semibold text-slate-800">Welcome to Fusion</h1>
    </div>
  </div>
</template>

<script setup lang="ts">
// Component logic here
</script>
```

### Development Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build
npm run type-check   # Type check with vue-tsc
npm run test:unit    # Run tests with Vitest
npm run lint         # Lint with ESLint
npm run format       # Format with Prettier
```

## Adding Features

### New Components

1. Create component in `src/components/`:

```vue
<!-- src/components/MyComponent.vue -->
<template>
  <div class="rounded-lg bg-white p-4 shadow">
    <h2 class="text-xl font-bold text-gray-900">{{ title }}</h2>
    <p class="text-gray-600">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  description?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Default Title',
  description: 'Default description',
})
</script>
```

2. Import in your app:

```vue
<template>
  <MyComponent title="Custom Title" description="Custom description" />
</template>

<script setup lang="ts">
import MyComponent from '@/components/MyComponent.vue'
</script>
```

### Custom TailwindCSS Configuration

1. Update `tailwind.config.js` for custom theming:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
      },
    },
  },
  plugins: [],
}
```

2. Add custom styles in `src/assets/main.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700;
  }
}
```

## Testing

The project includes comprehensive testing setup:

- **Unit Testing**: Vitest for fast unit tests
- **Component Testing**: Vue Test Utils for Vue component testing
- **Type Checking**: vue-tsc for TypeScript validation

```bash
npm run test:unit    # Run unit tests
```

## Production Deployment

- **Development**: `npm run dev` for local development
- **Build**: `npm run build` creates optimized production build
- **Preview**: `npm run preview` to preview production build
- **Type Check**: `npm run type-check` for TypeScript validation

## Architecture Notes

- Vue 3.5.17 with Composition API for modern reactive components
- TypeScript throughout the application
- TailwindCSS 3.4.11 for utility-first styling
- Vite 7 for fast development and optimized builds
- Vitest + Vue Test Utils for comprehensive testing
- ESLint + Prettier for code quality
- Vue DevTools integration for development debugging
- Single-page application (SPA) architecture
