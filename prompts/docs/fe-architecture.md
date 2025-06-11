# Frontend Architecture Documentation - ShopMefy Platform

**Generated on**: December 2024  
**Project**: AI4Devs Final Project - ShopMefy  
**Technology Stack**: React + TypeScript + Vite + TailwindCSS + ShadCN/UI  
**Requested by**: Andrea  

---

## 🏗️ Technology Stack Overview

### Core Technologies
- **React 18.3.1**: Modern React with Hooks, Concurrent Features, and Suspense
- **TypeScript 5.5.3**: Type-safe JavaScript with advanced type inference
- **Vite 5.4.19**: Ultra-fast build tool with HMR (Hot Module Replacement)
- **TailwindCSS 3.4.11**: Utility-first CSS framework for rapid UI development
- **ShadCN/UI**: High-quality, accessible component library built on Radix UI

### State Management & Data Fetching
- **TanStack Query 5.56.2**: Server state management with caching, synchronization
- **React Hook Form 7.53.0**: Performant forms with minimal re-renders
- **Zod 3.23.8**: TypeScript-first schema validation

### Routing & Navigation
- **React Router DOM 6.26.2**: Declarative routing for React applications

### UI Components & Styling
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **Lucide React**: Beautiful & consistent icon library
- **Class Variance Authority**: Type-safe component variants
- **Tailwind Merge**: Utility for merging Tailwind CSS classes

---

## 📁 Folder Structure & Architecture

### `/src` - Main Source Directory

#### `/components` - Component Library
```
components/
├── ui/                    # ShadCN/UI base components
├── admin/                 # Admin panel specific components
├── chat/                  # Chatbot integration components
├── dashboard/             # Dashboard widgets and layouts
├── documents/             # Document management components
├── faqs/                  # FAQ management components
├── flowise/               # Flowise chatbot integration
├── layout/                # Layout components (Header, Footer, Sidebar)
├── products/              # Product catalog components
├── services/              # Services management components
├── slashpage/             # Landing page components
└── ErrorBoundary.tsx      # Global error handling component
```

**Technologies Used**:
- **React Functional Components** with TypeScript
- **ShadCN/UI** for consistent design system
- **Radix UI** primitives for accessibility
- **TailwindCSS** for styling

**Best Practices**:
- Component composition over inheritance
- Props interface definitions with TypeScript
- Consistent naming conventions (PascalCase)
- Separation of concerns (UI vs Logic)

#### `/pages` - Route Components
```
pages/
├── AdminPage.tsx          # Admin dashboard page
├── ChatPage.tsx           # Chatbot interface page
├── DocumentsPage.tsx      # Document management page
├── FAQPage.tsx            # FAQ management page
├── ProductsPage.tsx       # Product catalog page
├── ServicesPage.tsx       # Services page
└── SlashPage.tsx          # Landing page
```

**Technologies Used**:
- **React Router DOM** for routing
- **React Suspense** for code splitting
- **Error Boundaries** for error handling

**Best Practices**:
- Page-level components as route handlers
- Lazy loading for performance optimization
- Consistent page structure and layout

#### `/hooks` - Custom React Hooks
```
hooks/
├── useAuth.ts             # Authentication state management
├── useApi.ts              # API interaction hooks
├── useLocalStorage.ts     # Local storage utilities
└── useDebounce.ts         # Debouncing utilities
```

**Technologies Used**:
- **React Hooks** (useState, useEffect, useCallback, useMemo)
- **TanStack Query** for server state
- **TypeScript** for type safety

**Best Practices**:
- Custom hooks for reusable logic
- Proper dependency arrays in useEffect
- Memoization for performance optimization

#### `/services` - API Layer
```
services/
├── api.ts                 # Base API configuration
├── authService.ts         # Authentication API calls
├── productService.ts      # Product-related API calls
├── faqService.ts          # FAQ API calls
├── documentService.ts     # Document API calls
└── serviceService.ts      # Services API calls
```

**Technologies Used**:
- **Axios 1.9.0** for HTTP requests
- **TanStack Query** for caching and synchronization
- **TypeScript** for API response typing

**Best Practices**:
- Centralized API configuration
- Request/Response interceptors
- Error handling and retry logic
- Type-safe API responses

#### `/types` - TypeScript Definitions
```
types/
├── api.ts                 # API response types
├── auth.ts                # Authentication types
├── product.ts             # Product entity types
├── faq.ts                 # FAQ entity types
├── document.ts            # Document entity types
└── service.ts             # Service entity types
```

**Technologies Used**:
- **TypeScript** interfaces and types
- **Zod** for runtime validation

**Best Practices**:
- Shared type definitions
- Runtime validation with Zod
- Consistent naming conventions

#### `/utils` - Utility Functions
```
utils/
├── cn.ts                  # Class name utility (clsx + tailwind-merge)
├── formatters.ts          # Data formatting utilities
├── validators.ts          # Form validation utilities
└── constants.ts           # Application constants
```

**Technologies Used**:
- **clsx** for conditional class names
- **tailwind-merge** for Tailwind class merging
- **date-fns** for date manipulation

