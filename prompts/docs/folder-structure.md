# 📁 AI4Devs Final Project - Folder Structure

This document defines the **mandatory folder structure** that must be followed throughout the project. All code, tests, and documentation must adhere to this organization.

## 🏗️ Root Project Structure

```
AI4Devs-finalproject/
├── 📁 backend/                     # Backend Node.js application
├── 📁 frontend/                    # Frontend React application  
├── 📁 scripts/                     # Project automation scripts
├── 📁 prompts/                     # Documentation and prompts
├── 📄 docker-compose.yml           # Docker services configuration
├── 📄 .gitignore                   # Git ignore rules
└── 📄 README.md                    # Project overview
```

## 🔧 Backend Structure (`/backend/`)

```
backend/
├── 📁 src/                         # Source code
│   ├── 📁 controllers/             # API controllers (DDD Application Layer)
│   ├── 📁 services/                # Business logic services (DDD Domain Layer)
│   ├── 📁 domain/                  # Domain Layer (DDD Core)
│   │   ├── 📁 entities/            # Domain entities
│   │   ├── 📁 repositories/        # Repository interfaces
│   │   ├── 📁 services/            # Domain services
│   │   ├── 📁 dto/                 # Data Transfer Objects
│   │   ├── 📁 events/              # Domain events
│   │   └── 📁 interfaces/          # Domain interfaces
│   ├── 📁 application/             # Application Layer (DDD Use Cases)
│   │   ├── 📁 useCases/            # Application use cases
│   │   └── 📁 services/            # Application services
│   ├── 📁 infrastructure/          # Infrastructure Layer (DDD External)
│   │   ├── 📁 repositories/        # Repository implementations
│   │   └── 📁 events/              # Event handlers
│   ├── 📁 modules/                 # Feature modules
│   ├── 📁 middlewares/             # Express middleware (renamed from middleware)
│   ├── 📁 routes/                  # API route definitions
│   ├── 📁 types/                   # TypeScript type definitions
│   ├── 📁 utils/                   # Utility functions
│   ├── 📁 lib/                     # Third-party library configurations
│   ├── 📄 app.ts                   # Express app configuration
│   ├── 📄 server.ts                # Server startup
│   ├── 📄 index.ts                 # Application entry point
│   ├── 📄 swagger.ts               # Swagger configuration
│   ├── 📄 swagger-schema.json      # Swagger schema definition
│   └── 📄 types.d.ts               # Global type declarations
├── 📁 prisma/                      # Database schema and migrations
│   ├── 📁 migrations/              # Database migration files
│   ├── 📁 temp/                    # Temporary files for seeding
│   ├── 📄 schema.prisma            # Database schema definition
│   └── 📄 seed.ts                  # Database seeding script
├── 📁 uploads/                     # File upload storage (local development)
│   └── 📁 documents/               # Document storage directory
├── 📁 __tests__/                   # Test files (MANDATORY structure)
│   ├── 📁 unit/                    # Unit tests
│   │   ├── 📁 __mocks__/           # Unit test mocks
│   │   └── 📄 *.spec.ts            # Unit test files
│   └── 📁 integration/             # Integration tests
│       ├── 📁 __mocks__/           # Integration test mocks
│       └── 📄 *.integration.spec.ts # Integration test files
├── 📄 package.json                 # Dependencies and scripts
├── 📄 jest.config.js               # Jest testing configuration
├── 📄 tsconfig.json                # TypeScript configuration
└── 📄 .env                         # Environment variables (DO NOT COMMIT)
```

## ⚛️ Frontend Structure (`/frontend/`)

