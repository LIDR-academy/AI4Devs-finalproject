#!/bin/bash
# CI/CD preparation script for SEPE Templates Comparator

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running in CI environment
is_ci() {
    [[ "${CI}" == "true" || "${GITHUB_ACTIONS}" == "true" || "${GITLAB_CI}" == "true" ]]
}

# Setup function for different CI providers
setup_github_actions() {
    print_status "Setting up for GitHub Actions..."
    
    mkdir -p .github/workflows
    
    cat > .github/workflows/ci.yml << 'EOF'
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

env:
  POSTGRES_DB: sepe_comparator_test
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: postgres
  JWT_SECRET_KEY: test-jwt-secret-key-for-ci
  SECRET_KEY: test-secret-key-for-ci

jobs:
  test-backend:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: sepe_comparator_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.12'
    
    - name: Cache pip packages
      uses: actions/cache@v3
      with:
        path: ~/.cache/pip
        key: ${{ runner.os }}-pip-${{ hashFiles('backend/requirements*.txt') }}
    
    - name: Install dependencies
      run: |
        cd backend
        pip install --upgrade pip
        pip install -r requirements.txt
        pip install -r requirements-dev.txt
    
    - name: Run linting
      run: |
        cd backend
        flake8 app tests
        black --check app tests
        isort --check-only app tests
        mypy app
    
    - name: Run tests
      run: |
        cd backend
        pytest tests/ -v --cov=app --cov-report=xml
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./backend/coverage.xml
        flags: backend
        name: backend-coverage

  test-frontend:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json
    
    - name: Install dependencies
      run: |
        cd frontend
        npm ci
    
    - name: Run linting
      run: |
        cd frontend
        npm run lint
        npm run type-check
    
    - name: Run tests
      run: |
        cd frontend
        npm run test:coverage
    
    - name: Build application
      run: |
        cd frontend
        npm run build

  docker-build:
    runs-on: ubuntu-latest
    needs: [test-backend, test-frontend]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Build backend image
      uses: docker/build-push-action@v5
      with:
        context: ./backend
        push: false
        tags: sepe-backend:latest
        cache-from: type=gha
        cache-to: type=gha,mode=max
    
    - name: Build frontend image
      uses: docker/build-push-action@v5
      with:
        context: ./frontend
        push: false
        tags: sepe-frontend:latest
        cache-from: type=gha
        cache-to: type=gha,mode=max
    
    - name: Test Docker Compose
      run: |
        cp env.example .env
        docker-compose config
        docker-compose up -d --build
        sleep 30
        docker-compose exec -T backend alembic upgrade head
        curl -f http://localhost:8000/api/v1/health
        docker-compose down

  security-scan:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        scan-ref: '.'
        format: 'sarif'
        output: 'trivy-results.sarif'
    
    - name: Upload Trivy scan results to GitHub Security tab
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: 'trivy-results.sarif'
EOF

    print_success "GitHub Actions workflow created"
}

setup_gitlab_ci() {
    print_status "Setting up for GitLab CI..."
    
    cat > .gitlab-ci.yml << 'EOF'
stages:
  - test
  - build
  - security

variables:
  POSTGRES_DB: sepe_comparator_test
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: postgres
  JWT_SECRET_KEY: test-jwt-secret-key-for-ci
  SECRET_KEY: test-secret-key-for-ci

test-backend:
  stage: test
  image: python:3.12
  services:
    - postgres:15
    - redis:7
  variables:
    DATABASE_URL: postgresql://postgres:postgres@postgres:5432/sepe_comparator_test
    REDIS_URL: redis://redis:6379
  before_script:
    - cd backend
    - pip install --upgrade pip
    - pip install -r requirements.txt
    - pip install -r requirements-dev.txt
  script:
    - flake8 app tests
    - black --check app tests
    - isort --check-only app tests
    - mypy app
    - pytest tests/ -v --cov=app --cov-report=xml
  coverage: '/TOTAL.+?(\d+\%)$/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: backend/coverage.xml

test-frontend:
  stage: test
  image: node:20
  before_script:
    - cd frontend
    - npm ci
  script:
    - npm run lint
    - npm run type-check
    - npm run test:coverage
    - npm run build
  artifacts:
    paths:
      - frontend/dist/
    expire_in: 1 hour

docker-build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  dependencies:
    - test-backend
    - test-frontend
  script:
    - docker build -t sepe-backend:$CI_COMMIT_SHA ./backend
    - docker build -t sepe-frontend:$CI_COMMIT_SHA ./frontend
    - cp env.example .env
    - docker-compose config
    - docker-compose up -d --build
    - sleep 30
    - docker-compose exec -T backend alembic upgrade head
    - curl -f http://localhost:8000/api/v1/health
    - docker-compose down

security-scan:
  stage: security
  image: aquasec/trivy:latest
  script:
    - trivy fs --format json --output trivy-report.json .
  artifacts:
    reports:
      container_scanning: trivy-report.json
EOF

    print_success "GitLab CI configuration created"
}

