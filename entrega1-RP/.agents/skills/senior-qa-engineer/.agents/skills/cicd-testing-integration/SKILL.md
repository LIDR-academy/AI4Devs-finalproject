---
name: cicd-testing-integration
description: Integrate automated tests into CI/CD pipelines for continuous testing, including pipeline configuration, test automation strategies, reporting, and DevOps collaboration.
---

# CI/CD Testing Integration

Expert skill for integrating automated testing into CI/CD pipelines and enabling continuous quality feedback.

## When to Use

Use this skill when you need to:
- Set up test automation in CI/CD pipelines
- Configure automated test execution
- Implement continuous testing strategy
- Create test reporting dashboards
- Optimize pipeline performance
- Enable shift-left testing

## CI/CD Testing Strategy

### Test Pyramid for CI/CD

```
        /\
       /UI\         10% - E2E/UI Tests (slow, brittle)
      /────\
     /  API \       30% - Integration/API Tests
    /────────\
   /   UNIT   \     60% - Unit Tests (fast, stable)
  /────────────\
```

**Principle**: More fast tests at bottom, fewer slow tests at top

### Continuous Testing Stages

```
1. Pre-Commit
   - Unit tests (developer runs)
   - Linting/static analysis
   
2. Commit Stage (Fast - <5 min)
   - Unit tests
   - Basic smoke tests
   - Code coverage check
   
3. Acceptance Stage (Medium - 15-30 min)
   - Integration tests
   - API tests
   - Component tests
   
4. Deployment Stage (Slower - 30-60 min)
   - E2E tests
   - Security scans
   - Performance tests
   
5. Production Monitoring
   - Synthetic tests
   - Health checks
   - User monitoring
```

## Pipeline Configuration Examples

### GitHub Actions

```yaml
name: CI Testing Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run unit tests
        run: npm run test:unit
        
      - name: Check coverage
        run: npm run test:coverage
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        
  integration-tests:
    needs: unit-tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Start services
        run: docker-compose up -d
        
      - name: Run integration tests
        run: npm run test:integration
        
      - name: Stop services
        run: docker-compose down
        
  e2e-tests:
    needs: integration-tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Playwright
        run: npx playwright install --with-deps
        
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

### Jenkins Pipeline

```groovy
pipeline {
    agent any
    
    stages {
        stage('Unit Tests') {
            steps {
                sh 'npm run test:unit'
            }
            post {
                always {
                    junit 'test-results/unit/*.xml'
                }
            }
        }
        
        stage('Integration Tests') {
            steps {
                sh 'docker-compose up -d'
                sh 'npm run test:integration'
            }
            post {
                always {
                    sh 'docker-compose down'
                    junit 'test-results/integration/*.xml'
                }
            }
        }
        
        stage('E2E Tests') {
            when {
                branch 'main'
            }
            steps {
                sh 'npm run test:e2e'
            }
            post {
                always {
                    publishHTML([
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'E2E Test Report'
                    ])
                }
            }
        }
        
        stage('Deploy to QA') {
            when {
                branch 'develop'
            }
            steps {
                sh './deploy-qa.sh'
            }
        }
    }
    
    post {
        failure {
            mail to: 'qa-team@company.com',
                 subject: "Pipeline Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                 body: "Check ${env.BUILD_URL}"
        }
    }
}
```

## Test Automation Best Practices

### 1. Fast Feedback
- Unit tests: < 5 minutes
- Integration tests: < 15 minutes
- E2E tests: < 30 minutes
- Run most critical tests first

### 2. Test Independence
- Tests don't depend on each other
- Can run in any order
- Can run in parallel
- Clean state before/after each test

### 3. Stable Tests
- No flaky tests in pipeline
- Quarantine unstable tests
- Fix or remove, don't ignore
- Monitor flake rate

### 4. Meaningful Failures
- Clear error messages
- Attach screenshots/logs
- Show exact failure point
- Link to relevant code

### 5. Selective Execution
- Run affected tests only
- Full regression nightly
- Smoke tests on every commit
- Performance tests weekly

## Test Reporting & Dashboards

### Test Results Format

```json
{
  "summary": {
    "total": 250,
    "passed": 245,
    "failed": 3,
    "skipped": 2,
    "duration": "12m 34s",
    "passRate": "98%"
  },
  "failures": [
    {
      "test": "Login with invalid password",
      "error": "Expected 401, got 500",
      "screenshot": "failure-1.png",
      "trace": "error.log"
    }
  ]
}
```

### Dashboard Metrics

Track and display:
- ✓ **Build Success Rate**: Passing builds / Total builds
- ✓ **Test Pass Rate**: Passing tests / Total tests
- ✓ **Code Coverage**: Lines covered / Total lines
- ✓ **Build Duration**: Average time per stage
- ✓ **Flaky Test Rate**: Inconsistent tests / Total
- ✓ **MTTR**: Mean time to repair failing builds

### Alerting Rules

```
Critical Alerts:
- Build fails on main branch → Slack + Email
- Test pass rate < 95% → Team notification
- Security vulnerability found → Immediate action

Warning Alerts:
- Build duration > 30 minutes → Optimize
- Code coverage decreased → Review
- Flaky test detected → Investigate
```

## Optimization Strategies

### Parallel Execution

```yaml
# Parallelize test suites
jobs:
  test:
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
    steps:
      - run: npm run test:e2e -- --shard=${{ matrix.shard }}/4
```

### Caching Dependencies

```yaml
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}
```

### Smart Test Selection

```bash
# Only run tests affected by changes
changed_files=$(git diff --name-only HEAD~1)
npm run test:selective --files="$changed_files"
```

### Docker Layer Caching

```dockerfile
# Optimize Docker builds
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Dependencies cached here
```

## Environment Management

### Test Environments

```
Development → Integration → QA → Staging → Production
     ↓            ↓          ↓       ↓          ↓
  Unit Tests   API Tests  E2E Tests  Smoke    Monitoring
```

### Configuration Management

```javascript
// config/test.env.js
module.exports = {
  qa: {
    apiUrl: 'https://api-qa.company.com',
    dbHost: 'db-qa.company.com'
  },
  staging: {
    apiUrl: 'https://api-staging.company.com',
    dbHost: 'db-staging.company.com'
  }
};
```

## Integration Patterns

### 1. Pull Request Validation
```
PR Created → Run unit & integration tests
          → Pass? Merge allowed : Block merge
```

### 2. Continuous Deployment
```
Commit → Build → Test → Deploy QA → E2E Tests → Deploy Staging
```

### 3. Nightly Regression
```
Scheduled: 2 AM → Full test suite → Report to team
```

### 4. On-Demand Testing
```
Manual Trigger → Select test suite → Run → Report results
```

## Monitoring & Maintenance

### Pipeline Health

Monitor:
- Build failure trends
- Test execution time trends
- Infrastructure costs
- Resource utilization

### Test Maintenance

Regular activities:
- Remove obsolete tests
- Update flaky tests
- Optimize slow tests
- Review test coverage
- Update test data

## Best Practices

- ✓ Keep pipelines fast (< 10 min for commit stage)
- ✓ Fail fast (run fastest tests first)
- ✓ Run tests in parallel when possible
- ✓ Use containers for consistency
- ✓ Version control everything (code, tests, configs)
- ✓ Secure secrets and credentials
- ✓ Monitor and optimize continuously
- ✓ Make failures visible and actionable
- ✓ Automate as much as possible
- ✓ Collaborate with DevOps team
