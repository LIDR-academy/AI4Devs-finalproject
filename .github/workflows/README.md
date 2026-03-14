# CI/CD Workflows

This directory contains GitHub Actions workflows for the Meditation Builder project CI/CD pipeline.

## Overview

The project uses a **multi-gate CI/CD strategy** with mandatory blocking gates to ensure code quality before merging.

## Workflows

### 1. Backend CI (`backend-ci.yml`)

**Trigger**: Push to `main`, `feature/*`, or `*-compose-meditation-content` branches affecting `backend/**`

**Gates** (sequential, blocking):

1. **BDD Tests** - Cucumber/Feature tests validating business scenarios
2. **Unit Tests** - Domain and Application layer tests (hexagonal architecture)
3. **Infrastructure Tests** - Infrastructure layer integration tests
4. **Contract Tests** - OpenAPI specification validation
5. **E2E Tests** - End-to-end backend API tests
6. **Build** - Maven `clean install` with artifact upload

**Requirements**:
- Java 21 (Amazon Corretto)
- Maven
- All tests must pass for pipeline to succeed

**Artifacts**:
- Test reports (JUnit XML format)
- JAR files (7-day retention)

---

### 2. Frontend CI (`frontend-ci.yml`)

**Trigger**: Push to `main`, `feature/*`, or `*-compose-meditation-content` branches affecting `frontend/**`

**Gates** (sequential, blocking):

1. **Unit Tests** - Component and hook tests with coverage
2. **Integration Tests** - React Testing Library integration tests
3. **E2E Tests** - Playwright tests on Chromium
4. **Build** - TypeScript compilation + Vite production build

**Requirements**:
- Node.js 20
- npm dependencies
- Playwright browsers (Chromium)

**Artifacts**:
- Playwright HTML reports (7-day retention)
- Test results (7-day retention)
- Built frontend (`dist/` folder, 7-day retention)

---

## Gate Strategy

### Blocking Behavior

Each gate **must succeed** before the next gate runs. If any gate fails:
- Pipeline stops immediately
- Subsequent gates are skipped
- PR cannot be merged
- Developer must fix issues and re-push

### Gate Order Rationale

**Backend**:
1. BDD → Validate business requirements first
2. Unit → Ensure domain logic correctness
3. Infrastructure → Verify external integrations
4. Contract → Validate API contracts (OpenAPI)
5. E2E → Test complete user flows
6. Build → Create deployable artifact

**Frontend**:
1. Unit → Fast feedback on component logic
2. Integration → Verify component interactions
3. E2E → Validate user workflows end-to-end
4. Build → Ensure production build succeeds

---

## Local Testing

### Backend

```bash
cd backend

# Run all tests in order
mvn test -Dtest="**/*BDD*,**/*Cucumber*"     # BDD
mvn test -Dtest="com.hexagonal.meditationbuilder.domain.**,com.hexagonal.meditationbuilder.application.**"  # Unit
mvn test -Dtest="com.hexagonal.meditationbuilder.infrastructure.**"  # Infrastructure
mvn test -Dtest="**/*Contract*"              # Contract
mvn test -Dtest="**/*E2E*"                   # E2E
mvn clean install -DskipTests                # Build
```

### Frontend

```bash
cd frontend

# Run all gates in order
npm run test:coverage              # Unit tests with coverage
npm run test -- --run              # Integration tests
npm run test:e2e                   # E2E tests (requires dev server)
npm run build                      # Build
```

---

## Troubleshooting

### Backend CI Failures

**BDD Tests Fail**:
- Check `.feature` files in `backend/src/test/resources/features/`
- Verify step definitions match feature scenarios
- Review WireMock configurations for external services

**Unit Tests Fail**:
- Focus on domain and application layer tests
- Check for business logic errors
- Verify validators and use cases

**Contract Tests Fail**:
- Validate OpenAPI spec in `backend/src/main/resources/openapi/`
- Ensure controllers match OpenAPI contract
- Check response schemas and status codes

### Frontend CI Failures

**Unit Tests Fail**:
- Check component tests in `frontend/src/test/`
- Verify MSW mocks for API calls
- Review test coverage reports

**E2E Tests Fail**:
- Check Playwright configuration in `playwright.config.ts`
- Verify test selectors (data-testid attributes)
- Review Playwright HTML report artifact
- Check dev server startup logs

**Build Fails**:
- Verify TypeScript compilation (`tsc`)
- Check Vite build configuration
- Review import paths and dependencies

---

## Extending the Pipeline

### Adding New Gates

1. Add new job in workflow YAML
2. Set `needs: [previous-gate]` for sequential execution
3. Add job to summary dependencies
4. Update this documentation

### Modifying Test Patterns

Backend test patterns use Maven `-Dtest` parameter:
- `**/*BDD*` - BDD tests
- `com.hexagonal.meditationbuilder.domain.**` - Domain layer
- `**/*Contract*` - Contract tests

Frontend uses npm scripts:
- `npm run test` - Unit/Integration (Vitest)
- `npm run test:e2e` - E2E (Playwright)

---

## Best Practices

1. **Run tests locally** before pushing
2. **Fix failing gates immediately** - don't push more code
3. **Review test reports** in PR checks
4. **Keep tests fast** - optimize slow tests
5. **Use descriptive commit messages** for easier debugging
6. **Monitor artifact sizes** - clean up if needed

---

## Continuous Improvement

The CI/CD pipeline evolves with the project. When adding:
- **New features** → Add corresponding tests first
- **New dependencies** → Update workflow caches
- **New test types** → Add new gate or extend existing
- **Performance critical code** → Add performance benchmarks

---

## Status Badges

Add to main README.md:

```markdown
[![Backend CI](https://github.com/LIDR-academy/AI4Devs-finalproject/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/LIDR-academy/AI4Devs-finalproject/actions/workflows/backend-ci.yml)
[![Frontend CI](https://github.com/LIDR-academy/AI4Devs-finalproject/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/LIDR-academy/AI4Devs-finalproject/actions/workflows/frontend-ci.yml)
```

---

## Support

For CI/CD issues:
1. Check workflow run logs in GitHub Actions tab
2. Review this documentation
3. Test gates locally to reproduce
4. Contact DevOps team if infrastructure issues persist