# Create environment-specific configurations
create_env_configs() {
    print_status "Creating environment-specific configurations..."
    
    # Testing environment
    cat > env.testing << 'EOF'
# Testing Environment Configuration
ENVIRONMENT=testing
DEBUG=false

# Test Database
POSTGRES_DB=sepe_comparator_test
POSTGRES_USER=test_user
POSTGRES_PASSWORD=test_password
DATABASE_URL=postgresql://test_user:test_password@localhost:5432/sepe_comparator_test

# Test Redis
REDIS_URL=redis://localhost:6379/1

# Test secrets
JWT_SECRET_KEY=test-jwt-secret-key-minimum-32-characters
SECRET_KEY=test-secret-key-minimum-32-characters

# Test settings
MAX_FILE_SIZE_MB=10
ALLOWED_HOSTS=localhost,127.0.0.1,testserver
LOG_LEVEL=WARNING
EOF

    # Staging environment
    cat > env.staging << 'EOF'
# Staging Environment Configuration
ENVIRONMENT=staging
DEBUG=false

# Staging Database (replace with actual values)
POSTGRES_DB=sepe_comparator_staging
POSTGRES_USER=staging_user
POSTGRES_PASSWORD=CHANGE_ME_IN_PRODUCTION
DATABASE_URL=postgresql://staging_user:CHANGE_ME@staging-db:5432/sepe_comparator_staging

# Staging Redis
REDIS_URL=redis://staging-redis:6379

# Staging secrets (replace with actual values)
JWT_SECRET_KEY=CHANGE_ME_IN_PRODUCTION_MINIMUM_32_CHARACTERS
SECRET_KEY=CHANGE_ME_IN_PRODUCTION_MINIMUM_32_CHARACTERS

# Staging settings
MAX_FILE_SIZE_MB=50
ALLOWED_HOSTS=staging.yourdomain.com
VITE_API_BASE_URL=https://api-staging.yourdomain.com
LOG_LEVEL=INFO
EOF

    print_success "Environment configurations created"
}

# Create Docker security configurations
setup_docker_security() {
    print_status "Setting up Docker security configurations..."
    
    # Docker security scanning
    cat > .dockerignore << 'EOF'
# Git
.git
.gitignore

# Documentation
README.md
docs/

# Environment files
.env*
env.*

# Logs
logs/
*.log

# Dependencies
node_modules/
backend/venv/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
.coverage
htmlcov/
.pytest_cache/

# Build artifacts
dist/
build/

# Temporary files
tmp/
temp/
EOF

    # Hadolint configuration
    cat > .hadolint.yaml << 'EOF'
ignored:
  - DL3008  # Pin versions in apt get install
  - DL3009  # Delete the apt-get lists after installing something
  - DL3015  # Avoid additional packages by specifying --no-install-recommends

trustedRegistries:
  - docker.io
  - gcr.io
  - registry-1.docker.io
EOF

    print_success "Docker security configurations created"
}

# Main execution
main() {
    print_status "Setting up CI/CD preparation for SEPE Templates Comparator..."
    
    # Detect CI environment and setup accordingly
    if [[ "${GITHUB_ACTIONS}" == "true" ]]; then
        setup_github_actions
    elif [[ "${GITLAB_CI}" == "true" ]]; then
        setup_gitlab_ci
    else
        print_status "No specific CI environment detected. Setting up for GitHub Actions by default."
        setup_github_actions
        print_warning "You can also run with GITLAB_CI=true for GitLab CI setup"
    fi
    
    create_env_configs
    setup_docker_security
    
    print_success "CI/CD preparation completed!"
    print_status "Next steps:"
    echo "  1. Review and customize the generated CI configuration files"
    echo "  2. Set up environment variables in your CI/CD platform"
    echo "  3. Configure deployment targets and secrets"
    echo "  4. Test the pipeline with a sample commit"
}

# Run main function
main "$@"
