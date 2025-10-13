# Frontend - Final Project

Modern React application built with TypeScript, Vite, and Tailwind CSS following best practices and feature-based architecture.

## 📚 Tech Stack

### Core
- **React** `19.1.1` - UI library with latest features
- **TypeScript** `5.9.3` - Type-safe JavaScript with strict mode enabled
- **Vite** `7.1.7` - Next-generation frontend build tool

### Routing & State Management
- **React Router DOM** `7.9.4` - Declarative routing
- **Zustand** `5.0.8` - Lightweight state management
- **Zod** `4.1.12` - Runtime validation and type inference

### Styling
- **Tailwind CSS** `4.1.14` - Utility-first CSS framework
- **PostCSS** `8.5.6` - CSS transformations
- **Autoprefixer** `10.4.21` - Vendor prefix automation

### Testing
- **Vitest** `3.2.4` - Fast unit test framework
- **Playwright** `1.56.0` - End-to-end testing
- **Testing Library** - React component testing utilities
  - `@testing-library/react` `16.3.0`
  - `@testing-library/jest-dom` `6.9.1`
  - `@testing-library/user-event` `14.6.1`

### Code Quality
- **ESLint** `9.36.0` - Linting with React, Hooks, and a11y plugins
- **Prettier** `3.6.2` - Code formatting
- **Husky** `9.1.7` - Git hooks
- **lint-staged** `16.2.4` - Pre-commit linting

## 🏗️ Project Structure

The project follows a **feature-based architecture** with clear separation of concerns:

```
src/
├── assets/          # Static assets (images, fonts, etc.)
├── components/      # Shared/generic components (Button, Input, etc.)
├── features/        # Feature modules (organized by domain)
│   └── auth/        # Authentication feature
│       ├── components/   # Feature-specific components
│       ├── hooks/        # Feature-specific hooks
│       ├── stores/       # Feature-specific state (Zustand)
│       └── types/        # Feature-specific TypeScript types
├── hooks/           # Shared custom hooks
├── lib/             # Third-party library configurations
├── pages/           # Page components (route-level)
├── providers/       # React context providers
├── routes/          # Route configuration
├── services/        # API clients and external services
├── stores/          # Global state stores
├── styles/          # Global styles and CSS variables
└── types/           # Shared TypeScript types
```

### Key Architectural Decisions

- **Feature-based organization**: Code is grouped by feature/domain rather than by type (components, hooks, etc.)
- **Path aliases**: Use `@/*` to import from `src/` (e.g., `import { Button } from '@/components/Button'`)
- **TypeScript strict mode**: Enforces type safety across the entire codebase
- **Component composition**: Prefer small, reusable components over large monolithic ones

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x

### Installation

```bash
# Install dependencies
npm install

# Set up Git hooks
npm run prepare
```

### Development

```bash
# Start development server (http://localhost:5173)
npm run dev
```

The dev server includes:
- ⚡ Hot Module Replacement (HMR)
- 🔄 Fast Refresh for React components
- 📝 TypeScript type checking

### Building for Production

```bash
# Type check and build
npm run build

# Preview production build locally
npm run preview
```

Build output will be in the `dist/` directory.

## 🧪 Testing

The project is configured with **Vitest** for unit tests and **Playwright** for E2E tests.

### Unit & Integration Tests (Vitest)

Vitest is configured in `vite.config.ts` with:
- **jsdom** environment for DOM testing
- **Testing Library** integration
- Global test utilities

**Note:** Add these scripts to `package.json` to run tests:

```json
"scripts": {
  "test": "vitest",
  "test:watch": "vitest --watch",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest --coverage"
}
```

### End-to-End Tests (Playwright)

Playwright is configured to test against Chromium, Firefox, and WebKit.

**Note:** Add these scripts to `package.json` to run E2E tests:

```json
"scripts": {
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:headed": "playwright test --headed"
}
```

## 🔍 Code Quality

### Linting

```bash
# Run ESLint
npm run lint
```

**Note:** To add auto-fix capability, add this script to `package.json`:

```json
"scripts": {
  "lint:fix": "eslint . --fix"
}
```

### Formatting

Prettier is configured via `.prettierrc`. 

**Note:** Add these scripts to `package.json` for formatting:

```json
"scripts": {
  "format": "prettier --write \"src/**/*.{ts,tsx,css,md}\"",
  "format:check": "prettier --check \"src/**/*.{ts,tsx,css,md}\""
}
```

### Pre-commit Hooks

Husky and lint-staged are configured to automatically:
1. Run ESLint on staged files
2. Run Prettier on staged files
3. Run TypeScript type checking

This ensures code quality before every commit.

## 📝 Configuration Files

- **`vite.config.ts`** - Vite configuration with path aliases and Vitest setup
- **`tsconfig.json`** - TypeScript project references
- **`tsconfig.app.json`** - TypeScript config for application code (strict mode enabled)
- **`tsconfig.node.json`** - TypeScript config for Node.js scripts
- **`postcss.config.js`** - PostCSS with Tailwind CSS plugin
- **`playwright.config.ts`** - Playwright E2E test configuration
- **`vitest.setup.ts`** - Vitest global setup
- **`.prettierrc`** - Prettier formatting rules
- **`eslint.config.js`** - ESLint rules and plugins

## 🎨 Styling Guidelines

- **Tailwind CSS v4** is used for styling with the new PostCSS plugin
- Global CSS variables are defined in `src/styles/globals.css`
- Custom theme colors can be configured via CSS variables in `:root`
- Prefer utility classes over custom CSS when possible

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:8080/api
VITE_APP_NAME=YourAppName
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

## 📚 Additional Resources

- [Vite Documentation](https://vite.dev/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)

## 🤝 Contributing

1. Follow the existing code style and architecture patterns
2. Write tests for new features
3. Ensure all tests pass before committing
4. Use conventional commit messages
5. Keep components small and focused on a single responsibility
