# SEPE Templates Comparator - Frontend

Frontend application for the SEPE Templates Comparator, built with React, Vite, TypeScript, and TailwindCSS.

## Features

- **React 19**: Latest React with modern hooks and concurrent features
- **TypeScript**: Full type safety and better developer experience
- **Vite**: Fast development server and optimized builds
- **TailwindCSS**: Utility-first CSS framework with custom design system
- **React Router**: Client-side routing with protected routes
- **Context API**: State management for authentication and theme
- **Lucide Icons**: Beautiful and consistent iconography
- **React Hook Form**: Performant forms with validation
- **Axios**: HTTP client for API communication
- **Vitest**: Fast unit testing with React Testing Library
- **ESLint & Prettier**: Code quality and formatting

## Quick Start

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm 10+

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment setup:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

## Available Scripts

### Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

### Testing
- `npm test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Generate coverage report

## Project Structure

```
frontend/
├── public/                 # Static assets
├── src/                   # Source code
│   ├── components/        # Reusable UI components
│   │   ├── auth/         # Authentication components
│   │   ├── layout/       # Layout components
│   │   └── ui/           # Basic UI components
│   ├── contexts/         # React contexts
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/            # Custom hooks
│   ├── pages/            # Page components
│   │   ├── auth/         # Authentication pages
│   │   ├── templates/    # Template pages
│   │   └── comparisons/  # Comparison pages
│   ├── services/         # API services
│   │   ├── apiService.ts
│   │   └── authService.ts
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── test/             # Test setup and utilities
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # App entry point
│   └── index.css         # Global styles
├── .env.example          # Environment variables template
├── tailwind.config.js    # TailwindCSS configuration
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
├── .eslintrc.cjs         # ESLint configuration
└── .prettierrc           # Prettier configuration
```

## Design System

### Colors
- **Primary**: Blue palette for main actions and branding
- **Secondary**: Gray palette for secondary elements
- **Success**: Green palette for success states
- **Warning**: Yellow palette for warnings
- **Error**: Red palette for errors and destructive actions

### Typography
- **Font Family**: Inter (primary), JetBrains Mono (monospace)
- **Font Weights**: 300, 400, 500, 600, 700

### Components
- **Buttons**: Multiple variants (primary, secondary, outline, ghost)
- **Cards**: Consistent card layouts with header, body, footer
- **Forms**: Styled form inputs with validation states
- **Badges**: Status indicators with color variants

### Responsive Design
- **Breakpoints**: xs (400px), sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
- **Mobile-first**: All components designed mobile-first with progressive enhancement

## Routing Structure

- `/` - Dashboard (protected)
- `/login` - Login page
- `/register` - Registration page
- `/templates` - Templates list (protected)
- `/templates/upload` - Upload template (protected)
- `/templates/:id` - Template details (protected)
- `/comparisons` - Comparisons list (protected)
- `/comparisons/create` - Create comparison (protected)
- `/comparisons/:id` - Comparison details (protected)

## State Management

### Authentication Context
Manages user authentication state, login/logout functionality, and protected route access.

### Theme Context
Handles light/dark mode toggle with system preference detection and localStorage persistence.

## API Integration

### Base Configuration
- Base URL: Configurable via `VITE_API_BASE_URL`
- Automatic JWT token handling
- Request/response interceptors for error handling
- TypeScript interfaces for all API responses

### Services
- **authService**: User authentication and profile management
- **templatesService**: Template CRUD operations
- **comparisonsService**: Comparison operations

## Testing Strategy

### Unit Tests
- Component testing with React Testing Library
- Service testing with mocked API calls
- Utility function testing
- Custom hooks testing

### Test Coverage
- Aim for >80% code coverage
- Focus on critical user paths
- Test error states and edge cases

## Environment Variables

Key environment variables (see `.env.example`):

- `VITE_API_BASE_URL`: Backend API base URL
- `VITE_APP_TITLE`: Application title
- `VITE_MAX_FILE_SIZE_MB`: Maximum file upload size
- `VITE_ENABLE_DARK_MODE`: Enable/disable dark mode feature

## Contributing

1. Follow the established code style (ESLint + Prettier)
2. Write tests for new functionality
3. Update documentation as needed
4. Use conventional commit messages
5. Ensure all tests pass before submitting

## License

MIT License - see LICENSE file for details.