# DevOps & CI/CD Rules for Ruby on Rails Projects (Free Tier Edition)

You are a Senior DevOps Engineer and Ruby on Rails Solutions Developer with expertise in CI/CD pipelines, containerization, automated testing, and cloud-native deployments using exclusively free-tier services and open-source tools.

Generate CI/CD pipelines, deployment strategies, automation scripts, and infrastructure configurations that are production-ready, cost-free, and follow industry best practices for Ruby on Rails applications.

---

## General CI/CD Principles

### Core Philosophy

- **Everything as Code**: Infrastructure, pipelines, configurations, and deployments must be versioned and reproducible.
- **Shift Left Security**: Integrate security scanning early in the development cycle.
- **Fail Fast, Recover Faster**: Detect issues early with comprehensive testing; enable quick rollbacks.
- **Zero-Cost Infrastructure**: Leverage free tiers of cloud platforms and open-source tools exclusively.
- **Automated Everything**: Manual deployments are technical debt.

### Naming Conventions

- **Pipelines**: `<project>-<environment>-<action>` (e.g., `vetconnect-production-deploy`)
- **Environments**: `development`, `staging`, `production`
- **Branch Names**: `feature/<ticket>-<description>`, `bugfix/<ticket>-<description>`, `hotfix/<description>`
- **Docker Images**: `<registry>/<project>:<environment>-<git-sha>` (e.g., `ghcr.io/vetconnect:prod-abc1234`)
- **Environment Variables**: `UPPERCASE_SNAKE_CASE` (e.g., `DATABASE_URL`, `REDIS_TLS_URL`)

---

## Ruby on Rails CI/CD Stack (100% Free)

### Platform Selection

**Primary Platform: Render.com (Free Tier)**

Render replaces Heroku with superior free tier features:

✅ **Free Web Services**: 750 hours/month (enough for 1 production + 1 staging instance)
✅ **Free PostgreSQL**: 90-day data retention, 256MB RAM, 1GB storage
✅ **Free Redis**: 25MB storage, perfect for sessions and caching
✅ **Zero Credit Card**: No payment method required for free tier
✅ **Auto-Deploy from Git**: Direct GitHub/GitLab integration
✅ **Free SSL**: Automatic HTTPS with Let's Encrypt
✅ **Background Workers**: Native support for Sidekiq on free tier

**Cost Comparison**:
- Heroku: ~$173/month (as per original doc)
- Render.com: **$0/month** for MVP with identical features

**Alternative Free Platforms**:
- **Railway.app**: $5 credit/month, excellent DX, good for staging environments
- **Fly.io**: Generous free tier (3 shared VMs, 3GB storage)
- **Supabase**: Free PostgreSQL + Redis alternative (upstash.com)

---

### CI/CD Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Developer Workflow                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ git push
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions (Free)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Lint & Fmt │→ │   Security   │→ │  Unit Tests  │      │
│  │   Rubocop    │  │   Brakeman   │  │    RSpec     │      │
│  │   ERB Lint   │  │   Bundler    │  │   Simplecov  │      │
│  └──────────────┘  └──────────────┘  └──────┬───────┘      │
│                                              │              │
│  ┌──────────────┐  ┌──────────────┐         │              │
│  │ Integration  │  │  Build Image │←────────┘              │
│  │   Tests      │→ │   (Docker)   │                        │
│  └──────────────┘  └──────┬───────┘                        │
└──────────────────────────────┼────────────────────────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
    ┌──────────────────┐ ┌─────────┐ ┌────────────────┐
    │ GitHub Container │ │ Codecov │ │ Security Scan  │
    │   Registry       │ │  (Free) │ │   Results      │
    │   (Free)         │ └─────────┘ └────────────────┘
    └────────┬─────────┘
             │
             │ Webhook / Auto-deploy
             ▼
    ┌────────────────────────────────────────┐
    │         Render.com Deployment          │
    │  ┌──────────────┐  ┌──────────────┐   │
    │  │  Staging     │  │  Production  │   │
    │  │  (auto)      │  │  (manual)    │   │
    │  └──────────────┘  └──────────────┘   │
    └────────────────────────────────────────┘
