# OpenAPI Codegen Implementation Plan

## Overview

This document outlines the implementation plan for OpenAPI code generation in the project using verdaccio for local development. The generated code will provide type-safe API clients for both frontend and integration tests, ensuring consistency and reducing manual maintenance.

## How OpenAPI and Codegen Work

### OpenAPI (Swagger)
- **Definition**: OpenAPI is a specification for describing REST APIs
- **Current Setup**: The backend uses `@nestjs/swagger` to automatically generate OpenAPI documentation from NestJS decorators
- **Output**: Generates a JSON/YAML specification file that describes all endpoints, request/response schemas, and validation rules

### Code Generation
- **Purpose**: Automatically generates client SDKs, types, and utilities from OpenAPI specifications
- **Benefits**: 
  - Type-safe API calls
  - Automatic validation
  - Consistent error handling
  - Reduced manual maintenance
  - Better developer experience
  - Repository isolation support

## Current State Analysis

### Backend (✅ Ready)
- OpenAPI/Swagger configured with `@nestjs/swagger`
- API documentation available at `/api/docs`
- DTOs properly decorated with Swagger annotations
- Validation pipes configured

### Frontend (❌ Needs Setup)
- No OpenAPI client generation
- Manual API calls in `services/api.ts`
- No type safety for API responses
- Can work as isolated repository or submodule

### Integration Tests (❌ Needs Setup)
- No generated API client
- Manual HTTP requests in tests

## Implementation Plan

### Phase 1: Setup OpenAPI Generator CLI

#### 1.1 Install Dependencies
```bash
# Backend
npm install --save-dev @openapitools/openapi-generator-cli

# Frontend (optional - for local generation)
npm install --save-dev @openapitools/openapi-generator-cli
```

#### 1.2 Configure OpenAPI Generator
The backend uses the OpenAPI generator CLI directly (no Docker required):

```json
{
  "scripts": {
    "codegen:client": "openapi-generator-cli generate -i openapi.json -g typescript-fetch -o src/generated"
  },
  "devDependencies": {
    "@openapitools/openapi-generator-cli": "^2.22.0"
  }
}
```

**Note**: The backend container includes Java (OpenJDK 17) to run the OpenAPI generator CLI.

### Phase 2: Generate OpenAPI Specification

#### 2.1 Create Generation Script
Add to `backend/package.json`:
```json
{
  "scripts": {
    "swagger:generate": "npm run start --watch=false & sleep 5 && curl http://backend:3000/api-json > openapi.json && pkill -f 'npm run start'"
  }
}
```

#### 2.2 Generate Specification
```bash
cd backend
npm run swagger:generate
```

### Phase 3: Backend Package Publishing

#### 3.1 Setup Package Configuration
Create `backend/package.client.json`:
```json
{
  "name": "ai4devs-api-client",
  "version": "1.0.0",
  "description": "TypeScript API client for AI4Devs Personal Finance Manager",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"]
}
```

#### 3.2 Add Scripts
Add to `backend/package.json`:
```json
{
  "scripts": {
    "codegen:client": "docker run --rm -v ${PWD}:/local openapitools/openapi-generator-cli:v7.14.0 generate -i /local/openapi.json -g typescript-fetch -o /local/src/generated",
    "codegen:package": "npm run codegen:client && npm run build:package",
    "register:publish": "npm run codegen:package && yalc publish",
    "register:push": "yalc push"
  },
  "devDependencies": {
    "yalc": "^1.0.0-pre.53"
  }
}
```
    "build:package": "tsc -p tsconfig.client.json",
    "prepublishOnly": "npm run codegen:package"
  }
}
```

#### 3.3 Publish Package
```bash
cd backend
npm run codegen:package
npm publish
```

#### 3.4 Version Management Strategy

**Docker Container Workflow:**

The `backend-publisher` container automatically unpublishes and republishes the same version of `package.client.json`, so that official changes in the codegen package are only reserved from when the API really changes.

**⚠️ First-Time Docker Startup Caveat:**
Due to verdaccio being a fake registry, the first time the project runs, the frontend might fail to find the codegen client package. This happens because the frontend container tries to install the package before it's available

**Solution for First-Time Setup:**
```bash
docker-compose up backend-publisher
```

**Note:** After the first successful run, the package remains in verdaccio's storage volume, so subsequent `docker-compose up` commands will work without manual intervention.

**Manual Version Updates (Required for API Changes):**
- When making **breaking changes** to the API, manually increment the version in `package.client.json`
- Follow **semantic versioning**:
  - **Patch (1.0.0 → 1.0.1)**: Bug fixes, non-breaking changes
  - **Minor (1.0.0 → 1.1.0)**: New features, backward compatible
  - **Major (1.0.0 → 2.0.0)**: Breaking changes, API incompatibilities
- After version change, the new version should be published to verdaccio

**Example Workflow:**
```bash
# For API changes requiring version bump
cd backend
# 1. Manually edit package.client.json version (e.g., 1.0.0 → 1.0.1)
# 2. Publish new version
npm run republish:client
```

### Phase 4: Frontend Integration with fake register

#### 4.1 Add Scripts
Add to `frontend/package.json`:
```json
{
  "scripts": {
    "register:add": "yalc add ai4devs-api-client",
    "register:update": "yalc update",
    "register:remove": "yalc remove ai4devs-api-client"
  },
  "devDependencies": {
    "yalc": "^1.0.0-pre.53"
  }
}
```

#### 4.2 Update API Service
Replace `frontend/src/services/api.ts` with generated client:
```typescript
import { Configuration, TransactionsApi, CategoriesApi } from 'ai4devs-api-client';

