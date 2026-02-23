# Dockerfile - Multi-stage build for production
# Stage 1: Build environment
FROM ruby:3.2.2-alpine AS builder

# Install build dependencies
# Note: Node.js/Yarn are optional for Rails 7.1+ with importmap
RUN apk add --no-cache \
    build-base \
    postgresql15-dev \
    git \
    tzdata

WORKDIR /app

# Copy dependency files
COPY Gemfile Gemfile.lock ./

# Install gems
# Install production gems only (development/test gems excluded)
# If Gemfile.lock is out of sync, bundle will update it automatically
RUN bundle config set --local without 'development test' && \
    bundle install --jobs 4 --retry 3

# Copy application code
COPY . .

# Note: Rails 7.1 uses importmap, so Node.js/Yarn are not required for asset compilation
# If you need Node.js for other purposes, uncomment the following:
# RUN apk add --no-cache nodejs yarn && \
#     if [ -f package.json ]; then yarn install --frozen-lockfile --production; fi

# Precompile assets
# Set DATABASE_URL to avoid connection errors during asset compilation
# Assets compilation doesn't need database, but Rails may try to connect
# Disable database connection during asset compilation
RUN RAILS_ENV=production \
    SECRET_KEY_BASE=dummy \
    DATABASE_URL=postgresql://dummy:dummy@localhost/dummy \
    SKIP_DB_CONNECTION=true \
    bundle exec rails assets:precompile 2>&1 | tee /tmp/assets.log || (cat /tmp/assets.log && exit 1)

# Verify assets were compiled - check for manifest and at least one CSS file
RUN test -f public/assets/.sprockets-manifest-*.json && \
    test -d public/assets && \
    (ls public/assets/*.css 2>/dev/null || ls public/assets/application*.css 2>/dev/null) && \
    echo "Assets compiled successfully" || \
    (echo "ERROR: Assets not compiled properly" && ls -la public/assets/ 2>/dev/null || echo "public/assets directory does not exist" && exit 1)

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

# Copy entrypoint script from builder (it was copied in builder stage)
# Set up entrypoint script before changing user
RUN cp /app/bin/docker-entrypoint.sh /usr/local/bin/ && \
    chmod +x /usr/local/bin/docker-entrypoint.sh

# Create non-root user
RUN addgroup -g 1000 rails && \
    adduser -D -u 1000 -G rails rails && \
    chown -R rails:rails /app && \
    chmod +x /usr/local/bin/docker-entrypoint.sh

# Create necessary directories for Puma and Rails
# These directories are needed even if we don't use PID files
RUN mkdir -p tmp/pids tmp/sockets tmp/cache log && \
    chown -R rails:rails tmp log

USER rails

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Use entrypoint script to run migrations before starting server
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

# Start server
CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