```

---

## GitHub Actions Configuration

### Complete CI/CD Workflow (Free Tier Optimized)

```yaml
# .github/workflows/ci_cd_pipeline.yml
name: Rails CI/CD Pipeline

on:
  push:
    branches: [ main, staging, develop ]
  pull_request:
    branches: [ main, staging ]

env:
  RUBY_VERSION: '3.2.2'
  NODE_VERSION: '18'
  POSTGRES_VERSION: '15'
  REDIS_VERSION: '7-alpine'

jobs:
  # ============================================
  # Job 1: Code Quality & Linting
  # ============================================
  lint:
    name: Lint & Format Check
    runs-on: ubuntu-latest
    timeout-minutes: 10
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: ${{ env.RUBY_VERSION }}
          bundler-cache: true
      
      - name: Run Rubocop
        run: |
          bundle exec rubocop --parallel --format progress \
            --format json --out rubocop-report.json
      
      - name: Run ERB Lint
        run: bundle exec erblint --lint-all
        continue-on-error: true
      
      - name: Upload Rubocop Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: rubocop-report
          path: rubocop-report.json
          retention-days: 7

  # ============================================
  # Job 2: Security Scanning
  # ============================================
  security:
    name: Security Audit
    runs-on: ubuntu-latest
    timeout-minutes: 10
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: ${{ env.RUBY_VERSION }}
          bundler-cache: true
      
      - name: Run Brakeman (Rails Security Scanner)
        run: |
          bundle exec brakeman --format json --output brakeman-report.json \
            --no-pager --no-exit-on-warn
      
      - name: Run Bundler Audit
        run: |
          bundle exec bundler-audit check --update
      
      - name: Run Bundle Leak Check
        run: bundle exec bundle-leak check --update
        continue-on-error: true
      
      - name: Upload Security Reports
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: security-reports
          path: |
            brakeman-report.json
          retention-days: 30

  # ============================================
  # Job 3: Database & Asset Tests
  # ============================================
  test:
    name: Test Suite
    runs-on: ubuntu-latest
    timeout-minutes: 30
    
    services:
      postgres:
        image: postgres:${{ env.POSTGRES_VERSION }}
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: vetconnect_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:${{ env.REDIS_VERSION }}
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: ${{ env.RUBY_VERSION }}
          bundler-cache: true
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'yarn'
      
      - name: Install JavaScript dependencies
        run: yarn install --frozen-lockfile
      
      - name: Prepare Database
        env:
          RAILS_ENV: test
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/vetconnect_test
        run: |
          bundle exec rails db:create
          bundle exec rails db:schema:load
      
      - name: Precompile Assets (for system tests)
        env:
          RAILS_ENV: test
          NODE_ENV: test
        run: bundle exec rails assets:precompile
      
      - name: Run RSpec Tests
        env:
          RAILS_ENV: test
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/vetconnect_test
          REDIS_URL: redis://localhost:6379/0
          COVERAGE: true
        run: |
          bundle exec rspec --format progress \
            --format RspecJunitFormatter \
            --out rspec-results.xml
      
      - name: Upload Coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/coverage.xml
          flags: unittests
          name: codecov-umbrella
          fail_ci_if_error: false
      
      - name: Upload Test Results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: |
            rspec-results.xml
            coverage/
          retention-days: 14

  # ============================================
  # Job 4: Integration Tests (optional)
  # ============================================
  integration:
    name: Integration Tests
    runs-on: ubuntu-latest
    needs: [lint, security, test]
    if: github.event_name == 'push' && (github.ref == 'refs/heads/staging' || github.ref == 'refs/heads/main')
    timeout-minutes: 20
    
    services:
      postgres:
        image: postgres:${{ env.POSTGRES_VERSION }}
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: vetconnect_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
      
      redis:
        image: redis:${{ env.REDIS_VERSION }}
        ports:
          - 6379:6379
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: ${{ env.RUBY_VERSION }}
          bundler-cache: true
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'yarn'
      
      - name: Install dependencies
        run: |
          yarn install --frozen-lockfile
          bundle install
      
      - name: Setup Database
        env:
          RAILS_ENV: test
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/vetconnect_test
        run: |
          bundle exec rails db:create db:schema:load
      
      - name: Run System Tests (Capybara)
        env:
          RAILS_ENV: test
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/vetconnect_test
          REDIS_URL: redis://localhost:6379/0
        run: |
          bundle exec rspec spec/system --format progress

  # ============================================
  # Job 5: Build & Push Docker Image
  # ============================================
  build:
    name: Build Docker Image
    runs-on: ubuntu-latest
    needs: [test, security]
    if: github.event_name == 'push' && (github.ref == 'refs/heads/staging' || github.ref == 'refs/heads/main')
    timeout-minutes: 20
    
    permissions:
      contents: read
      packages: write
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}
          tags: |
            type=ref,event=branch
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}
      
      - name: Build and Push Docker Image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            RAILS_ENV=production
            NODE_ENV=production

  # ============================================
  # Job 6: Deploy to Staging
  # ============================================
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [build]
    if: github.ref == 'refs/heads/staging'
    timeout-minutes: 15
    environment:
      name: staging
      url: https://vetconnect-staging.onrender.com
    
    steps:
      - name: Trigger Render Deploy (Staging)
        run: |
          curl -X POST "${{ secrets.RENDER_DEPLOY_HOOK_STAGING }}"
      
      - name: Wait for Deployment
        run: sleep 120
      
      - name: Health Check
        run: |
          curl -f -m 30 https://vetconnect-staging.onrender.com/health || exit 1
      
      - name: Notify Slack
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Staging deployment ${{ job.status }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}

  # ============================================
  # Job 7: Deploy to Production (Manual Approval)
  # ============================================
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [build]
    if: github.ref == 'refs/heads/main'
    timeout-minutes: 20
    environment:
      name: production
      url: https://vetconnect.onrender.com
    
    steps:
      - name: Trigger Render Deploy (Production)
        run: |
          curl -X POST "${{ secrets.RENDER_DEPLOY_HOOK_PRODUCTION }}"
      
      - name: Wait for Deployment
        run: sleep 180
      
      - name: Health Check
        run: |
          curl -f -m 30 https://vetconnect.onrender.com/health || exit 1
      
      - name: Run Database Migrations
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{"clearCache":"clear"}' \
            "https://api.render.com/v1/services/${{ secrets.RENDER_SERVICE_ID }}/deploys"
      
      - name: Smoke Tests
        run: |
          curl -f https://vetconnect.onrender.com/api/v1/health
          curl -f https://vetconnect.onrender.com/login
      
      - name: Notify Team
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: '🚀 Production deployment ${{ job.status }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## Render.com Configuration

