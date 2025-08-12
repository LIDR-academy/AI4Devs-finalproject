# Development Tickets - Personal Finance Management System

## Overview

This document contains comprehensive development tickets for both backend and
frontend development, designed for vertical slicing (complete features from
database to UI) and following a logical development sequence.

**Technology Stack:**

- **Backend**: NestJS with TypeORM, PostgreSQL, Redis
- **Frontend**: Next.js (as SPA), React Query, Tailwind CSS
- **Deployment**: Railway for both frontend and backend
- **Development Approach**: TDD + BDD with vertical slicing

---

## 🎯 Implementation Strategy: Vertical Slicing

All tickets must comply with the TDD + BDD Working Agreement:

- BDD scenarios in `prompts/11-bdd.md` are created or updated
- Tests are written first and initially fail; then minimal implementation; then
  refactor
- Coverage for files touched ≥ 80%
- CI green: tests, lint, and type checks pass

**Development Priority Order:**

1. **Foundation & Environment Setup**
2. **Backend API Foundation (Transactions)**
3. **Frontend UI Foundation (Transaction Management)**
4. **Backend Advanced Features (Categories, Recurring, Composition)**
5. **Frontend Advanced Features (Category Management, Advanced Forms)**
6. **Backend Reporting & Analytics**
7. **Frontend Dashboard & Reports**
8. **Backend Authentication & User Management**
9. **Frontend Authentication & User Interface**
10. **Integration & End-to-End Testing**

---

## 🚀 Ticket 1: Project Foundation & Development Environment

**Type**: Infrastructure  
**Priority**: Critical  
**Estimate**: 2 days  
**Dependencies**: None

**Acceptance Criteria**:

- [ ] Backend: Docker environment with PostgreSQL, Redis, and NestJS app
- [ ] Frontend: Next.js project with TypeScript, ESLint, and Prettier
- [ ] Both: Shared development environment with hot reloading
- [ ] Both: Environment configuration for development/staging/production
- [ ] Both: Health check endpoints and monitoring setup
- [ ] Railway deployment configuration for both services

**Technical Tasks**:

- [ ] Backend: Complete Docker setup (DS-1 from dev stories)
- [ ] Backend: Set up PostgreSQL and Redis containers
- [ ] Frontend: `npx create-next-app@latest` with TypeScript
- [ ] Frontend: Configure ESLint, Prettier, and Husky
- [ ] Frontend: Set up Tailwind CSS for styling
- [ ] Both: Create shared `.env.example` files
- [ ] Both: Set up development scripts and commands
- [ ] Both: Configure Railway deployment files
- [ ] Both: Set up environment variables for Railway

**Testing Requirements**:

- [ ] Backend: Health check e2e tests
- [ ] Frontend: Component rendering tests
- [ ] Both: Environment configuration validation

**Definition of Done**:

- [ ] Both applications start with single command
- [ ] Hot reloading works in both environments
- [ ] Database connection verified
- [ ] All linting and type checks pass
- [ ] Railway deployment configuration ready

---

## 🗄️ Ticket 2: Backend - Transaction Database Schema & API Foundation

**Type**: Backend  
**Priority**: Critical  
**Estimate**: 1.5 days  
**Dependencies**: Ticket 1

**Acceptance Criteria**:

- [ ] Transaction entity with TypeORM decorators and validation
- [ ] Category entity with hierarchical support
- [ ] Basic CRUD API endpoints for transactions
- [ ] Request/response DTOs with validation
- [ ] Swagger/OpenAPI documentation
- [ ] Integration tests for all endpoints
- [ ] Mock user service for development

**Technical Tasks**:

- [ ] Implement DS-2 through DS-7 from dev stories
- [ ] Add explicit API endpoint specifications:
  - `POST /api/transactions` - Create transaction
  - `GET /api/transactions` - List transactions with filtering
  - `GET /api/transactions/:id` - Get transaction details
  - `PUT /api/transactions/:id` - Update transaction
  - `DELETE /api/transactions/:id` - Delete transaction
- [ ] Create comprehensive DTOs with validation rules
- [ ] Add database migrations
- [ ] Implement error handling middleware
- [ ] Create MockUserService for development

**Testing Requirements**:

- [ ] Unit tests for entities and DTOs
- [ ] Integration tests for API endpoints
- [ ] E2E tests for complete transaction flow

**Definition of Done**:

- [ ] All API endpoints return proper HTTP status codes
- [ ] Validation errors are user-friendly
- [ ] Swagger documentation is complete
- [ ] Test coverage > 80%
- [ ] Mock user service returns consistent user ID

