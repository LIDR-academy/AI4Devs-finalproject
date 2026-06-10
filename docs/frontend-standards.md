---
description: Frontend development standards, best practices, and conventions for the INK-LINK Angular 20 application including component patterns, state management, UI/UX guidelines, and testing practices
globs: ["frontend/src/**/*.{ts,html,css}", "frontend/cypress/**/*.{ts,js}", "frontend/tsconfig.json", "frontend/cypress.config.ts", "frontend/angular.json", "frontend/package.json"]
alwaysApply: true
---

# Frontend Project Configuration and Best Practices

## Table of Contents

- [Frontend Project Configuration and Best Practices](#frontend-project-configuration-and-best-practices)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Technology Stack](#technology-stack)
    - [Core Technologies](#core-technologies)
    - [UI Framework](#ui-framework)
    - [State Management \& Data Flow](#state-management--data-flow)
    - [Testing Framework](#testing-framework)
    - [Development Tools](#development-tools)
  - [Project Structure](#project-structure)
  - [Coding Standards](#coding-standards)
    - [Naming Conventions](#naming-conventions)
    - [Component Conventions](#component-conventions)
      - [Standalone Components](#standalone-components)
      - [Component Inputs and Outputs](#component-inputs-and-outputs)
    - [State Management](#state-management)
      - [Local State with Signals](#local-state-with-signals)
      - [Loading and Error States](#loading-and-error-states)
    - [Service Layer Architecture](#service-layer-architecture)
      - [API Services](#api-services)
  - [UI/UX Standards](#uiux-standards)
    - [Angular Material Integration](#angular-material-integration)
    - [Form Handling](#form-handling)
    - [Navigation Patterns](#navigation-patterns)
    - [Accessibility](#accessibility)
  - [Testing Standards](#testing-standards)
    - [End-to-End Testing with Cypress](#end-to-end-testing-with-cypress)
    - [Test Organization](#test-organization)
  - [Configuration Standards](#configuration-standards)
    - [TypeScript Configuration](#typescript-configuration)
    - [ESLint Configuration](#eslint-configuration)
    - [Environment Configuration](#environment-configuration)
  - [Performance Best Practices](#performance-best-practices)
    - [Component Optimization](#component-optimization)
    - [Bundle Optimization](#bundle-optimization)
    - [API Efficiency](#api-efficiency)
  - [Development Workflow](#development-workflow)
    - [Git Workflow](#git-workflow)
    - [Development Scripts](#development-scripts)
    - [Code Quality](#code-quality)
  - [Angular Version Upgrade Strategy](#angular-version-upgrade-strategy)
    - [Standalone Components](#standalone-components-1)
    - [Component Modernization](#component-modernization)

---

## Overview

This document outlines the best practices, conventions, and standards used in the INK-LINK frontend application. These practices ensure code consistency, maintainability, and optimal development experience.

## Technology Stack

### Core Technologies
- **Angular 20**: Modern Angular with standalone components and signals
- **TypeScript**: For type safety and better development experience
- **Angular CLI**: Build tooling and development server
- **Angular Router**: Client-side routing and navigation

### UI Framework
- **Angular Material**: Component library for consistent UI and styling
- **Angular CDK**: Headless utilities including drag and drop functionality
- **Angular Material Icons**: Icon library

### State Management & Data Flow
- **Angular Signals**: `signal()`, `computed()`, `effect()` for reactive local state
- **RxJS**: Observables for async data streams from services
- **Angular HttpClient**: HTTP client for API communication

### Testing Framework
- **Cypress 14.4.1**: End-to-end testing
- **Jest**: Unit testing
- **Angular Testing Library**: Component testing utilities

### Development Tools
- **ESLint**: Code linting with Angular-specific rules
- **TypeScript**: Static type checking
- **Angular DevTools**: Performance monitoring and debugging

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── components/       # Reusable UI components
│   │   ├── services/         # API service layer
│   │   ├── models/           # TypeScript interfaces and types
│   │   ├── pages/            # Page-level components
│   │   ├── app.component.ts  # Root component
│   │   ├── app.component.html
│   │   ├── app.routes.ts     # Route definitions
│   │   └── app.config.ts     # Application providers configuration
│   ├── environments/
│   │   ├── environment.ts        # Development environment
│   │   └── environment.prod.ts   # Production environment
│   ├── assets/               # Images, fonts, static resources
│   ├── styles.css            # Global styles
│   └── main.ts               # Application entry point
├── cypress/
│   └── e2e/                  # End-to-end test files
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── angular.json              # Angular CLI configuration
└── cypress.config.ts         # Cypress configuration
```

## Coding Standards

### Naming Conventions

- **Component Naming**: Use PascalCase for Angular component classes (e.g., `CandidateCardComponent`, `PositionDetailsComponent`)
- **Variable Naming**: Use camelCase for variables and functions (e.g., `candidateId`, `handleSubmit`, `fetchPositions`)
- **Constants Naming**: Use UPPER_SNAKE_CASE for constants (e.g., `MAX_CANDIDATES_PER_PAGE`)
- **Type/Interface Naming**: Use PascalCase for types and interfaces (e.g., `CandidateData`, `PositionProps`, `ICandidateService`)
- **File Naming**: Use kebab-case for all files (e.g., `candidate-card.component.ts`, `position-details.component.html`, `candidate.service.ts`)
- **CSS Class Naming**: Use kebab-case for CSS classes (e.g., `candidate-card`, `position-details`)
- **Selector Naming**: Use kebab-case with app prefix (e.g., `app-candidate-card`, `app-position-details`)

**Examples:**

```typescript
// Good: All in English
import { Component, input, output } from '@angular/core';

type CandidateCardProps = {
  candidate: Candidate;
  index: number;
};

@Component({
  selector: 'app-candidate-card',
  standalone: true,
  templateUrl: './candidate-card.component.html',
})
export class CandidateCardComponent {
  candidate = input.required<Candidate>();
  index = input.required<number>();
  cardClick = output<Candidate>();

  handleCardClick(): void {
    this.cardClick.emit(this.candidate());
  }
}

// Avoid: Non-English comments or names
@Component({ selector: 'app-tarjeta-candidato' })
export class TarjetaCandidatoComponent {
  candidato = input.required<Candidato>();
  // Manejar clic en la tarjeta
  manejarClicTarjeta(): void { }
}
```

**Error Messages and Console Logs:**

```typescript
// Good: English error messages
catch (error) {
    console.error('Failed to fetch candidates:', error);
    this.error.set('Unable to load candidates. Please try again later.');
}

// Avoid: Non-English messages
catch (error) {
    console.error('Error al obtener candidatos:', error);
    this.error.set('No se pudieron cargar los candidatos. Por favor, inténtelo de nuevo más tarde.');
}
```

**Service Layer Examples:**

```typescript
// Good: English naming in services
@Injectable({ providedIn: 'root' })
export class CandidateService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/candidates`;

  getAllCandidates(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error fetching candidates:', error);
        throw error;
      })
    );
  }
}

// Avoid: Non-English naming
@Injectable({ providedIn: 'root' })
export class ServicioCandidatos {
  obtenerTodosLosCandidatos(): Observable<Candidato[]> {
    return this.http.get<Candidato[]>(this.apiUrl);
  }
}
```

### Component Conventions

#### Standalone Components
- **Always use standalone components** — do not use NgModules for new components
- **Use TypeScript** for all components (`.ts` + `.html` + `.css`)
- **Use signals** for reactive local state

```typescript
// Preferred - Standalone Angular component with signals
import { Component, signal, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { PositionService } from '../services/position.service';

type Position = {
  id: number;
  title: string;
  status: 'Open' | 'Hired' | 'Closed' | 'Draft';
};

@Component({
  selector: 'app-positions',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './positions.component.html',
})
export class PositionsComponent implements OnInit {
  private positionService = inject(PositionService);
  positions = signal<Position[]>([]);

  ngOnInit(): void {
    this.loadPositions();
  }

  private loadPositions(): void {
    this.positionService.getAllPositions().subscribe({
      next: (positions) => this.positions.set(positions),
    });
  }
}
```

#### Component Inputs and Outputs
- **Use signal-based inputs** (`input()`, `input.required()`) for component props
- **Use `output()`** for component events
- Include **default values** where appropriate

```typescript
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-candidate-card',
  standalone: true,
  templateUrl: './candidate-card.component.html',
})
export class CandidateCardComponent {
  candidate = input.required<Candidate>();
  index = input.required<number>();
  cardClick = output<Candidate>();

  handleClick(): void {
    this.cardClick.emit(this.candidate());
  }
}
```

### State Management

#### Local State with Signals
- Use **`signal()`** for component-level reactive state
- Use **`computed()`** for derived state
- Use **`effect()`** for side effects
- Use **`ngOnInit`** for data fetching on initialization

```typescript
export class PositionFormComponent implements OnInit {
  private positionService = inject(PositionService);

  formData = signal({
    title: '',
    description: '',
    status: 'Draft' as const,
  });

  isSaving = signal(false);

  handleInputChange(field: string, value: string): void {
    this.formData.update(prev => ({ ...prev, [field]: value }));
  }
}
```

#### Loading and Error States
- **Always handle loading states** for async operations
- **Implement error handling** with user-friendly messages
- **Use Angular Material Snackbar or inline messages** for feedback

```typescript
export class CandidatesComponent implements OnInit {
  private candidateService = inject(CandidateService);
  private snackBar = inject(MatSnackBar);

  loading = signal(true);
  error = signal('');
  candidates = signal<Candidate[]>([]);

  ngOnInit(): void {
    this.candidateService.getAllCandidates().pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (data) => this.candidates.set(data),
      error: (err) => {
        this.error.set('Error loading candidates: ' + err.message);
        this.snackBar.open('Failed to load candidates', 'Close', { duration: 3000 });
      }
    });
  }
}
```

### Service Layer Architecture

#### API Services
- **Centralize API calls** in service files
- Use **Angular `HttpClient`** for HTTP requests
- **Inject services** using `inject()` or constructor injection
- **Handle errors** with RxJS `catchError` operator

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PositionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/positions`;

  getAllPositions(): Observable<Position[]> {
    return this.http.get<Position[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error fetching positions:', error);
        throw error;
      })
    );
  }

  updatePosition(id: number, positionData: Partial<Position>): Observable<Position> {
    return this.http.put<Position>(`${this.apiUrl}/${id}`, positionData).pipe(
      catchError(error => {
        console.error('Error updating position:', error);
        throw error;
      })
    );
  }
}
```

## UI/UX Standards

### Angular Material Integration
- Use **Angular Material components** for all UI elements
- **Import only the modules needed** per component
- Follow **Material Design** responsive layout principles

```typescript
import {
  MatCardModule,
  MatButtonModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatProgressSpinnerModule,
} from '@angular/material';
```

### Form Handling
- Use **Reactive Forms** (`FormGroup`, `FormControl`) for complex forms
- Use **Template-driven forms** for simple forms
- Implement **real-time validation** where appropriate
- **Disable submit buttons** during form submission

```typescript
export class PositionFormComponent {
  private fb = inject(FormBuilder);

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    status: ['Draft', Validators.required],
  });

  saving = signal(false);

  onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    // submit logic
  }
}
```

```html
<!-- position-form.component.html -->
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <mat-form-field>
    <mat-label>Title *</mat-label>
    <input matInput formControlName="title" />
    <mat-error>Title is required</mat-error>
  </mat-form-field>
  <button mat-raised-button color="primary" type="submit" [disabled]="saving()">
    {{ saving() ? 'Saving...' : 'Save' }}
  </button>
</form>
```

### Navigation Patterns
- Use **Angular Router** for all navigation
- **Implement breadcrumbs** with back navigation
- Use **programmatic navigation** with `Router` service

```typescript
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({ /* ... */ })
export class SomeComponent {
  private router = inject(Router);

  navigateBack(): void {
    this.router.navigate(['/']);
  }

  navigateToCandidate(id: number): void {
    this.router.navigate(['/candidates', id]);
  }
}
```

```html
<!-- Template navigation -->
<button mat-button (click)="navigateBack()">
  ← Back to Dashboard
</button>
```

### Accessibility
- Include **aria-label** attributes for interactive elements
- Use **semantic HTML** elements
- Ensure **keyboard navigation** support
- Provide **alternative text** for images

```html
<mat-form-field>
  <mat-label>Search positions by title</mat-label>
  <input matInput placeholder="Search by title" aria-label="Search positions by title" />
</mat-form-field>
```

## Testing Standards

### End-to-End Testing with Cypress
- **Test user workflows** rather than implementation details
- Use **data-testid** attributes for reliable element selection
- **Organize tests by feature** (candidates.cy.ts, positions.cy.ts)
- **Include API testing** alongside UI testing

```typescript
describe('Positions API - Update', () => {
    beforeEach(() => {
        cy.window().then((win) => {
            win.localStorage.clear();
        });
    });

    it('should update a position successfully', () => {
        const updateData = {
            title: 'Updated Test Position',
            status: 'Open'
        };

        cy.request({
            method: 'PUT',
            url: `${API_URL}/positions/${testPositionId}`,
            body: updateData
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.data.title).to.eq(updateData.title);
        });
    });
});
```

### Test Organization
- **Group related tests** with describe blocks
- **Use descriptive test names** that explain the expected behavior
- **Test both success and error scenarios**
- **Include edge cases** and validation testing

## Configuration Standards

### TypeScript Configuration
- Enable **strict mode** for type checking
- Use **path mapping** with "@/*" for cleaner imports
- Include **Angular-specific compiler options**
- Configure **ES2022 or later target**

```json
{
    "compilerOptions": {
        "strict": true,
        "target": "ES2022",
        "useDefineForClassFields": false,
        "experimentalDecorators": true,
        "baseUrl": ".",
        "paths": {
            "@/*": ["src/*"]
        }
    }
}
```

### ESLint Configuration
- Extend **Angular ESLint** configuration
- Include **TypeScript ESLint** rules
- **Automatic code formatting** and error detection
- **Consistent code style** across the project

### Environment Configuration
- Use **`environment.ts`** files for API URLs and feature flags
- **Separate configurations** for development and production
- **Configure Cypress** with environment-specific settings

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3010'
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.production.com'
};
```

```typescript
// cypress.config.ts
export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:4200',
        env: {
            API_URL: 'http://localhost:3010'
        }
    }
});
```

## Performance Best Practices

### Component Optimization
- Use **`@defer`** blocks for lazy-loading heavy components
- Use **`OnPush`** change detection strategy when appropriate
- Use **`trackBy`** (or `track` in the new `@for` syntax) to minimize DOM re-renders
- **Extract reusable logic** into services or custom pipes

```html
<!-- New Angular control flow with track -->
@for (candidate of candidates(); track candidate.id) {
  <app-candidate-card [candidate]="candidate" />
}

<!-- Defer heavy components -->
@defer (on viewport) {
  <app-heavy-chart [data]="data()" />
}
```

### Bundle Optimization
- **Lazy load** feature routes with `loadComponent`
- **Tree shaking** enabled via Angular CLI
- **Code splitting** at route level
- **Optimize images** and static assets

```typescript
// app.routes.ts - lazy load routes
export const routes: Routes = [
  { path: '', component: DashboardComponent },
  {
    path: 'candidates',
    loadComponent: () =>
      import('./pages/candidates/candidates.component').then(m => m.CandidatesComponent)
  },
];
```

### API Efficiency
- **Implement proper error handling** for network requests
- **Cache API responses** using RxJS `shareReplay` where appropriate
- **Use loading states** to improve perceived performance
- **Cancel requests** on component destroy using `takeUntilDestroyed`

```typescript
export class CandidatesComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.candidateService.getAllCandidates().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(/* ... */);
  }
}
```

## Development Workflow

### Git Workflow
- **Feature Branches**: Develop features in separate branches, adding descriptive suffix "-frontend" to allow working in parallel and avoid conflicts or collisions
- **Descriptive Commits**: Write descriptive commit messages in English
- **Code Review**: Code review before merging
- **Small Branches**: Keep branches small and focused

### Development Scripts
```bash
ng serve                    # Development server (port 4200)
ng test                     # Run unit tests
ng build                    # Production build
ng build --configuration production  # Optimized production build
ng generate component path/name      # Generate a new component
ng generate service path/name        # Generate a new service
npm run cypress:open        # Open Cypress test runner
npm run cypress:run         # Run Cypress tests headlessly
```

### Code Quality
- **ESLint validation** before commits
- **TypeScript compilation** without errors
- **All tests passing** before deployment
- **Angular DevTools** for performance profiling

## Angular Version Upgrade Strategy

### Standalone Components
- **All new components** must be standalone (no NgModule)
- Use `inject()` for dependency injection over constructor injection for new code
- Use **signal-based inputs/outputs** (`input()`, `output()`) for new components
- Migrate legacy module-based components to standalone incrementally

### Component Modernization
- **Standalone components** over module-based components
- **Signals** instead of manual change detection
- **Angular Material** components for consistency
- **Responsive design** principles throughout
- Use **new control flow syntax** (`@if`, `@for`, `@switch`) instead of structural directives

This document serves as the foundation for maintaining code quality and consistency across the INK-LINK frontend application. All team members should follow these practices to ensure a maintainable and scalable codebase.