```
frontend/
├── 📁 src/                         # Source code
│   ├── 📁 components/              # React components
│   │   ├── 📁 ui/                  # Reusable UI components (shadcn/ui)
│   │   ├── 📁 layout/              # Layout components
│   │   ├── 📁 admin/               # Admin panel components
│   │   ├── 📁 chat/                # Chatbot components
│   │   ├── 📁 dashboard/           # Dashboard components
│   │   ├── 📁 documents/           # Document management components
│   │   ├── 📁 faqs/                # FAQ components
│   │   ├── 📁 flowise/             # Flowise integration components
│   │   ├── 📁 products/            # Product components
│   │   ├── 📁 services/            # Services components
│   │   └── 📁 slashpage/           # Landing page components
│   ├── 📁 pages/                   # Page components
│   ├── 📁 hooks/                   # Custom React hooks
│   ├── 📁 api/                     # API client functions
│   ├── 📁 services/                # API service functions
│   ├── 📁 contexts/                # React Context providers
│   ├── 📁 types/                   # TypeScript type definitions
│   │   └── 📁 dto/                 # Data Transfer Objects
│   ├── 📁 utils/                   # Utility functions
│   ├── 📁 lib/                     # Third-party library configurations
│   ├── 📄 App.tsx                  # Main App component
│   ├── 📄 App.css                  # App-specific styles
│   ├── 📄 main.tsx                 # Application entry point
│   ├── 📄 index.css                # Global styles
│   ├── 📄 setupTests.ts            # Test setup configuration
│   └── 📄 vite-env.d.ts            # Vite environment types
├── 📁 public/                      # Static assets
├── 📁 __test__/                    # Test files (MANDATORY structure)
│   ├── 📁 unit/                    # Unit tests
│   │   ├── 📁 __mocks__/           # Unit test mocks
│   │   └── 📄 *.{test,spec}.{js,ts,tsx} # Unit test files
│   └── 📁 e2e/                     # End-to-end tests
│       ├── 📁 support/             # Cypress support files
│       │   ├── 📄 commands.js      # Custom Cypress commands
│       │   └── 📄 e2e.js           # Cypress setup file
│       └── 📄 *.cy.{js,ts,tsx}     # E2E test files
├── 📄 package.json                 # Dependencies and scripts
├── 📄 vite.config.ts               # Vite configuration
├── 📄 vitest.config.ts             # Vitest testing configuration
├── 📄 cypress.config.cjs           # Cypress E2E testing configuration
├── 📄 tailwind.config.js           # Tailwind CSS configuration
└── 📄 tsconfig.json                # TypeScript configuration
```

## 🤖 Scripts Structure (`/scripts/`)

```
scripts/
├── 📄 move-temp-files.sh           # Move files from temp to uploads
├── 📄 restart-all.sh               # Restart all services
├── 📄 run-e2e-tests.sh             # Run E2E test suite
└── 📄 generate-zip-archives.sh     # Generate project archives
```

## 📚 Documentation Structure (`/prompts/`)

```
prompts/
├── 📁 docs/                        # Technical documentation
│   ├── 📄 PRD.md                   # Product Requirements Document
│   ├── 📄 langchain.md             # LangChain implementation guide
│   ├── 📄 metaprompt.md            # AI agent metaprompt
│   ├── 📄 owasp.md                 # Security guidelines
│   └── 📄 prompt_agent.md          # Agent prompt configuration
├── 📄 04_task-list.md              # Project task tracking
└── 📄 folder-structure.md          # This document
```

## 🚫 Forbidden Patterns

### ❌ DO NOT CREATE:
- `package.json` in project root
- Test files outside `__tests__/` or `__test__/` directories
- Loose configuration files in root
- `cypress/` directory in frontend (use `__test__/e2e/` instead)
- Files directly in `src/` without proper subdirectories

### ❌ DO NOT USE:
- Mixed naming conventions (stick to kebab-case for files)
- Nested test directories beyond the defined structure
- Hardcoded paths that don't follow this structure

## ✅ Mandatory Rules

### 📁 **Directory Naming**
- Use **kebab-case** for directory names: `document-service`, `user-controller`
- Use **camelCase** for TypeScript files: `userService.ts`, `documentController.ts`
- Use **PascalCase** for React components: `UserProfile.tsx`, `DocumentList.tsx`

### 🧪 **Test Organization**
- **Unit tests**: `__tests__/unit/` (backend) or `__test__/unit/` (frontend)
- **Integration tests**: `__tests__/integration/` (backend only)
- **E2E tests**: `__test__/e2e/` (frontend only)
- **Mocks**: Always in `__mocks__/` subdirectory within test folders

### 📦 **File Placement**
- **Controllers**: Business logic entry points → `src/controllers/`
- **Services**: Core business logic → `src/services/`
- **Repositories**: Data access → `src/repositories/`
- **Types**: Shared TypeScript definitions → `src/types/`
- **Utils**: Helper functions → `src/utils/`

### 🔧 **Configuration Files**
- Keep configuration files at the appropriate level (backend/frontend)
- Environment files (`.env`) must never be committed
- All scripts must be executable and placed in `/scripts/`

## 📋 Compliance Checklist

Before creating any new file or directory, verify:

- [ ] Does it follow the defined folder structure?
- [ ] Is it in the correct directory for its purpose?
- [ ] Does the naming convention match the rules?
- [ ] Are test files in the proper test directories?
- [ ] Are mocks in the appropriate `__mocks__/` subdirectory?

## 🎯 Benefits of This Structure

1. **Consistency**: Everyone knows where to find and place files
2. **Scalability**: Clear separation of concerns supports growth
3. **Testing**: Organized test structure ensures comprehensive coverage
4. **DDD Compliance**: Backend follows Domain-Driven Design principles
5. **Tool Integration**: Proper structure supports IDE and tool features
6. **Onboarding**: New developers can quickly understand the codebase

---

**⚠️ IMPORTANT**: This structure is **mandatory** and must be followed by all team members and AI assistants. Any deviation requires explicit approval and documentation update. 