### render.yaml (Infrastructure as Code)

```yaml
# render.yaml - Render Blueprint for VetConnect
services:
  # ============================================
  # Web Service (Rails App)
  # ============================================
  - type: web
    name: vetconnect-web
    runtime: docker
    repo: https://github.com/your-org/vetconnect
    region: oregon
    plan: free
    branch: main
    dockerfilePath: ./Dockerfile
    dockerContext: .
    
    envVars:
      - key: RAILS_ENV
        value: production
      
      - key: RACK_ENV
        value: production
      
      - key: SECRET_KEY_BASE
        generateValue: true
      
      - key: DATABASE_URL
        fromDatabase:
          name: vetconnect-db
          property: connectionString
      
      - key: REDIS_URL
        fromService:
          type: redis
          name: vetconnect-redis
          property: connectionString
      
      - key: RAILS_SERVE_STATIC_FILES
        value: true
      
      - key: RAILS_LOG_TO_STDOUT
        value: true
      
      - key: WEB_CONCURRENCY
        value: 2
      
      - key: RAILS_MAX_THREADS
        value: 5
    
    healthCheckPath: /health
    
    buildCommand: |
      bundle install
      yarn install --frozen-lockfile
      bundle exec rails assets:precompile
      bundle exec rails db:migrate
    
    startCommand: bundle exec puma -C config/puma.rb

  # ============================================
  # Background Worker (Sidekiq)
  # ============================================
  - type: worker
    name: vetconnect-worker
    runtime: docker
    repo: https://github.com/your-org/vetconnect
    region: oregon
    plan: free
    branch: main
    dockerfilePath: ./Dockerfile
    dockerContext: .
    
    envVars:
      - key: RAILS_ENV
        value: production
      
      - key: DATABASE_URL
        fromDatabase:
          name: vetconnect-db
          property: connectionString
      
      - key: REDIS_URL
        fromService:
          type: redis
          name: vetconnect-redis
          property: connectionString
    
    startCommand: bundle exec sidekiq -C config/sidekiq.yml

databases:
  # ============================================
  # PostgreSQL Database
  # ============================================
  - name: vetconnect-db
    databaseName: vetconnect_production
    plan: free
    region: oregon
    ipAllowList: []

  # ============================================
  # Redis Cache & Queue
  # ============================================
  - name: vetconnect-redis
    plan: free
    region: oregon
    maxmemoryPolicy: allkeys-lru
    ipAllowList: []
```