---

## 🎨 Ticket 3: Frontend - Transaction Management UI Components

**Type**: Frontend  
**Priority**: High  
**Estimate**: 2 days  
**Dependencies**: Ticket 2

**Acceptance Criteria**:

- [ ] Transaction list component with filtering and sorting
- [ ] Transaction form component (create/edit)
- [ ] Transaction detail view component
- [ ] Responsive design for mobile and desktop
- [ ] Form validation with error handling
- [ ] Loading states and optimistic updates
- [ ] Accessibility support (ARIA labels, keyboard navigation)
- [ ] Internationalization (English/Spanish)

**Technical Tasks**:

- [ ] Set up React Query for API state management
- [ ] Create reusable UI components (Button, Input, Select, etc.)
- [ ] Implement transaction list with virtual scrolling for large datasets
- [ ] Create transaction form with category selection
- [ ] Add form validation using React Hook Form + Zod
- [ ] Implement i18n using next-intl
- [ ] Add responsive breakpoints and mobile-first design
- [ ] Create loading skeletons and error boundaries

**Testing Requirements**:

- [ ] Component unit tests with React Testing Library
- [ ] Form validation tests
- [ ] Accessibility tests with jest-axe
- [ ] Responsive design tests

**Definition of Done**:

- [ ] All components render correctly on mobile and desktop
- [ ] Form validation works in both languages
- [ ] Accessibility score > 90%
- [ ] Components integrate with backend API

---

## 🔧 Ticket 4: Backend - Category Management & Advanced Transaction Features

**Type**: Backend  
**Priority**: High  
**Estimate**: 2 days  
**Dependencies**: Ticket 2

**Acceptance Criteria**:

- [ ] Category CRUD operations with hierarchical support
- [ ] Transaction frequency and recurring transactions
- [ ] Transaction composition with mathematical expressions
- [ ] Bank account integration
- [ ] All features covered by integration tests

**Technical Tasks**:

- [ ] Implement DS-8 through DS-18 from dev stories
- [ ] Add category management endpoints:
  - `GET /api/categories` - List categories
  - `POST /api/categories` - Create category
  - `PUT /api/categories/:id` - Update category
  - `DELETE /api/categories/:id` - Delete category
- [ ] Implement recurring transaction logic with cron expressions
- [ ] Add transaction composition calculator
- [ ] Create bank account management endpoints
- [ ] Add Redis caching for expensive operations

**Testing Requirements**:

- [ ] Unit tests for business logic
- [ ] Integration tests for complex workflows
- [ ] Performance tests for recurring transactions

**Definition of Done**:

- [ ] All business logic is covered by tests
- [ ] Recurring transactions generate correctly
- [ ] Composition calculations are accurate
- [ ] API response times < 500ms
- [ ] Redis caching improves performance

---

## 🎯 Ticket 5: Frontend - Category Management & Advanced Transaction UI

**Type**: Frontend  
**Priority**: High  
**Estimate**: 2 days  
**Dependencies**: Ticket 4

**Acceptance Criteria**:

- [ ] Category management interface (CRUD operations)
- [ ] Recurring transaction setup form
- [ ] Transaction composition calculator interface
- [ ] Bank account management interface
- [ ] Advanced filtering and search capabilities
- [ ] Real-time updates for recurring transactions

**Technical Tasks**:

- [ ] Create category management components
- [ ] Implement recurring transaction form with frequency selector
- [ ] Build transaction composition calculator with expression builder
- [ ] Create bank account management interface
- [ ] Add advanced search with autocomplete
- [ ] Implement real-time updates using WebSockets or polling
- [ ] Add confirmation dialogs for destructive actions

**Testing Requirements**:

- [ ] Component integration tests
- [ ] Form workflow tests
- [ ] Real-time update tests
- [ ] Accessibility tests

**Definition of Done**:

- [ ] All advanced features work correctly
- [ ] Real-time updates function properly
- [ ] User experience is smooth and intuitive
- [ ] All components are accessible

---

## 📊 Ticket 6: Backend - Reporting & Analytics Engine

**Type**: Backend  
**Priority**: Medium  
**Estimate**: 1.5 days  
**Dependencies**: Ticket 4

**Acceptance Criteria**:

- [ ] Transaction overview with date range filtering
- [ ] Category analysis with percentage breakdowns
- [ ] Spending trends and patterns
- [ ] Export functionality (CSV, JSON)
- [ ] Caching for performance optimization

**Technical Tasks**:

