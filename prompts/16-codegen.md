# OpenAPI Codegen Implementation Plan

## Overview

This document outlines the implementation plan for OpenAPI code generation in the project, supporting both isolated repositories and submodule workflows. The generated code will provide type-safe API clients for both frontend and integration tests, ensuring consistency and reducing manual maintenance.

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
Update root `openapitools.json`:
```json
{
  "$schema": "./node_modules/@openapitools/openapi-generator-cli/config.schema.json",
  "spaces": 2,
  "generator-cli": {
    "version": "7.14.0",
    "useDocker": true,
    "dockerImageName": "openapitools/openapi-generator-cli"
  },
  "generators": {
    "typescript-fetch": {
      "generatorName": "typescript-fetch",
      "output": "./frontend/src/generated",
      "additionalProperties": {
        "supportsES6": true,
        "withInterfaces": true,
        "typescriptThreePlus": true
      }
    }
  }
}
```

### Phase 2: Generate OpenAPI Specification

#### 2.1 Create Generation Script
Add to `backend/package.json`:
```json
{
  "scripts": {
    "swagger:generate": "npm run start --watch=false & sleep 5 && curl http://localhost:${BACKEND_PORT:-3000}/api-json > openapi.json && pkill -f 'npm run start'"
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
  "name": "@ai4devs/api-client",
  "version": "1.0.0",
  "description": "TypeScript API client for AI4Devs Personal Finance Manager",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"]
}
```

#### 3.2 Add Build Scripts
Add to `backend/package.json`:
```json
{
  "scripts": {
    "codegen:client": "docker run --rm -v ${PWD}:/local openapitools/openapi-generator-cli:v7.14.0 generate -i /local/openapi.json -g typescript-fetch -o /local/src/generated",
    "codegen:package": "npm run codegen:client && npm run build:package",
    "build:package": "tsc -p tsconfig.package.json",
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

### Phase 4: Frontend Integration (NPM Approach)

#### 4.1 Install NPM Package
```bash
cd frontend
npm install @ai4devs/api-client@latest
```

#### 4.2 Update API Service
Replace `frontend/src/services/api.ts` with generated client:
```typescript
import { Configuration, TransactionsApi, CategoriesApi } from '@ai4devs/api-client';

const config = new Configuration({
  basePath: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
});

export const transactionsApi = new TransactionsApi(config);
export const categoriesApi = new CategoriesApi(config);
```

### Phase 5: Frontend Integration (Local Generation Approach)

#### 5.1 Generate TypeScript Client
Add to `frontend/package.json`:
```json
{
  "scripts": {
    "codegen:client:local": "docker run --rm -v ${PWD}:/local -v ${PWD}/../backend:/backend openapitools/openapi-generator-cli:v7.14.0 generate -i /backend/openapi.json -g typescript-fetch -o /local/src/generated"
  }
}
```

#### 5.2 Generate Client
```bash
cd frontend
npm run codegen:client:local
```

### Phase 6: Integration Test Integration

#### 6.1 Generate Test Client (NPM)
Add to root `package.json`:
```json
{
  "scripts": {
    "codegen:client:test:npm": "npm install @ai4devs/api-client@latest"
  }
}
```

#### 6.2 Generate Test Client (Local)
Add to root `package.json`:
```json
{
  "scripts": {
    "codegen:client:test:local": "docker run --rm -v ${PWD}:/local openapitools/openapi-generator-cli:v7.14.0 generate -i /local/backend/openapi.json -g typescript-fetch -o /local/test/generated"
  }
}
```

#### 6.3 Update Test Setup
Create `test/setup/api-client.setup.ts`:
```typescript
// Flexible API client setup that supports both NPM package and local generation
let apiClient: any = null;

try {
  // Try to import from NPM package first
  const npmPackage = require('@ai4devs/api-client');
  apiClient = { ...npmPackage, source: 'npm' };
} catch (error) {
  // Fallback to local generated code
  try {
    const localPackage = require('../generated');
    apiClient = { ...localPackage, source: 'local' };
  } catch (localError) {
    console.warn('No API client available');
    apiClient = null;
  }
}

export const createTestApiClient = (baseUrl?: string) => {
  if (!apiClient) {
    throw new Error('No API client available');
  }

  const config = new apiClient.Configuration({ 
    basePath: baseUrl || process.env.BACKEND_URL || 'http://localhost:3001'
  });
  
  return {
    transactions: new apiClient.TransactionsApi(config),
    categories: new apiClient.CategoriesApi(config),
    app: new apiClient.AppApi(config)
  };
};
```

## File Structure After Implementation

```
project/
├── backend/
│   ├── openapi.json              # Generated OpenAPI spec
│   ├── package.client.json       # Client package configuration
│   ├── tsconfig.package.json     # Package build configuration
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

### Maintenance
- **Single Source of Truth**: API specification drives all clients
- **Automatic Updates**: Regenerate clients when API changes
- **Consistency**: Same validation rules across frontend and tests
- **Flexible Workflows**: Support for both NPM and local approaches

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
- Build and publish NPM package

### Step 3: Frontend Integration
- Install NPM package
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
- `BACKEND_URL` - Backend API base URL (fallback)
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
- [ ] NPM package published and available
- [ ] Frontend uses generated client (100% migration)
- [ ] Integration tests use generated client (100% migration)
- [ ] Zero manual API call construction
- [ ] Type safety coverage > 95%
- [ ] Build time impact < 10%
- [ ] Repository isolation achieved

## Next Steps

1. **Review and Approve**: Team review of implementation plan
2. **Backend Setup**: Install dependencies and configure generators
3. **Package Publishing**: Generate and publish NPM package
4. **Frontend Integration**: Install package and update services
5. **Test Integration**: Update test setup and replace manual calls
6. **Documentation**: Update team workflows and processes
7. **CI/CD Integration**: Automate generation and publishing