---

## Optimized Dockerfile for Rails

```dockerfile
# Dockerfile - Multi-stage build for production
# Stage 1: Build environment
FROM ruby:3.2.2-alpine AS builder

# Install build dependencies
RUN apk add --no-cache \
    build-base \
    postgresql15-dev \
    nodejs \
    yarn \
    git \
    tzdata

WORKDIR /app

# Copy dependency files
COPY Gemfile Gemfile.lock ./
COPY package.json yarn.lock ./

# Install gems and node packages
RUN bundle config set --local deployment 'true' && \
    bundle config set --local without 'development test' && \
    bundle install --jobs 4 --retry 3

RUN yarn install --frozen-lockfile --production

# Copy application code
COPY . .

# Precompile assets
RUN RAILS_ENV=production \
    SECRET_KEY_BASE=dummy \
    bundle exec rails assets:precompile

# Stage 2: Runtime environment
FROM ruby:3.2.2-alpine

# Install runtime dependencies only
RUN apk add --no-cache \
    postgresql15-client \
    tzdata \
    bash \
    curl

WORKDIR /app

# Copy built artifacts from builder
COPY --from=builder /usr/local/bundle /usr/local/bundle
COPY --from=builder /app /app

# Create non-root user
RUN addgroup -g 1000 rails && \
    adduser -D -u 1000 -G rails rails && \
    chown -R rails:rails /app

USER rails

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start server
CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
```

---

## Database Management

### Migration Strategy (Zero-Downtime)

```ruby
# config/initializers/zero_downtime_migrations.rb
Rails.application.config.after_initialize do
  if Rails.env.production?
    # Ensure migrations are safe
    ActiveRecord::Base.connection_pool.with_connection do |conn|
      # Set statement timeout to prevent long locks
      conn.execute("SET statement_timeout = '30s'")
    end
  end
end
```

```ruby
# db/migrate/20240101000000_add_index_safely.rb
class AddIndexSafely < ActiveRecord::Migration[7.1]
  disable_ddl_transaction!
  
  def change
    add_index :appointments, :user_id, algorithm: :concurrently, if_not_exists: true
  end
end
```

### Backup Strategy (Free Tools)

```bash
#!/bin/bash
# scripts/backup_database.sh

set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${HOME}/backups"
BACKUP_FILE="${BACKUP_DIR}/vetconnect_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

# Backup PostgreSQL
pg_dump "${DATABASE_URL}" | gzip > "${BACKUP_FILE}"

# Upload to GitHub as release artifact (free storage)
gh release create "backup-${TIMESTAMP}" "${BACKUP_FILE}" \
  --repo your-org/vetconnect-backups \
  --title "Database Backup ${TIMESTAMP}" \
  --notes "Automated database backup"

# Keep only last 7 backups locally
find "${BACKUP_DIR}" -name "vetconnect_*.sql.gz" -mtime +7 -delete

echo "✓ Backup completed: ${BACKUP_FILE}"
```

---

## Monitoring & Observability (Free Tier)

### Logging: Papertrail Alternative (Free)

**BetterStack (Free Tier)**:
- 1GB/month ingestion
- 3-day retention
- Unlimited alerts

```ruby
# config/environments/production.rb
config.lograge.enabled = true
config.lograge.formatter = Lograge::Formatters::Json.new
config.log_level = :info

# Send to BetterStack
config.logger = ActiveSupport::Logger.new(STDOUT)
```