- [ ] Implement DS-19 through DS-23 from dev stories
- [ ] Create reporting endpoints:
  - `GET /api/reports/overview` - Transaction overview
  - `GET /api/reports/categories` - Category analysis
  - `GET /api/reports/trends` - Spending trends
  - `GET /api/reports/export` - Data export
- [ ] Implement Redis caching for expensive calculations
- [ ] Add data aggregation and optimization
- [ ] Create export service for different formats

**Testing Requirements**:

- [ ] Unit tests for calculation logic
- [ ] Integration tests for reporting endpoints
- [ ] Performance tests for large datasets

**Definition of Done**:

- [ ] All reports generate correctly
- [ ] Caching improves performance by >50%
- [ ] Export functionality works for all formats
- [ ] API response times < 200ms for cached data

---

## 📈 Ticket 7: Frontend - Dashboard & Reporting Interface

**Type**: Frontend  
**Priority**: Medium  
**Estimate**: 2 days  
**Dependencies**: Ticket 6

**Acceptance Criteria**:

- [ ] Interactive dashboard with key metrics
- [ ] Charts and graphs for financial data visualization
- [ ] Date range picker for reports
- [ ] Export functionality for reports
- [ ] Responsive design for all screen sizes
- [ ] Accessibility for screen readers

**Technical Tasks**:

- [ ] Set up chart library (Recharts or Chart.js)
- [ ] Create dashboard layout with metric cards
- [ ] Implement interactive charts for spending analysis
- [ ] Build date range picker component
- [ ] Add export functionality with file download
- [ ] Create responsive grid layout
- [ ] Implement keyboard navigation for charts

**Testing Requirements**:

- [ ] Chart rendering tests
- [ ] Dashboard interaction tests
- [ ] Export functionality tests
- [ ] Accessibility tests for charts

**Definition of Done**:

- [ ] Dashboard loads all metrics correctly
- [ ] Charts are interactive and accessible
- [ ] Export functionality works in all browsers
- [ ] Mobile experience is optimized

---

## 🔐 Ticket 8: Backend - User Authentication & Profile Management

**Type**: Backend  
**Priority**: Low (implemented last)  
**Estimate**: 2 days  
**Dependencies**: Ticket 7

**Acceptance Criteria**:

- [ ] JWT-based authentication system
- [ ] User registration and login endpoints
- [ ] User profile management
- [ ] Role-based access control
- [ ] Password reset functionality
- [ ] Session management

**Technical Tasks**:

- [ ] Implement DS-28 through DS-34 from dev stories
- [ ] Add authentication endpoints:
  - `POST /api/auth/register` - User registration
  - `POST /api/auth/login` - User login
  - `POST /api/auth/refresh` - Token refresh
  - `POST /api/auth/logout` - User logout
- [ ] Implement JWT strategy and guards
- [ ] Add password hashing and validation
- [ ] Create user profile management endpoints

**Testing Requirements**:

- [ ] Authentication flow tests
- [ ] Security tests for password handling
- [ ] Authorization tests for protected endpoints

**Definition of Done**:

- [ ] All authentication flows work correctly
- [ ] Security best practices are implemented
- [ ] Protected endpoints are properly secured
- [ ] Test coverage > 90%

---

## 👤 Ticket 9: Frontend - Authentication & User Profile Interface

**Type**: Frontend  
**Priority**: Low (implemented last)  
**Estimate**: 1.5 days  
**Dependencies**: Ticket 8

**Acceptance Criteria**:

- [ ] Login and registration forms
- [ ] User profile management interface
- [ ] Password reset flow
- [ ] Protected route handling
- [ ] Session persistence
- [ ] Multi-language support for auth forms

**Technical Tasks**:

- [ ] Create authentication forms with validation
- [ ] Implement protected route wrapper
- [ ] Add session management with React Context
- [ ] Create user profile forms
- [ ] Implement password reset workflow
- [ ] Add loading states and error handling
- [ ] Ensure all forms support both languages

**Testing Requirements**:

- [ ] Authentication flow tests
- [ ] Form validation tests
- [ ] Protected route tests
- [ ] Accessibility tests

**Definition of Done**:

- [ ] All authentication flows work correctly
- [ ] Protected routes redirect properly
- [ ] User sessions persist correctly
- [ ] All forms are accessible

---

## 🧪 Ticket 10: Integration & End-to-End Testing

**Type**: Integration  
**Priority**: High  
**Estimate**: 1 day  
**Dependencies**: All previous tickets

**Acceptance Criteria**:

- [ ] Complete user journey tests
- [ ] API contract validation
- [ ] Performance testing
- [ ] Security testing
- [ ] Accessibility testing
- [ ] Cross-browser compatibility
- [ ] Railway deployment verification