**Best Practices**:
- Pure functions without side effects
- Comprehensive unit testing
- Clear function documentation

#### `/contexts` - React Context Providers
```
contexts/
├── AuthContext.tsx        # Authentication context
├── ThemeContext.tsx       # Theme management context
└── NotificationContext.tsx # Global notifications
```

**Technologies Used**:
- **React Context API**
- **next-themes** for theme management
- **sonner** for toast notifications

**Best Practices**:
- Context for global state only
- Provider composition pattern
- TypeScript context typing

#### `/lib` - Third-party Library Configurations
```
lib/
├── utils.ts               # Utility configurations
├── validations.ts         # Zod schema definitions
└── queryClient.ts         # TanStack Query configuration
```

**Technologies Used**:
- **TanStack Query** client configuration
- **Zod** schema definitions
- **Axios** interceptors

**Best Practices**:
- Centralized library configurations
- Environment-specific settings
- Type-safe configurations

---

## 🧪 Testing Architecture

### `/cypress` - E2E Testing
```
cypress/
├── e2e/                   # End-to-end test files
├── fixtures/              # Test data fixtures
├── support/               # Custom commands and utilities
└── downloads/             # Downloaded files during tests
```

**Technologies Used**:
- **Cypress 13.6.3** for E2E testing
- **TypeScript** for test files

**Best Practices**:
- Page Object Model pattern
- Custom commands for reusability
- Data-driven testing with fixtures

### Unit Testing
**Technologies Used**:
- **Vitest** for unit testing
- **Testing Library** for component testing
- **jsdom** for DOM simulation

---

## 🎨 Styling & Design System

### TailwindCSS Configuration
- **Utility-first** approach for rapid development
- **Custom design tokens** for brand consistency
- **Responsive design** with mobile-first approach
- **Dark mode** support with next-themes

### ShadCN/UI Components
- **Accessible** components built on Radix UI
- **Customizable** with CSS variables
- **Consistent** design language
- **TypeScript** support out of the box

---

## 🚀 Build & Development

### Vite Configuration
- **Fast HMR** for development experience
- **Code splitting** for optimized bundles
- **TypeScript** support with SWC
- **Environment variables** management

### Development Scripts
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
npm run lint         # ESLint checking
```

---

## 🔧 Best Practices Implemented

### Code Quality
- **ESLint** with TypeScript rules
- **Prettier** for code formatting
- **Husky** for git hooks (if configured)
- **TypeScript strict mode** enabled

### Performance
- **Code splitting** with React.lazy
- **Memoization** with React.memo, useMemo, useCallback
- **Image optimization** with proper loading strategies
- **Bundle analysis** for size optimization

### Accessibility
- **Semantic HTML** structure
- **ARIA attributes** for screen readers
- **Keyboard navigation** support
- **Color contrast** compliance

### Security
- **Input validation** with Zod
- **XSS protection** with proper sanitization
- **HTTPS** enforcement in production
- **Environment variables** for sensitive data

---

## 🌐 Integration Points

### Backend API
- **RESTful API** communication via Axios
- **Authentication** with JWT tokens
- **Error handling** with proper HTTP status codes
- **Request/Response** type safety

### External Services
- **Flowise** chatbot integration
- **File upload** handling
- **Third-party** API integrations

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 640px and below
- **Tablet**: 641px - 1024px
- **Desktop**: 1025px and above

### Design Principles
- **Mobile-first** approach
- **Progressive enhancement**
- **Flexible layouts** with CSS Grid and Flexbox
- **Touch-friendly** interface elements

---

## 🔄 State Management Strategy

### Local State
- **useState** for component-level state
- **useReducer** for complex state logic
- **Custom hooks** for reusable state logic

### Server State
- **TanStack Query** for API data
- **Optimistic updates** for better UX
- **Background refetching** for data freshness

### Global State
- **React Context** for authentication
- **Local Storage** for user preferences
- **Session Storage** for temporary data

---

## 📊 Performance Monitoring

### Metrics Tracked
- **Core Web Vitals** (LCP, FID, CLS)
- **Bundle size** analysis
- **Runtime performance** profiling
- **Network requests** optimization

### Tools Used
- **Vite Bundle Analyzer** for bundle analysis
- **React DevTools** for component profiling
- **Lighthouse** for performance auditing

---

## 🚀 Deployment Strategy

### Build Process
1. **TypeScript compilation** with type checking
2. **Asset optimization** and minification
3. **Code splitting** for optimal loading
4. **Static asset** generation

### Environment Configuration
- **Development**: Hot reloading, source maps
- **Staging**: Production-like with debugging
- **Production**: Optimized, minified, cached

---

## 📚 Documentation Standards

### Code Documentation
- **JSDoc comments** for complex functions
- **README files** for each major feature
- **Type definitions** as documentation
- **Component props** documentation

### Architecture Decisions
- **ADR (Architecture Decision Records)** for major decisions
- **Technical debt** tracking
- **Performance benchmarks** documentation

---

**Last Updated**: December 2024  
**Maintained by**: AI Assistant  
**Contact**: Andrea for questions and updates 