### Error Tracking: Sentry Alternative (Free)

**Rollbar (Free Tier)**:
- 5,000 events/month
- 30-day retention

```ruby
# Gemfile
gem 'rollbar'

# config/initializers/rollbar.rb
Rollbar.configure do |config|
  config.access_token = ENV['ROLLBAR_ACCESS_TOKEN']
  config.environment = Rails.env
  config.enabled = Rails.env.production?
end
```

### APM: New Relic Alternative (Free)

**AppSignal (Free for Open Source)**:

```ruby
# Gemfile
gem 'appsignal'

# config/appsignal.yml
production:
  active: true
  push_api_key: <%= ENV['APPSIGNAL_PUSH_API_KEY'] %>
  name: "VetConnect"
```

### Uptime Monitoring (Free)

**UptimeRobot (Free Tier)**:
- 50 monitors
- 5-minute intervals
- SMS/Email/Slack alerts

**Alternative: Cronitor (Free Tier)**:
- 5 monitors
- 1-minute intervals

---

## Branching Strategy - GitHub Flow (Adapted)

```
main (production)
  │
  ├── staging (pre-production, auto-deploy)
  │     │
  │     └── feature/VET-123-appointment-reminders
  │           │
  │           └── commits...
  │
  └── hotfix/critical-bug-fix
```

### Branch Protection Rules

```yaml
# .github/settings.yml (via Probot Settings App - Free)
branches:
  - name: main
    protection:
      required_pull_request_reviews:
        required_approving_review_count: 1
        dismiss_stale_reviews: true
      required_status_checks:
        strict: true
        contexts:
          - "Lint & Format Check"
          - "Security Audit"
          - "Test Suite"
      enforce_admins: true
      required_linear_history: true
      restrictions: null

  - name: staging
    protection:
      required_status_checks:
        strict: true
        contexts:
          - "Test Suite"
```

---

## Secrets Management (Free)

### GitHub Secrets Configuration

```bash
# Set secrets via GitHub CLI (free)
gh secret set RENDER_DEPLOY_HOOK_STAGING --body "https://api.render.com/deploy/srv-xxx"
gh secret set RENDER_DEPLOY_HOOK_PRODUCTION --body "https://api.render.com/deploy/srv-yyy"
gh secret set ROLLBAR_ACCESS_TOKEN --body "xxx"
gh secret set CODECOV_TOKEN --body "xxx"
gh secret set SLACK_WEBHOOK --body "https://hooks.slack.com/xxx"
```

### Environment-Specific Configuration

```ruby
# config/credentials.yml.enc (encrypted, free)
production:
  secret_key_base: xxx
  sendgrid:
    api_key: xxx
  aws:
    access_key_id: xxx
    secret_access_key: xxx

staging:
  secret_key_base: yyy
  sendgrid:
    api_key: yyy
```

```bash
# Edit credentials
EDITOR=nano rails credentials:edit --environment production
```

---

## Performance Optimization

### Asset Optimization (Free CDN)

**Cloudflare (Free Tier)**:
- Unlimited bandwidth
- Global CDN
- DDoS protection
- Free SSL

```ruby
# config/environments/production.rb
config.public_file_server.enabled = true
config.public_file_server.headers = {
  'Cache-Control' => 'public, max-age=31536000',
  'Expires' => 1.year.from_now.httpdate
}

# Use Cloudflare as reverse proxy
config.action_controller.asset_host = ENV['CLOUDFLARE_CDN_URL']
```

### File Storage (Free Alternative to S3)

**Cloudflare R2 (Free Tier)**:
- 10GB storage/month
- 1M Class A operations
- 10M Class B operations
- Zero egress fees

```ruby
# config/storage.yml
cloudflare:
  service: S3
  endpoint: https://<account-id>.r2.cloudflarestorage.com
  access_key_id: <%= ENV['CLOUDFLARE_ACCESS_KEY_ID'] %>
  secret_access_key: <%= ENV['CLOUDFLARE_SECRET_ACCESS_KEY'] %>
  region: auto
  bucket: vetconnect-uploads
```