const config = new Configuration({
  basePath: process.env.NEXT_PUBLIC_API_URL || `http://localhost:${process.env.BACKEND.PORT ?? 3000}`'
});

export const transactionsApi = new TransactionsApi(config);
export const categoriesApi = new CategoriesApi(config);
```

#### 4.3 Use verdaccio for Local Development
```bash
cd frontend
npm run register:add  # Adds to store
```

### Phase 6: Integration Test Integration

#### 6.1 Add Scripts
Add to root `package.json`:
```json
{
  "scripts": {
    "register:test:add": "yalc add ai4devs-api-client",
    "register:test:update": "yalc update",
    "register:test:remove": "yalc remove ai4devs-api-client"
  },
  "devDependencies": {
    "yalc": "^1.0.0-pre.53"
  }
}
```

#### 6.2 Update Test Setup
Create `test/setup/api-client.setup.ts`:
```typescript
import { Configuration, TransactionsApi, CategoriesApi, AppApi } from 'ai4devs-api-client';

export interface TestApiClient {
  transactions: any;
  categories: any;
  app: any;
}

export const createTestApiClient = (baseUrl?: string): TestApiClient => {
  const config = new Configuration({ 
    basePath: baseUrl || `http://localhost:${process.env.BACKEND_PORT ?? 3000}`,
    headers: {
      'Content-Type': 'application/json',
    }
  });
  
  return {
    transactions: new TransactionsApi(config),
    categories: new CategoriesApi(config),
    app: new AppApi(config)
  };
};

export { Configuration, TransactionsApi, CategoriesApi, AppApi };
export * from 'ai4devs-api-client';
```

#### 6.3 Use register for Test Setup
```bash
# In root directory
npm run register:test:add  # Adds to store
```

## File Structure After Implementation

```
project/
├── backend/
│   ├── openapi.json              # Generated OpenAPI spec
│   ├── package.client.json       # Client package configuration
│   ├── tsconfig.client.json     # Package build configuration
│   ├── src/generated/            # Generated TypeScript client
│   ├── dist/                     # Built NPM package
│   └── package.json              # Swagger generation script
├── frontend/
│   ├── src/
│   │   ├── generated/            # Generated TypeScript client (local)
│   │   └── services/
│   │       ├── api-client.ts     # NPM package client
│   │       ├── api-client.fallback.ts # Fallback to local
│   │       └── api.ts            # Updated to use generated client
│   └── package.json              # Codegen scripts
├── test/
│   ├── generated/                # Generated test client (local)
│   └── setup/
│       └── api-client.setup.ts   # Flexible client setup
├── openapitools.json             # Generator configuration
└── package.json                  # Root codegen scripts
```

## Benefits

### Development Experience
- **Type Safety**: Compile-time validation of API calls
- **IntelliSense**: Auto-completion for API methods and parameters
- **Error Prevention**: Catch API contract violations early
- **Repository Isolation**: Frontend can work independently
- **Fast Iteration**: A fake register enables rapid development cycles

### Maintenance
- **Single Source of Truth**: API specification drives all clients
- **Automatic Updates**: Regenerate clients when API changes
- **Consistency**: Same validation rules across frontend and tests
- **Simplified Workflows**: A fake register handles local development, NPM for production

### Testing
- **Reliable Tests**: Type-safe test data creation
- **Faster Development**: No manual HTTP request construction
- **Better Coverage**: Easier to test edge cases

## Migration Strategy

### Step 1: Setup Infrastructure
- Install dependencies
- Configure generators
- Create generation scripts

### Step 2: Backend Package
- Generate OpenAPI specification
- Setup package configuration
- Build package and publish to  store

### Step 3: Frontend Integration
- Add package from store
- Update API services
- Test basic functionality

### Step 4: Test Integration
- Update test setup
- Replace manual HTTP requests
- Test with generated client

### Step 5: Documentation
- Document both approaches
- Update team workflows

## Environment Variables

The system respects environment variables for configuration:

- `NEXT_PUBLIC_API_URL` - Frontend API base URL
- `BACKEND_PORT` - Backend port for OpenAPI generation (defaults to 3000)

## Risks and Mitigation

### Risk: Breaking Changes
- **Mitigation**: Generate clients in CI/CD pipeline
- **Mitigation**: Version API specifications
- **Mitigation**: NPM package versioning

### Risk: Generated Code Quality
- **Mitigation**: Customize generator templates
- **Mitigation**: Add post-generation linting
- **Mitigation**: Package build validation

### Risk: Build Performance
- **Mitigation**: Generate only when spec changes
- **Mitigation**: Cache generated code in CI/CD
- **Mitigation**: NPM package caching

### Risk: Repository Dependencies
- **Mitigation**: NPM package approach for isolation
- **Mitigation**: Local generation fallback
- **Mitigation**: Flexible import strategies

## Success Metrics

- [ ] OpenAPI specification generated automatically
- [ ] Package published and available locally
- [ ] Frontend uses generated client (100% migration)
- [ ] Integration tests use generated client (100% migration)
- [ ] Zero manual API call construction
- [ ] Type safety coverage > 95%
- [ ] Build time impact < 10%
- [ ] Repository isolation achieved
- [ ] Workflow working for both submodules and isolated repos

## Next Steps

1. **Review and Approve**: Team review of implementation plan
2. **Backend Setup**: Install dependencies and configure generators
3. **Setup**: Install fake register and configure local publishing
4. **Frontend Integration**: Add package from store and update services
5. **Test Integration**: Update test setup and replace manual calls
6. **Documentation**: Update team workflows and processes
7. **CI/CD Integration**: Automate generation and publishing