**Technical Tasks**:

- [ ] Create end-to-end test scenarios
- [ ] Implement API contract testing
- [ ] Add performance benchmarks
- [ ] Conduct security audit
- [ ] Test accessibility compliance
- [ ] Verify cross-browser functionality
- [ ] Test Railway deployment and scaling

**Testing Requirements**:

- [ ] E2E tests for all user stories
- [ ] Performance benchmarks
- [ ] Security vulnerability scan
- [ ] Accessibility compliance check

**Definition of Done**:

- [ ] All user journeys pass E2E tests
- [ ] Performance meets requirements
- [ ] No critical security vulnerabilities
- [ ] Accessibility compliance verified
- [ ] Railway deployment successful

---

## 🚀 Railway Deployment Configuration

### Backend Service

```yaml
# railway.toml
[build]
builder = "dockerfile"

[deploy]
startCommand = "npm run start:prod"
healthcheckPath = "/health"
healthcheckTimeout = 300

[env]
NODE_ENV = "production"
DATABASE_URL = "postgresql://..."
REDIS_URL = "redis://..."
JWT_SECRET = "..."
```

### Frontend Service

```yaml
# railway.toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
healthcheckPath = "/"
healthcheckTimeout = 300

[env]
NEXT_PUBLIC_API_URL = "https://your-backend.railway.app"
NEXT_PUBLIC_APP_URL = "https://your-frontend.railway.app"
```

### Environment Variables

```bash
# Backend
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=your-secret-key
NODE_ENV=production
PORT=3000

# Frontend
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_APP_URL=https://your-frontend.railway.app
NEXT_PUBLIC_APP_NAME="Personal Finance Manager"
```

---

## 📅 Development Timeline

**Week 1**: Tickets 1-2 (Foundation + Backend API) **Week 2**: Tickets 3-4
(Frontend UI + Backend Features) **Week 3**: Tickets 5-6 (Advanced Features +
Reporting) **Week 4**: Tickets 7-8 (Dashboard + Authentication) **Week 5**:
Tickets 9-10 (Frontend Auth + Integration)

**Total Estimated Effort**: 16.5 days (3.5 weeks for core features + 1.5 weeks
for user management)

---

## 🔄 Railway Workflow

### Development Workflow

1. **Local Development**: Use Docker Compose for local environment
2. **Feature Branches**: Develop features in separate branches
3. **Testing**: Run tests locally before pushing
4. **Pull Request**: Create PR with tests passing
5. **Railway Preview**: Automatic preview deployment for PRs
6. **Merge**: Merge to main triggers production deployment

### Deployment Strategy

1. **Preview Deployments**: Automatic for all PRs
2. **Production Deployments**: Automatic on main branch merge
3. **Database Migrations**: Run automatically on deployment
4. **Health Checks**: Verify services are running
5. **Rollback**: Automatic rollback on health check failure

---

## 📋 Key Benefits of This Approach

1. **Vertical Slicing**: Each ticket delivers complete user-facing features
2. **Parallel Development**: Backend and frontend teams can work simultaneously
3. **Clear Integration Points**: Well-defined API contracts between teams
4. **Incremental Value**: Each ticket adds working functionality
5. **Quality Focus**: TDD/BDD approach ensures reliability
6. **Railway Integration**: Seamless deployment and scaling
7. **SPA Architecture**: Simple, fast, and maintainable frontend

---

## 🎯 Success Metrics

### Development Metrics

- [ ] All tickets completed within estimated time
- [ ] Test coverage > 80% for backend, > 70% for frontend
- [ ] Zero critical bugs in production
- [ ] All accessibility requirements met

### Performance Metrics

- [ ] API response times < 500ms for 95% of requests
- [ ] Frontend page load times < 2 seconds
- [ ] Database query performance optimized
- [ ] Redis cache hit rate > 80%

### User Experience Metrics

- [ ] All user stories implemented and tested
- [ ] Mobile responsiveness verified
- [ ] Accessibility compliance achieved
- [ ] Multi-language support working

---

## 📝 Notes

- **Mock User Approach**: Single hardcoded user until authentication is
  implemented
- **DDD Principles**: Strict adherence to domain boundaries
- **Testing Strategy**: Integration tests for all user stories
- **Documentation**: API documentation for all endpoints
- **Performance**: Monitor and optimize throughout development
- **Railway**: Leverage automatic deployments and scaling
- **SPA**: Keep frontend simple and performant

This ticket system ensures systematic development with clear deliverables,
proper testing, and seamless deployment on Railway.