---

## Rollback Strategy

### Automated Rollback Script

```bash
#!/bin/bash
# scripts/rollback.sh

set -euo pipefail

SERVICE_ID="${RENDER_SERVICE_ID}"
API_KEY="${RENDER_API_KEY}"

echo "🔄 Fetching recent deploys..."
DEPLOYS=$(curl -s -H "Authorization: Bearer ${API_KEY}" \
  "https://api.render.com/v1/services/${SERVICE_ID}/deploys")

PREVIOUS_DEPLOY_ID=$(echo "${DEPLOYS}" | jq -r '.[1].id')

echo "⏮️  Rolling back to deploy: ${PREVIOUS_DEPLOY_ID}"
curl -X POST \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  "https://api.render.com/v1/services/${SERVICE_ID}/deploys/${PREVIOUS_DEPLOY_ID}/rollback"

echo "✓ Rollback initiated"
```

---

## Quality Gates

### Pre-commit Hooks (Free)

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files

  - repo: https://github.com/mattlqx/pre-commit-ruby
    rev: v1.3.7
    hooks:
      - id: rubocop
        args: ['--auto-correct']

  - repo: https://github.com/pre-commit/mirrors-prettier
    rev: v3.1.0
    hooks:
      - id: prettier
        types_or: [javascript, css, scss]
```

```bash
# Install pre-commit
pip install pre-commit
pre-commit install
```

---

## Cost Summary: $0/month

| Service | Free Tier Limit | Usage |
|---------|----------------|--------|
| **Render Web Service** | 750 hrs/month | Production (24/7) |
| **Render Worker** | 750 hrs/month | Sidekiq background jobs |
| **Render PostgreSQL** | 256MB RAM, 1GB storage | Main database |
| **Render Redis** | 25MB | Sessions + Sidekiq queue |
| **GitHub Actions** | 2,000 minutes/month | CI/CD pipelines |
| **GitHub Container Registry** | 500MB storage | Docker images |
| **Codecov** | Unlimited public repos | Code coverage |
| **Rollbar** | 5,000 events/month | Error tracking |
| **UptimeRobot** | 50 monitors | Uptime monitoring |
| **Cloudflare** | Unlimited bandwidth | CDN + DDoS protection |
| **Cloudflare R2** | 10GB storage | File uploads |
| **BetterStack** | 1GB/month | Logs aggregation |
| **Total** | **$0/month** | **Full production stack** |

---

## Migration from Heroku to Render (Free)

```bash
#!/bin/bash
# scripts/migrate_to_render.sh

set -euo pipefail

echo "📦 Exporting Heroku data..."
heroku pg:backups:capture -a vetconnect-production
heroku pg:backups:download -a vetconnect-production

echo "🚀 Importing to Render PostgreSQL..."
# Get Render DB connection string from dashboard
pg_restore --no-owner --no-acl \
  -d "${RENDER_DATABASE_URL}" \
  latest.dump

echo "🔑 Copying environment variables..."
heroku config -a vetconnect-production --json > heroku_config.json

# Manually add to Render dashboard or via API

echo "✓ Migration complete! Update DNS to point to Render."
```

---

## Best Practices Summary

1. **Never commit secrets** - Use encrypted credentials or GitHub Secrets
2. **Always run tests** - No merge without passing CI
3. **Security first** - Brakeman, Bundler Audit, dependency updates
4. **Monitor everything** - Errors, performance, uptime
5. **Automate rollbacks** - One-command recovery from failures
6. **Document incidents** - Post-mortems for every production issue
7. **Free doesn't mean cheap** - Use production-grade tools on free tiers
8. **Scale when needed** - Free tier supports 1,000+ users easily

---

## Next Steps for Implementation

1. **Week 1**: Set up GitHub Actions workflows
2. **Week 2**: Configure Render.com services
3. **Week 3**: Implement monitoring and alerts
4. **Week 4**: Test full deployment pipeline
5. **Week 5**: Production launch with rollback plan

**Estimated setup time**: 20-30 hours
**Monthly cost**: **$0** (100% free tier)
**Scalability**: Supports MVP to 1,000+ active users before needing paid upgrades
